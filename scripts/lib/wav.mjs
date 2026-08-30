// wav.mjs — minimal RIFF/PCM read/write helpers.
//
// The tvoiceai API returns RIFF/PCM (48kHz mono 16-bit), and chapter audio is
// assembled by concatenating those PCM payloads with generated silence. Only
// PCM is supported on purpose: a compressed payload cannot be concatenated
// byte-wise, so callers should reject anything else rather than emit a file
// that plays back as noise.

import fs from "node:fs";

/** Bytes of PCM audio per second for the given format. */
export function bytesPerSecond({ rate, channels, bits }) {
  return (rate * channels * bits) / 8;
}

export function parseWav(buffer) {
  if (buffer.subarray(0, 4).toString() !== "RIFF") throw new Error("not a RIFF wav");
  let offset = 12;
  let format = null;
  let data = null;
  while (offset < buffer.length - 8) {
    const id = buffer.subarray(offset, offset + 4).toString();
    const size = buffer.readUInt32LE(offset + 4);
    if (id === "fmt ") {
      format = {
        format: buffer.readUInt16LE(offset + 8),
        channels: buffer.readUInt16LE(offset + 10),
        rate: buffer.readUInt32LE(offset + 12),
        bits: buffer.readUInt16LE(offset + 22),
      };
    }
    if (id === "data") data = buffer.subarray(offset + 8, offset + 8 + size);
    offset += 8 + size + (size % 2);
  }
  if (!format || !data) throw new Error("wav missing fmt/data chunk");
  return { ...format, data, duration: data.length / bytesPerSecond(format) };
}

export function readWav(file) {
  return parseWav(fs.readFileSync(file));
}

export function writeWav(file, { channels, rate, bits }, pcm) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(bytesPerSecond({ rate, channels, bits }), 28);
  header.writeUInt16LE((channels * bits) / 8, 32);
  header.writeUInt16LE(bits, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(file, Buffer.concat([header, pcm]));
}

/** PCM silence of the requested length, aligned to a whole sample frame. */
export function silence(seconds, format) {
  const frame = (format.channels * format.bits) / 8;
  const bytes = Math.round((seconds * bytesPerSecond(format)) / frame) * frame;
  return Buffer.alloc(Math.max(0, bytes));
}

/** True when two formats can be concatenated without resampling. */
export function sameFormat(left, right) {
  return (
    left.rate === right.rate && left.channels === right.channels && left.bits === right.bits
  );
}
