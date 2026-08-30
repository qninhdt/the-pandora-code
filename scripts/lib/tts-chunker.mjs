const SENTENCE_ENDINGS = new Set([".", "!", "?", "…"]);
const PREFERRED_BREAKS = new Set([",", ";", ":", "-"]);
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
  const parts = [];
  let start = 0;

  for (let index = 0; index < text.length; index++) {
    if (text[index] === "\r" || text[index] === "\n") {
      pushNormalized(parts, text.slice(start, index));
      if (text[index] === "\r" && text[index + 1] === "\n") index++;
      start = index + 1;
      continue;
    }

    if (!SENTENCE_ENDINGS.has(text[index]) || !isSentenceBoundary(text, index)) continue;

    let end = index + 1;
    while (SENTENCE_ENDINGS.has(text[end])) end++;
    while (CLOSING_MARKS.has(text[end])) end++;
    pushNormalized(parts, text.slice(start, end));
    start = end;
    index = end - 1;
  }

  pushNormalized(parts, text.slice(start));
  return parts;
}

function findPreferredCut(text, maxChars) {
  for (let index = Math.min(maxChars, text.length) - 1; index > 0; index--) {
    if (PREFERRED_BREAKS.has(text[index])) return index + 1;
    if (/\s/.test(text[index])) return index;
  }
  return maxChars;
}

function splitLongSentence(sentence, maxChars) {
  const parts = [];
  let remaining = sentence;

  while (remaining.length > maxChars) {
    const cut = findPreferredCut(remaining, maxChars);
    const part = normalizeTtsText(remaining.slice(0, cut));
    if (!part) throw new Error("TTS chunker could not make progress while splitting text");
    parts.push(part);
    remaining = normalizeTtsText(remaining.slice(cut));
  }

  if (remaining) parts.push(remaining);
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
      if (current) chunks.push(current);
      const parts = splitLongSentence(sentence, maxChars);
      chunks.push(...parts.slice(0, -1));
      current = parts.at(-1) ?? null;
      continue;
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
