#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { MAX_TTS_CHARS, chunkTtsText } from "./lib/tts-chunker.mjs";
import { putFileIfChanged, readR2Config } from "./lib/r2-client.mjs";
import { bytesPerSecond, parseWav, sameFormat, silence, writeWav } from "./lib/wav.mjs";
import {
  download,
  login,
  makeClient,
  readCredentials,
  resolveVoice,
  sniffExt,
  synthesize,
} from "./lib/tvoiceai-client.mjs";

// tvoiceai-chapter-tts.mjs — synthesize a chapter transcript into ONE audio file.
//
// The tvoiceai job API glitches on long single inputs (neural attention repeats
// a phrase, nondeterministic), so each section is sent whole when possible and
// otherwise split into sentence-aware requests of at most 512 characters, with:
//   - a parallel job pool,
//   - a relative duration heuristic (block chars/sec vs corpus median) that
//     retries outliers once,
//   - no client-side silence between requests or sections by default.
//
// Delivery is a single chapter track plus a marker sidecar, because the reader
// plays one continuous audio and only uses sections to label and seek within it:
//   <outdir>/<slug>.<locale>.wav          full chapter PCM
//   <outdir>/<slug>.<locale>.mp3          full chapter MP3 (with --mp3/--upload)
//   <outdir>/<slug>.<locale>.sections.json  marker offsets into that track
//
// Usage:
//   node --env-file=.env scripts/tvoiceai-chapter-tts.mjs <slug> <locale> \
//     [--voice <id|name>] [--outdir dir] [--sections sec-00,sec-01] \
//     [--jobs 4] [--speed 1] [--gap-block 0] [--gap-section 0] [--user U --pass P]
const CHAPTERS = "content/chapters";

function runCommand(command, args, label) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${label}: ${command} exited with status ${result.status}`);
}

function convertToMp3(wavFile) {
  const mp3File = wavFile.replace(/\.wav$/i, ".mp3");
  runCommand(
    "ffmpeg",
    ["-y", "-i", wavFile, "-codec:a", "libmp3lame", "-b:a", "192k", mp3File],
    `MP3 conversion failed for ${wavFile}`,
  );
  return mp3File;
}

// --- synthesis ---

// Simple concurrency pool: run `jobs` workers over the unit list.
async function pool(units, jobs, fn) {
  let next = 0;
  const workers = Array.from({ length: Math.min(jobs, units.length) }, async () => {
    while (next < units.length) { const u = units[next++]; await fn(u); }
  });
  await Promise.all(workers);
}

// The API allows one in-flight job per user and rate-limits extra submissions
// ("Vui lòng đợi 3 giây"). Retrying the submit with backoff lets the parallel
// pool queue naturally: losers re-poll until the slot frees.
async function synthUnit(api, u) {
  if (!u.text || u.text.length > MAX_TTS_CHARS) {
    throw new Error(`${u.sectionId}#${u.index}: TTS chunk must contain 1-${MAX_TTS_CHARS} characters`);
  }
  const dir = path.join(u.outdir, ".parts");
  fs.mkdirSync(dir, { recursive: true });
  const base = path.join(dir, `${u.sectionId}-${String(u.index).padStart(3, "0")}`);
  const payload = { text: u.text, flow: u.flow, voice: u.voice, speed: u.speed, format: "wav" };
  let url = null;
  for (let i = 0; i < 150; i++) {
    try { url = await synthesize(api, payload); break; }
    catch (e) {
      if (!/Hệ thống đang xử lý|Vui lòng đợi/i.test(e.message) || i === 149) throw e;
      await new Promise((r) => setTimeout(r, 4000));
    }
  }
  const file = await download(url, base);
  const buf = fs.readFileSync(file);
  if (sniffExt(buf) !== "wav") throw new Error(`${file}: server returned non-wav audio, cannot concatenate`);
  const wav = parseWav(buf);
  return { unit: u, file, wav };
}

// --- cli ---

function parseArgs(args) {
  const opts = {
    voice: "Nhật Phong",
    outdir: null,
    sections: null,
    jobs: 4,
    speed: 1.0,
    gapBlock: 0,
    gapSection: 0,
    user: null,
    pass: null,
    mp3: false,
    upload: false,
  };
  const positional = [];
  const map = {
    "--voice": "voice",
    "--outdir": "outdir",
    "--sections": "sections",
    "--jobs": "jobs",
    "--speed": "speed",
    "--gap-block": "gapBlock",
    "--gap-section": "gapSection",
    "--user": "user",
    "--pass": "pass",
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--mp3") opts.mp3 = true;
    else if (args[i] === "--upload") opts.upload = true;
    else if (map[args[i]]) opts[map[args[i]]] = args[++i];
    else positional.push(args[i]);
  }
  opts.jobs = parseInt(opts.jobs, 10);
  opts.speed = parseFloat(opts.speed);
  opts.gapBlock = parseFloat(opts.gapBlock);
  opts.gapSection = parseFloat(opts.gapSection);
  opts.sections = opts.sections ? opts.sections.split(",").map((s) => s.trim()).filter(Boolean) : null;
  opts.mp3 ||= opts.upload;
  return { opts, positional };
}

const [slug, locale, ...rest] = process.argv.slice(2);
const { opts } = parseArgs(rest);

try {
  if (!slug || !["en", "vi"].includes(locale)) {
    throw new Error("usage: tvoiceai-chapter-tts.mjs <slug> <en|vi> [--voice <id|name>] [--sections sec-00,sec-01] [--jobs 4] [--mp3] [--upload]");
  }
  const transcript = JSON.parse(fs.readFileSync(path.join(CHAPTERS, slug, `${locale}.transcript.json`), "utf8"));
  const outdir = opts.outdir || path.join("tts-out", `${slug}.${locale}`);
  fs.mkdirSync(outdir, { recursive: true });

  // Flatten to speech units: chapter title first (it opens the audio), then one
  // normalized text stream per section. A section stays in one request when it
  // fits; otherwise only complete sentences overflow into later requests.
  const units = [];
  const wantSec = (id) => !opts.sections || opts.sections.includes(id);
  const addChunks = (sectionId, value, kind) => {
    for (const text of chunkTtsText(value)) {
      units.push({ sectionId, index: units.length, text, kind });
    }
  };
  if (transcript.title && wantSec("sec-00")) addChunks("sec-00", transcript.title, "title");
  for (const s of transcript.sections) {
    if (!wantSec(s.id)) continue;
    addChunks(s.id, s.blocks.map((block) => block.text).join(" "), "section");
  }
  if (!units.length) throw new Error("no speakable units (check --sections filter)");

  const api = makeClient(await login(readCredentials(opts)));
  const voiceCfg = await resolveVoice(String(opts.voice), api);
  console.log(`${slug}/${locale}: ${units.length} units, ${units.reduce((n, u) => n + u.text.length, 0)} chars, voice ${voiceCfg.voice} [${voiceCfg.flow}], ${opts.jobs} jobs`);

  // Pass 1: synthesize everything in parallel.
  const results = new Map();
  let done = 0;
  await pool(units, opts.jobs, async (u) => {
    const r = await synthUnit(api, { ...u, flow: voiceCfg.flow, voice: voiceCfg.voice, speed: opts.speed, outdir });
    results.set(u.index, r);
    done++;
    console.log(`  [${done}/${units.length}] ${u.sectionId}#${u.index} ${r.wav.duration.toFixed(1)}s (${u.text.length} chars)`);
  });

  // Pass 2: relative duration heuristic — repeat-glitch blocks read far slower
  // (chars/sec below the corpus median); retry once, keep the closer take.
  const rates = [...results.values()].map((r) => r.unit.text.length / r.wav.duration).sort((a, b) => a - b);
  const medianRate = rates[Math.floor(rates.length / 2)];
  const flagged = [...results.values()].filter((r) => {
    const rate = r.unit.text.length / r.wav.duration;
    return rate < medianRate * 0.7 || rate > medianRate * 1.3;
  });
  if (flagged.length) console.log(`Retrying ${flagged.length} outlier(s)...`);
  await pool(flagged, opts.jobs, async (r) => {
    try {
      const alt = await synthUnit(api, { ...r.unit, flow: voiceCfg.flow, voice: voiceCfg.voice, speed: opts.speed, outdir });
      const score = (w) => Math.abs(r.unit.text.length / w.duration - medianRate);
      if (score(alt.wav) < score(r.wav)) results.set(r.unit.index, alt);
    } catch (e) { console.log(`  retry failed for ${r.unit.sectionId}#${r.unit.index}: ${e.message}`); }
  });

  // Concatenate into one continuous chapter track and record where each
  // section starts. Sections are markers into that single track, not separate
  // files: the reader plays one audio element and seeks between markers.
  const ordered = units.map((u) => results.get(u.index));
  const fmt = ordered[0].wav;
  const mismatch = ordered.find((r) => !sameFormat(r.wav, fmt));
  if (mismatch) throw new Error(`format mismatch in ${mismatch.file} (${mismatch.wav.rate}Hz/${mismatch.wav.bits}bit vs ${fmt.rate}Hz/${fmt.bits}bit)`);

  const sectionTitles = new Map(transcript.sections.map((s) => [s.id, s.title ?? null]));
  const chunks = [];
  const markers = [];
  let offsetBytes = 0;
  let lastSection = null;
  for (const r of ordered) {
    const { unit } = r;
    if (chunks.length) {
      const gap = silence(
        unit.sectionId !== lastSection ? opts.gapSection : opts.gapBlock,
        fmt,
      );
      chunks.push(gap);
      offsetBytes += gap.length;
    }
    // The marker points at the first sample of the section's own speech, so
    // seeking to it never replays the trailing pause of the section before.
    if (unit.sectionId !== lastSection) {
      markers.push({
        sectionId: unit.sectionId,
        title: unit.sectionId === "sec-00" ? null : (sectionTitles.get(unit.sectionId) ?? null),
        start: offsetBytes / bytesPerSecond(fmt),
      });
      lastSection = unit.sectionId;
    }
    chunks.push(r.wav.data);
    offsetBytes += r.wav.data.length;
  }

  const fullPcm = Buffer.concat(chunks);
  const totalDuration = fullPcm.length / bytesPerSecond(fmt);
  const base = path.join(outdir, `${slug}.${locale}`);
  writeWav(`${base}.wav`, fmt, fullPcm);

  // Each marker carries its own end so the player can label and scrub segments
  // without recomputing boundaries from the next marker's start.
  const sections = markers.map((marker, index) => ({
    ...marker,
    start: Math.round(marker.start * 1000) / 1000,
    end: Math.round((markers[index + 1]?.start ?? totalDuration) * 1000) / 1000,
  }));
  fs.writeFileSync(
    `${base}.sections.json`,
    `${JSON.stringify({ slug, locale, duration: Math.round(totalDuration * 1000) / 1000, sections }, null, 2)}\n`,
    "utf8",
  );

  const mp3File = opts.mp3 ? convertToMp3(`${base}.wav`) : null;
  if (opts.upload) {
    if (!mp3File) throw new Error("--upload requires the MP3 render");
    const config = readR2Config();
    for (const file of [mp3File, `${base}.sections.json`]) {
      const key = `audio/chapters/${slug}/${locale}/${path.basename(file)}`;
      const result = await putFileIfChanged(config, key, file);
      console.log(`  ${result.uploaded ? "uploaded" : "unchanged"} ${key} (${result.localSize} bytes)`);
    }
  }
  fs.rmSync(path.join(outdir, ".parts"), { recursive: true, force: true });

  const spent = units.reduce((n, u) => n + u.text.length, 0);
  console.log(
    `\nDone: ${base}.wav${mp3File ? ` + ${path.basename(mp3File)}` : ""} + ${path.basename(base)}.sections.json — ${sections.length} section marker(s), ${(totalDuration / 60).toFixed(1)} min`,
  );
  console.log(`Spend: ~${spent} tokens (${flagged.length} retried)`);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
