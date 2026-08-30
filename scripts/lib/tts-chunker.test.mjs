import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_TTS_CHARS,
  MIN_TTS_CHUNK_CHARS,
  chunkTtsText,
  normalizeTtsText,
} from "./tts-chunker.mjs";

test("normalizes whitespace and combines sentence boundaries greedily", () => {
  const chunks = chunkTtsText("  First sentence.\r\nSecond sentence!   Third sentence? Fourth…  ");
  assert.deepEqual(chunks, ["First sentence. Second sentence! Third sentence? Fourth…"]);
  assert.equal(
    chunks.every((chunk) => !/[\r\n]/.test(chunk)),
    true,
  );
});

test("stops greedy combination at the max character limit", () => {
  const chunks = chunkTtsText(`${"a".repeat(200)}. ${"b".repeat(200)}. ${"c".repeat(200)}.`);
  assert.equal(chunks.length, 2);
  assert.equal(chunks[0].length, 403);
  assert.equal(
    chunks.every((chunk) => chunk.length <= MAX_TTS_CHARS),
    true,
  );
});

test("splits an over-limit sentence at punctuation or whitespace", () => {
  for (const separator of [",", ";", ":", "-"]) {
    const chunks = chunkTtsText(`${"a".repeat(300)}${separator}${"b".repeat(300)}.`);
    assert.deepEqual(chunks, [`${"a".repeat(300)}${separator}`, `${"b".repeat(300)}.`]);
  }

  const whitespaceChunks = chunkTtsText(`${"a".repeat(300)} ${"b".repeat(300)}.`);
  assert.deepEqual(whitespaceChunks, [`${"a".repeat(300)}`, `${"b".repeat(300)}.`]);
});

test("falls back to a hard cut when a token has no break point", () => {
  const text = "x".repeat(MAX_TTS_CHARS + 1);
  const chunks = chunkTtsText(text);
  assert.deepEqual(
    chunks.map((chunk) => chunk.length),
    [MAX_TTS_CHARS, 1],
  );
  assert.equal(chunks.join(""), text);
});

test("keeps a long-sentence tail with the following sentence when possible", () => {
  const chunks = chunkTtsText(`${"a".repeat(60)} ${"b".repeat(60)}. Tail.`, { maxChars: 70 });
  assert.equal(
    chunks.every((chunk) => chunk.length <= 70),
    true,
  );
  assert.equal(chunks.at(-1), `${"b".repeat(60)}. Tail.`);
});

test("returns no chunks for empty or whitespace-only input", () => {
  assert.deepEqual(chunkTtsText(" \n\t "), []);
  assert.equal(normalizeTtsText(null), "");
});

test("merges a short chunk forward into the next chunk", () => {
  const chunks = chunkTtsText(`Ok. ${"a".repeat(40)}.`, { maxChars: 50 });
  assert.deepEqual(chunks, [`Ok. ${"a".repeat(40)}.`]);
});

test("merges a short chunk backward when the next chunk has no room", () => {
  const chunks = chunkTtsText(`${"a".repeat(40)}. Ok. ${"b".repeat(45)}.`, { maxChars: 50 });
  assert.deepEqual(chunks, [`${"a".repeat(40)}. Ok.`, `${"b".repeat(45)}.`]);
});

test("keeps a short chunk standalone when neither neighbour has room", () => {
  const chunks = chunkTtsText(`${"a".repeat(49)}. Ok. ${"b".repeat(49)}.`, { maxChars: 50 });
  assert.deepEqual(chunks, [`${"a".repeat(49)}.`, "Ok.", `${"b".repeat(49)}.`]);
});

test("rejects non-positive-integer limits", () => {
  assert.throws(() => chunkTtsText("text", { maxChars: 0 }), /maxChars/);
  assert.throws(() => chunkTtsText("text", { minChars: 1.5 }), /minChars/);
  assert.equal(MIN_TTS_CHUNK_CHARS, 20);
});
