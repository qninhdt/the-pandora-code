#!/usr/bin/env node
/**
 * tvoiceai-tts.mjs — CLI wrapper for tvoiceai.com internal TTS API.
 *
 * The site exposes an undocumented JSON API (author permits early use):
 *   POST /api/login {username, password} -> {token}
 *   GET  /api/user-info          (Bearer) -> {tokens, custom_voices}
 *   GET  /api/voices             (Bearer) -> [{id, display_name, gender, region, ...}]
 *   POST /api/tts                (Bearer) -> {jobId}; poll GET /api/status/:jobId
 *   Billing: 1 token per input character.
 *
 * Auth is per-run: pass --user/--pass (or TVOICEAI_USER/TVOICEAI_PASS env).
 * Nothing is written to disk.
 *
 * Usage:
 *   node scripts/tvoiceai-tts.mjs voices [search] --user U --pass P
 *   node scripts/tvoiceai-tts.mjs balance --user U --pass P
 *   node scripts/tvoiceai-tts.mjs speak "Xin chào" [--voice <id|name>] [--speed 1] [--out f.mp3]
 *   node scripts/tvoiceai-tts.mjs file input.txt [--voice <id|name>] [--outdir tts-out]
 *
 * --voice accepts: numeric id (api flow), VIENEU_CLONE_* id (local flow),
 * or a name substring matched against both flows — e.g. "Nhật Phong" for
 * the ElevenLabs voice VIENEU_CLONE_1787035722863.
 */

import fs from "node:fs";
import path from "node:path";
import { LOCAL_VOICES } from "./tvoiceai-voices.mjs";

const BASE = "https://tvoiceai.com";

// ---------- auth ----------

function readCredentials(opts) {
  const username = opts.user || process.env.TVOICEAI_USER;
  const password = opts.pass || process.env.TVOICEAI_PASS;
  if (!username || !password) {
    throw new Error("Missing credentials: pass --user/--pass or set TVOICEAI_USER/TVOICEAI_PASS.");
  }
  return { username, password };
}

async function login({ username, password }) {
  const res = await fetch(`${BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Login failed: ${data.error || res.status}`);
  return data.token;
}

function makeClient(token) {
  return (pathname, options = {}) =>
    fetch(`${BASE}${pathname}`, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    });
}

// ---------- tts core ----------

async function fetchVoices(api) {
  const res = await api("/api/voices");
  return res.json();
}

// Resolve a voice query to {flow, voice}. Two flows exist, matching the web UI:
//   "api"   — numeric voice ids from /api/voices (Vbee tier, fast)
//   "local" — string ids: VIENEU_CLONE_* clones (ElevenLabs/Vbee clones) and system voice names
async function resolveVoice(query, api) {
  const q = String(query).trim();
  if (/^VIENEU_CLONE_\d+$/.test(q)) return { flow: "local", voice: q };
  if (/^\d+$/.test(q)) return { flow: "api", voice: parseInt(q, 10) };

  const ql = q.toLowerCase();
  const localMatches = Object.entries(LOCAL_VOICES).filter(([, name]) => String(name).toLowerCase().includes(ql));
  const apiVoices = await fetchVoices(api);
  const apiMatches = apiVoices.filter((v) => `${v.id} ${v.display_name}`.toLowerCase().includes(ql));

  if (localMatches.length + apiMatches.length === 0) throw new Error(`No voice matches "${q}". Run "voices" to list.`);
  if (localMatches.length + apiMatches.length > 1) {
    const labels = [
      ...localMatches.map(([id, name]) => `${id} = ${name} [local]`),
      ...apiMatches.map((v) => `${v.id} = ${v.display_name} [api]`),
    ];
    throw new Error(`Ambiguous voice "${q}": ${labels.slice(0, 8).join(", ")}`);
  }
  if (localMatches.length === 1) return { flow: "local", voice: localMatches[0][0] };
  return { flow: "api", voice: apiMatches[0].id };
}

async function synthesize(api, { text, flow, voice, speed, pitch, volume, format, sampleRate }) {
  const res = await api("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      flow,
      text,
      voice,
      speed,
      pitch,
      volume,
      format,
      sample_rate: sampleRate,
      pause_cfg: null,
    }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "TTS submit failed");

  // Poll job status every 2s, same cadence as the web UI.
  for (let i = 0; i < 300; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const st = await (await fetch(`${BASE}/api/status/${data.jobId}`)).json();
    if (st.status === "done") return st.audioUrl;
    if (st.status === "error") throw new Error(st.errorMsg || "Server error while processing");
  }
  throw new Error("Timed out waiting for job");
}

// The audioUrl extension is unreliable (.wav name, MP3 bytes) — sniff the header.
function sniffExt(buf) {
  if (buf.slice(0, 3).toString() === "ID3" || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)) return "mp3";
  if (buf.slice(0, 4).toString() === "RIFF") return "wav";
  return "bin";
}

async function download(audioUrl, outPath) {
  const buf = Buffer.from(await (await fetch(audioUrl)).arrayBuffer());
  const ext = sniffExt(buf);
  const finalPath = outPath.endsWith(`.${ext}`) ? outPath : `${outPath.replace(/\.(mp3|wav|bin)$/, "")}.${ext}`;
  fs.mkdirSync(path.dirname(finalPath), { recursive: true });
  fs.writeFileSync(finalPath, buf);
  return finalPath;
}

// ---------- cli ----------

function parseOpts(args) {
  const opts = { speed: 1.0, pitch: 0, volume: 100, format: "mp3", sampleRate: 22050, voice: "7310", out: null, outdir: "tts-out", user: null, pass: null };
  const positional = [];
  const map = { "--voice": "voice", "--speed": "speed", "--pitch": "pitch", "--volume": "volume", "--format": "format", "--rate": "sampleRate", "--out": "out", "--outdir": "outdir", "--user": "user", "--pass": "pass" };
  for (let i = 0; i < args.length; i++) {
    if (map[args[i]]) opts[map[args[i]]] = args[++i];
    else positional.push(args[i]);
  }
  opts.speed = parseFloat(opts.speed);
  opts.pitch = parseInt(opts.pitch, 10);
  opts.volume = parseInt(opts.volume, 10);
  opts.sampleRate = parseInt(opts.sampleRate, 10);
  return { opts, positional };
}

const [cmd, ...rest] = process.argv.slice(2);
const { opts, positional } = parseOpts(rest);

try {
  if (!cmd) {
    console.log(fs.readFileSync(new URL(import.meta.url), "utf8").match(/Usage:\n((?:.|\n)*?)\n\n/)[1]);
  } else {
    const api = makeClient(await login(readCredentials(opts)));

    if (cmd === "voices") {
      const q = positional.join(" ").toLowerCase();
      console.log("-- local flow (VIENEU clones: ElevenLabs/Vbee, + system voices) --");
      for (const [id, name] of Object.entries(LOCAL_VOICES)) {
        if (!q || `${id} ${name}`.toLowerCase().includes(q)) console.log(`${id.padEnd(28)} ${name}`);
      }
      console.log("-- api flow (Vbee tier, numeric ids) --");
      for (const v of await fetchVoices(api)) {
        if (!q || `${v.id} ${v.display_name} ${v.gender} ${v.region}`.toLowerCase().includes(q)) {
          console.log(`${String(v.id).padEnd(28)} ${v.display_name} (${v.gender}, ${v.region})`);
        }
      }
    } else if (cmd === "balance") {
      const user = await (await api("/api/user-info")).json();
      console.log(`${user.username}: ${user.tokens.toLocaleString()} tokens`);
    } else if (cmd === "speak") {
      const text = positional.join(" ").trim();
      if (!text) throw new Error("No text given");
      const voiceCfg = await resolveVoice(String(opts.voice), api);
      console.log(`Synthesizing ${text.length} chars with voice ${voiceCfg.voice} [${voiceCfg.flow}]...`);
      const url = await synthesize(api, { text, flow: voiceCfg.flow, voice: voiceCfg.voice, speed: opts.speed, pitch: opts.pitch, volume: opts.volume, format: opts.format, sampleRate: opts.sampleRate });
      const out = await download(url, opts.out || `tts-${Date.now()}`);
      console.log(`Saved: ${out}`);
    } else if (cmd === "file") {
      const input = positional[0];
      if (!input) throw new Error("No input file given");
      const text = fs.readFileSync(input, "utf8").trim();
      if (!text) throw new Error("Input file is empty");
      const voiceCfg = await resolveVoice(String(opts.voice), api);
      console.log(`Synthesizing ${text.length} chars from ${input} with voice ${voiceCfg.voice} [${voiceCfg.flow}]...`);
      const url = await synthesize(api, { text, flow: voiceCfg.flow, voice: voiceCfg.voice, speed: opts.speed, pitch: opts.pitch, volume: opts.volume, format: opts.format, sampleRate: opts.sampleRate });
      const base = path.basename(input, path.extname(input));
      const out = await download(url, path.join(opts.outdir, base));
      console.log(`Saved: ${out}`);
    } else {
      throw new Error(`Unknown command "${cmd}".`);
    }
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
