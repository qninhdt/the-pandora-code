#!/usr/bin/env node
// assemble-chapter-audio.mjs — build the single chapter track + section markers
// from per-section WAVs already rendered under tts-out/<slug>.<locale>/.
//
// Chapter delivery is one continuous audio plus marker offsets. This script
// produces that pair from existing section renders, so a chapter that was
// synthesized before the single-track change does not have to be paid for
// again. Section WAVs are concatenated in numeric order with `--gap-section`
// silence between them, defaulting to the gap-free TTS pipeline output.
//
// Usage:
//   node scripts/assemble-chapter-audio.mjs <slug> <en|vi> [--gap-section 0]
//     [--outdir dir] [--mp3]

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { bytesPerSecond, readWav, sameFormat, silence, writeWav } from "./lib/wav.mjs";

const CHAPTERS = "content/chapters";

function parseArgs(args) {
  const opts = { gapSection: 0, outdir: null, mp3: false };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === "--mp3") opts.mp3 = true;
    else if (args[index] === "--gap-section") opts.gapSection = Number.parseFloat(args[++index]);
    else if (args[index] === "--outdir") opts.outdir = args[++index];
    else throw new Error(`Unknown option: ${args[index]}`);
  }
  if (!Number.isFinite(opts.gapSection) || opts.gapSection < 0) {
    throw new Error("--gap-section must be a non-negative number");
  }
  return opts;
}

function sectionOrdinal(id) {
  const match = /^sec-(\d+)$/.exec(id);
  return match ? Number.parseInt(match[1], 10) : Number.MAX_SAFE_INTEGER;
}

function convertToMp3(wavFile) {
  const mp3File = wavFile.replace(/\.wav$/i, ".mp3");
  const result = spawnSync(
    "ffmpeg",
    ["-y", "-i", wavFile, "-codec:a", "libmp3lame", "-b:a", "192k", mp3File],
    { stdio: "inherit" },
  );
  if (result.error) throw new Error(`MP3 conversion failed: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`MP3 conversion failed with status ${result.status}`);
  return mp3File;
}

const [slug, locale, ...rest] = process.argv.slice(2);

try {
  if (!slug || !["en", "vi"].includes(locale)) {
    throw new Error("usage: assemble-chapter-audio.mjs <slug> <en|vi> [--gap-section 0] [--mp3]");
  }
  const opts = parseArgs(rest);
  const directory = opts.outdir ?? path.join("tts-out", `${slug}.${locale}`);
  if (!fs.existsSync(directory)) throw new Error(`No render directory: ${directory}`);

  const transcript = JSON.parse(
    fs.readFileSync(path.join(CHAPTERS, slug, `${locale}.transcript.json`), "utf8"),
  );
  const titles = new Map(transcript.sections.map((section) => [section.id, section.title ?? null]));

  const files = fs
    .readdirSync(directory)
    .filter((file) => /^sec-\d+\.wav$/i.test(file))
    .sort((left, right) => sectionOrdinal(left.slice(0, -4)) - sectionOrdinal(right.slice(0, -4)));
  if (files.length === 0) throw new Error(`No sec-NN.wav files in ${directory}`);

  const chunks = [];
  const markers = [];
  let format = null;
  let offsetBytes = 0;
  for (const file of files) {
    const wav = readWav(path.join(directory, file));
    format ??= wav;
    if (!sameFormat(wav, format)) {
      throw new Error(`format mismatch in ${file} (${wav.rate}Hz/${wav.bits}bit)`);
    }
    if (chunks.length) {
      const gap = silence(opts.gapSection, format);
      chunks.push(gap);
      offsetBytes += gap.length;
    }
    const sectionId = file.slice(0, -4);
    markers.push({
      sectionId,
      title: sectionId === "sec-00" ? null : (titles.get(sectionId) ?? null),
      start: offsetBytes / bytesPerSecond(format),
    });
    chunks.push(wav.data);
    offsetBytes += wav.data.length;
  }

  const pcm = Buffer.concat(chunks);
  const duration = pcm.length / bytesPerSecond(format);
  const base = path.join(directory, `${slug}.${locale}`);
  writeWav(`${base}.wav`, format, pcm);

  const sections = markers.map((marker, index) => ({
    ...marker,
    start: Math.round(marker.start * 1000) / 1000,
    end: Math.round((markers[index + 1]?.start ?? duration) * 1000) / 1000,
  }));
  fs.writeFileSync(
    `${base}.sections.json`,
    `${JSON.stringify({ slug, locale, duration: Math.round(duration * 1000) / 1000, sections }, null, 2)}\n`,
    "utf8",
  );
  const mp3File = opts.mp3 ? convertToMp3(`${base}.wav`) : null;

  console.log(
    `${slug}/${locale}: ${sections.length} section(s), ${(duration / 60).toFixed(1)} min -> ${base}.wav${mp3File ? ` + ${path.basename(mp3File)}` : ""} + ${path.basename(base)}.sections.json`,
  );
} catch (error) {
  console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
