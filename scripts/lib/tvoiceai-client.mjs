// tvoiceai-client.mjs — shared client for the tvoiceai.com internal TTS API.
// Used by scripts/tvoiceai-tts.mjs and scripts/tvoiceai-chapter-tts.mjs.
//
// Endpoints (author permits early use):
//   POST /api/login {username, password} -> {token}
//   GET  /api/user-info          (Bearer) -> {tokens, custom_voices}
//   GET  /api/voices             (Bearer) -> [{id, display_name, ...}]
//   POST /api/tts                (Bearer) -> {jobId}; poll GET /api/status/:jobId
//   Billing: 1 token per input character.
//
// Credentials never reach disk here — callers pass them per run; error messages
// report status only, never secret values.

import fs from "node:fs";
import path from "node:path";
import { LOCAL_VOICES } from "../tvoiceai-voices.mjs";

export { LOCAL_VOICES };

const BASE = "https://tvoiceai.com";

export function readCredentials(opts) {
  const username = opts.user || process.env.TVOICEAI_USER;
  const password = opts.pass || process.env.TVOICEAI_PASS;
  if (!username || !password) {
    throw new Error("Missing credentials: pass --user/--pass or set TVOICEAI_USER/TVOICEAI_PASS.");
  }
  return { username, password };
}

export async function login({ username, password }) {
  const res = await fetch(`${BASE}/api/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Login failed: ${data.error || res.status}`);
  return data.token;
}

export function makeClient(token) {
  return (pathname, options = {}) =>
    fetch(`${BASE}${pathname}`, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` },
    });
}

export async function fetchVoices(api) {
  const res = await api("/api/voices");
  return res.json();
}

// Resolve a voice query to {flow, voice}. Two flows exist, matching the web UI:
//   "api"   — numeric voice ids from /api/voices (Vbee tier, fast)
//   "local" — string ids: VIENEU_CLONE_* clones (ElevenLabs/Vbee clones) and system voice names
export async function resolveVoice(query, api) {
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

export async function synthesize(api, { text, flow, voice, speed = 1, pitch = 0, volume = 100, format = "mp3", sampleRate = 22050, pauseCfg = null }) {
  const res = await api("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ flow, text, voice, speed, pitch, volume, format, sample_rate: sampleRate, pause_cfg: pauseCfg }),
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
export function sniffExt(buf) {
  if (buf.slice(0, 3).toString() === "ID3" || (buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0)) return "mp3";
  if (buf.slice(0, 4).toString() === "RIFF") return "wav";
  return "bin";
}

export async function download(audioUrl, outPath) {
  const buf = Buffer.from(await (await fetch(audioUrl)).arrayBuffer());
  const ext = sniffExt(buf);
  const finalPath = outPath.endsWith(`.${ext}`) ? outPath : `${outPath.replace(/\.(mp3|wav|bin)$/, "")}.${ext}`;
  fs.mkdirSync(path.dirname(finalPath), { recursive: true });
  fs.writeFileSync(finalPath, buf);
  return finalPath;
}
