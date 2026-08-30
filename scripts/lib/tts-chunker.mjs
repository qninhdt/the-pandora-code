const SENTENCE_ENDINGS = new Set(["."]);
const CLOSING_MARKS = new Set(['"', "'", "”", "’", "»", ")", "]", "}"]);

export const MAX_TTS_CHARS = 512;
export const MIN_TTS_CHUNK_CHARS = 20;

export function normalizeTtsText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function pushNormalized(parts, value) {
  const normalized = normalizeTtsText(value);
  if (normalized) parts.push(normalized);
}

function isSentenceBoundary(text, index) {
  let cursor = index;
  while (SENTENCE_ENDINGS.has(text[cursor + 1])) cursor++;
  while (CLOSING_MARKS.has(text[cursor + 1])) cursor++;
  return cursor === text.length - 1 || /\s/.test(text[cursor + 1]);
}

function splitSentences(text) {
  const normalized = normalizeTtsText(text);
  const parts = [];
  let start = 0;

  for (let index = 0; index < normalized.length; index++) {
    if (!SENTENCE_ENDINGS.has(normalized[index]) || !isSentenceBoundary(normalized, index))
      continue;

    let end = index + 1;
    while (SENTENCE_ENDINGS.has(normalized[end])) end++;
    while (CLOSING_MARKS.has(normalized[end])) end++;
    pushNormalized(parts, normalized.slice(start, end));
    start = end;
    index = end - 1;
  }

  pushNormalized(parts, normalized.slice(start));
  return parts;
}

function mergeShortChunks(chunks, maxChars, minChars) {
  const pending = [...chunks];
  const merged = [];

  for (let index = 0; index < pending.length; index++) {
    const chunk = pending[index];
    if (chunk.length < minChars) {
      const next = pending[index + 1];
      if (next) {
        const withNext = normalizeTtsText(`${chunk} ${next}`);
        if (withNext.length <= maxChars) {
          pending[index + 1] = withNext;
          continue;
        }
      }

      const previous = merged.at(-1);
      if (previous) {
        const withPrevious = normalizeTtsText(`${previous} ${chunk}`);
        if (withPrevious.length <= maxChars) {
          merged[merged.length - 1] = withPrevious;
          continue;
        }
      }
    }
    merged.push(chunk);
  }

  return merged;
}

export function chunkTtsText(value, options = {}) {
  const maxChars = options.maxChars ?? MAX_TTS_CHARS;
  const minChars = options.minChars ?? MIN_TTS_CHUNK_CHARS;
  if (!Number.isInteger(maxChars) || maxChars < 1)
    throw new Error("maxChars must be a positive integer");
  if (!Number.isInteger(minChars) || minChars < 1)
    throw new Error("minChars must be a positive integer");

  const sentences = splitSentences(String(value ?? ""));
  const chunks = [];
  let current = null;

  for (const sentence of sentences) {
    if (sentence.length > maxChars) {
      throw new Error(
        `TTS sentence exceeds ${maxChars} characters (${sentence.length}); sentence boundaries are indivisible`,
      );
    }

    if (!current) {
      current = sentence;
      continue;
    }

    const combined = normalizeTtsText(`${current} ${sentence}`);
    if (combined.length <= maxChars) current = combined;
    else {
      chunks.push(current);
      current = sentence;
    }
  }

  if (current) chunks.push(current);
  return mergeShortChunks(chunks, maxChars, minChars);
}
