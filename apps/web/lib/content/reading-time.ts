import type { Locale } from "../../i18n/config";

/**
 * These are product calibration inputs, not universal claims about how quickly
 * a person reads. Keep them named so a later calibration can change data
 * without changing the consumer contract.
 */
export const READING_TIME_CALIBRATION = {
  calibratedOn: "2026-08-24",
  wordsPerMinute: { en: 220, vi: 260 } satisfies Record<Locale, number>,
  passiveFigureMinutes: 0.2,
  interactiveBlockMinutes: 0.5,
  visualAllowanceCap: 0.25,
} as const;

export interface ReadingTimeOverrideInput {
  minutes: number;
  reason: string;
}

export interface ReadingTimeContext {
  /** Number of authored figure references in the chapter metadata. */
  figureCount?: number;
  /** A localized editorial value; it is only accepted with a non-empty reason by the schema. */
  override?: ReadingTimeOverrideInput;
}

export interface ReadingTimeDiagnostics {
  locale: Locale;
  textUnits: number;
  baseMinutes: number;
  visualMinutes: number;
  totalMinutes: number;
  figureCount: number;
  interactiveBlockCount: number;
  wordsPerMinute: number;
  sourceFingerprint: string;
  overrideMinutes?: number;
  overrideReason?: string;
}

export interface ReadingTimeEstimate {
  minutes: number;
  diagnostics: ReadingTimeDiagnostics;
}

const PASSIVE_COMPONENTS = new Set([
  "AnatomyPlate",
  "Callout",
  "ChapterHero",
  "Comparison",
  "DiagramFigure",
  "Figure",
  "FigureGrid",
  "GlossaryTerm",
  "Quote",
  "RelatedChapters",
  "ScientificNote",
  "SideNote",
  "SourceList",
  "WhatThisMeans",
]);

// These components are inline annotations rather than a block that asks the
// reader to pause, so they should never acquire an interaction allowance.
const INLINE_COMPONENTS = new Set(["GlossaryTerm"]);

function removeFencedCode(source: string): string {
  const lines = source.split(/\r?\n/);
  const kept: string[] = [];
  let fence: string | null = null;

  for (const line of lines) {
    const marker = line.trim().match(/^(`{3,}|~{3,})/);
    if (marker) {
      if (fence === null) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = null;
      continue;
    }
    if (fence === null) kept.push(line);
  }

  return kept.join("\n");
}

function removeImportExportLines(source: string): string {
  const lines = source.split(/\r?\n/);
  const kept: string[] = [];
  let skipping = false;
  let braceDepth = 0;

  for (const line of lines) {
    if (!skipping && /^\s*(?:import|export)\b/.test(line)) {
      skipping = true;
      braceDepth = (line.match(/{/g)?.length ?? 0) - (line.match(/}/g)?.length ?? 0);
      if (line.includes(";") || braceDepth <= 0) skipping = false;
      continue;
    }
    if (skipping) {
      braceDepth += (line.match(/{/g)?.length ?? 0) - (line.match(/}/g)?.length ?? 0);
      if (line.includes(";") || braceDepth <= 0) skipping = false;
      continue;
    }
    kept.push(line);
  }

  return kept.join("\n");
}

function removeInlineCode(source: string): string {
  return source.replace(/(`{1,3})([\s\S]*?)\1/g, " ");
}

function removeHtmlComments(source: string): string {
  return source.replace(/<!--[\s\S]*?-->/g, " ");
}

/** Remove a JSX expression while respecting nested braces and quoted strings. */
function removeBalancedExpressions(source: string): string {
  let result = "";
  for (let i = 0; i < source.length; i += 1) {
    if (source[i] !== "{") {
      result += source[i];
      continue;
    }

    let depth = 1;
    let quote: "'" | '"' | "`" | null = null;
    let escaped = false;
    let end = i + 1;
    for (; end < source.length && depth > 0; end += 1) {
      const char = source[end];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\" && quote) {
        escaped = true;
        continue;
      }
      if (quote) {
        if (char === quote) quote = null;
        continue;
      }
      if (char === "'" || char === '"' || char === "`") {
        quote = char;
      } else if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
      }
    }

    // An unmatched brace is more likely prose than a JSX expression. Preserve
    // it rather than dropping the rest of the document.
    if (depth !== 0) {
      result += source[i];
      continue;
    }
    result += " ";
    i = end - 1;
  }
  return result;
}

/** Strip JSX/HTML tags and their props while preserving their visible children. */
function removeTags(source: string): string {
  let result = "";
  let i = 0;
  while (i < source.length) {
    const start = source[i] === "<" && /[A-Za-z/]/.test(source[i + 1] ?? "");
    if (!start) {
      result += source[i];
      i += 1;
      continue;
    }

    let quote: "'" | '"' | null = null;
    let bracketDepth = 0;
    let end = i + 1;
    for (; end < source.length; end += 1) {
      const char = source[end];
      if (quote) {
        if (char === quote && source[end - 1] !== "\\") quote = null;
        continue;
      }
      if (char === "'" || char === '"') {
        quote = char;
      } else if (char === "{") {
        bracketDepth += 1;
      } else if (char === "}") {
        bracketDepth = Math.max(0, bracketDepth - 1);
      } else if (char === ">" && bracketDepth === 0) {
        break;
      }
    }

    if (end >= source.length) {
      result += source[i];
      i += 1;
    } else {
      result += " ";
      i = end + 1;
    }
  }
  return result;
}

/**
 * Extract only text a reader can see from an MDX source file. It intentionally
 * stays dependency-free: a small stateful stripper is easier to audit here than
 * coupling content validation to the MDX compiler bundle.
 */
export function extractVisibleMdxText(source: string): string {
  let text = source.replace(/^\uFEFF/, "");
  text = removeFencedCode(text);
  text = removeImportExportLines(text);
  text = removeInlineCode(text);
  text = removeHtmlComments(text);
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, " ");
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
  text = text.replace(/\[([^\]]+)\]\[[^\]]*\]/g, "$1");
  text = text.replace(/^\s*\[[^\]]+\]:\s+\S+.*$/gm, " ");
  text = removeTags(text);
  text = removeBalancedExpressions(text);
  text = text.replace(/https?:\/\/\S+/giu, " ");
  text = text.replace(/^\s*\|?(?:\s*:?-+:?\s*\|)+\s*$/gm, " ");
  text = text.replace(/^\s*(?:[-*_]\s*){3,}$/gm, " ");
  text = text.replace(/[|#[\]*_~>]/g, " ");
  return text.replace(/\s+/g, " ").trim();
}

function countEnglishWords(text: string): number {
  const tokens = text.match(/[\p{L}\p{N}](?:[\p{L}\p{M}\p{N}'’\-]*[\p{L}\p{N}])?/gu);
  return tokens?.length ?? 0;
}

function countVietnameseSyllableTokens(text: string): number {
  return text.split(/\s+/u).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

function countInteractiveBlocks(source: string): number {
  const countByName = new Map<string, number>();
  const matcher = /<([A-Z][A-Za-z0-9]*)\b/g;
  for (const match of source.matchAll(matcher)) {
    const name = match[1];
    if (PASSIVE_COMPONENTS.has(name) || INLINE_COMPONENTS.has(name)) continue;
    countByName.set(name, (countByName.get(name) ?? 0) + 1);
  }
  let total = 0;
  for (const count of countByName.values()) total += count;
  return total;
}

/** A stable, dependency-free fingerprint suitable for an in-process cache key. */
export function fingerprintSource(source: string): string {
  let hash = 2166136261;
  for (let i = 0; i < source.length; i += 1) {
    hash ^= source.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${source.length.toString(36)}-${(hash >>> 0).toString(16)}`;
}

function normalizeOverride(
  override?: ReadingTimeOverrideInput,
): ReadingTimeOverrideInput | undefined {
  if (!override || !Number.isFinite(override.minutes) || override.minutes < 1) return undefined;
  if (typeof override.reason !== "string" || override.reason.trim().length === 0) return undefined;
  return { minutes: Math.ceil(override.minutes), reason: override.reason.trim() };
}

export function estimateReadingTime(
  source: string,
  locale: Locale,
  context: ReadingTimeContext = {},
): ReadingTimeEstimate {
  const visibleText = extractVisibleMdxText(source);
  const textUnits =
    locale === "en" ? countEnglishWords(visibleText) : countVietnameseSyllableTokens(visibleText);
  const wordsPerMinute = READING_TIME_CALIBRATION.wordsPerMinute[locale];
  const baseMinutes = textUnits / wordsPerMinute;
  const figureCount = Math.max(0, Math.floor(context.figureCount ?? 0));
  const interactiveBlockCount = countInteractiveBlocks(source);
  const visualCandidate =
    figureCount * READING_TIME_CALIBRATION.passiveFigureMinutes +
    interactiveBlockCount * READING_TIME_CALIBRATION.interactiveBlockMinutes;
  const visualMinutes = Math.min(
    visualCandidate,
    baseMinutes * READING_TIME_CALIBRATION.visualAllowanceCap,
  );
  const derivedMinutes = Math.max(1, Math.ceil(baseMinutes + visualMinutes));
  const sourceFingerprint = fingerprintSource(source);
  const override = normalizeOverride(context.override);
  const totalMinutes = override?.minutes ?? derivedMinutes;

  return {
    minutes: totalMinutes,
    diagnostics: {
      locale,
      textUnits,
      baseMinutes,
      visualMinutes,
      totalMinutes,
      figureCount,
      interactiveBlockCount,
      wordsPerMinute,
      sourceFingerprint,
      ...(override ? { overrideMinutes: override.minutes, overrideReason: override.reason } : {}),
    },
  };
}

const estimateCache = new Map<string, ReadingTimeEstimate>();

/** Cache estimates by chapter path, locale, source fingerprint, and metadata inputs. */
export function estimateReadingTimeCached(
  mdxPath: string,
  source: string,
  locale: Locale,
  context: ReadingTimeContext = {},
): ReadingTimeEstimate {
  const fingerprint = fingerprintSource(source);
  const override = context.override;
  const key = [
    mdxPath,
    locale,
    fingerprint,
    context.figureCount ?? 0,
    override?.minutes ?? "",
    override?.reason ?? "",
  ].join("|");
  const cached = estimateCache.get(key);
  if (cached) return cached;
  const estimate = estimateReadingTime(source, locale, context);
  estimateCache.set(key, estimate);
  return estimate;
}

export function clearReadingTimeCache(): void {
  estimateCache.clear();
}
