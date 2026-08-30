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

test("uses only a period as a sentence boundary", () => {
  const text = "Comma, exclamation! question? ellipsis… still one sentence.";
  assert.deepEqual(chunkTtsText(text), [text]);
});

test("moves complete period-delimited sentences into the next chunk", () => {
  const first = `${"a".repeat(30)}.`;
  const second = `${"b".repeat(30)}.`;
  assert.deepEqual(chunkTtsText(`${first} ${second}`, { maxChars: 40 }), [first, second]);
});

test("rejects a single sentence that exceeds the request limit", () => {
  const sentence = `${"x".repeat(MAX_TTS_CHARS)}.`;
  assert.throws(
    () => chunkTtsText(sentence),
    /sentence exceeds 512 characters \(513\); sentence boundaries are indivisible/,
  );
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
