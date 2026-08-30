#!/usr/bin/env node
/**
 * tvoiceai-tts.mjs — CLI wrapper for tvoiceai.com internal TTS API.
 * Shared client lives in scripts/lib/tvoiceai-client.mjs.
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
import { readCredentials, login, makeClient, fetchVoices, resolveVoice, synthesize, download, LOCAL_VOICES } from "./lib/tvoiceai-client.mjs";

// ---------- cli ----------

// Parse --pause "dot=0.3,comma=0.2,semi=0.3,ellipsis=0.5,exclamation=0.3,question=0.3,newline=0.4"
// into a pause_cfg object the tvoiceai API accepts; null when not given.
// (Empirically ignored for local-flow clone voices — kept for api-flow voices.)
function parsePause(spec) {
  if (!spec) return null;
  const cfg = {};
  for (const pair of spec.split(",")) {
    const [k, v] = pair.split("=");
    if (k && v !== undefined) cfg[k.trim()] = parseFloat(v);
  }
  return Object.keys(cfg).length ? cfg : null;
}

function parseOpts(args) {
  const opts = { speed: 1.0, pitch: 0, volume: 100, format: "mp3", sampleRate: 22050, voice: "7310", out: null, outdir: "tts-out", user: null, pass: null, pause: null };
  const positional = [];
  const map = { "--voice": "voice", "--speed": "speed", "--pitch": "pitch", "--volume": "volume", "--format": "format", "--rate": "sampleRate", "--out": "out", "--outdir": "outdir", "--user": "user", "--pass": "pass", "--pause": "pause" };
  for (let i = 0; i < args.length; i++) {
    if (map[args[i]]) opts[map[args[i]]] = args[++i];
    else positional.push(args[i]);
  }
  opts.speed = parseFloat(opts.speed);
  opts.pitch = parseInt(opts.pitch, 10);
  opts.volume = parseInt(opts.volume, 10);
  opts.sampleRate = parseInt(opts.sampleRate, 10);
  opts.pauseCfg = parsePause(opts.pause);
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
      const url = await synthesize(api, { text, flow: voiceCfg.flow, voice: voiceCfg.voice, speed: opts.speed, pitch: opts.pitch, volume: opts.volume, format: opts.format, sampleRate: opts.sampleRate, pauseCfg: opts.pauseCfg });
      const out = await download(url, opts.out || `tts-${Date.now()}`);
      console.log(`Saved: ${out}`);
    } else if (cmd === "file") {
      const input = positional[0];
      if (!input) throw new Error("No input file given");
      const text = fs.readFileSync(input, "utf8").trim();
      if (!text) throw new Error("Input file is empty");
      const voiceCfg = await resolveVoice(String(opts.voice), api);
      console.log(`Synthesizing ${text.length} chars from ${input} with voice ${voiceCfg.voice} [${voiceCfg.flow}]...`);
      const url = await synthesize(api, { text, flow: voiceCfg.flow, voice: voiceCfg.voice, speed: opts.speed, pitch: opts.pitch, volume: opts.volume, format: opts.format, sampleRate: opts.sampleRate, pauseCfg: opts.pauseCfg });
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
