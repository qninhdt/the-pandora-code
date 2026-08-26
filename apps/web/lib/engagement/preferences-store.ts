"use client";

import { useCallback, useLayoutEffect, useMemo } from "react";
import {
  READER_STORAGE_KEYS,
  clampNumber,
  isRecord,
  readReaderStorage,
  writeReaderStorage,
} from "./storage";
import { createReaderStore, useReaderStore } from "./use-reader-store";

/** Typeface the reading column is set in. Mirrors the three font tiles. */
export const READER_FONTS = ["sans", "serif", "mono"] as const;
export type ReaderFont = (typeof READER_FONTS)[number];

/**
 * Line spacing is three named steps rather than a free slider: readers pick a
 * feel, not a number, and any value in between is not worth a control.
 */
export const READER_LINE_SPACINGS = ["tight", "normal", "loose"] as const;
export type ReaderLineSpacing = (typeof READER_LINE_SPACINGS)[number];
export const LINE_SPACING_VALUES: Record<ReaderLineSpacing, number> = {
  tight: 1.55,
  normal: 1.8,
  loose: 2.1,
};

/** Text size is stepped, so the min/max/step below are the stepper's bounds. */
export const READER_PREFERENCE_LIMITS = {
  fontScale: { min: 0.85, max: 1.4, step: 0.05 },
} as const;

export type ReducedMotionPreference = "system" | "reduce" | "no-preference";

export interface ReadingPreferences {
  fontFamily: ReaderFont;
  fontScale: number;
  lineSpacing: ReaderLineSpacing;
  /** Let the article fill the viewport instead of holding a reading measure. */
  fullWidth: boolean;
  reducedMotion: ReducedMotionPreference;
}

export const DEFAULT_READING_PREFERENCES: ReadingPreferences = {
  fontFamily: "serif",
  fontScale: 1,
  lineSpacing: "normal",
  fullWidth: false,
  reducedMotion: "system",
};

function normalizeReducedMotion(value: unknown): ReducedMotionPreference {
  return value === "reduce" || value === "no-preference" || value === "system"
    ? value
    : DEFAULT_READING_PREFERENCES.reducedMotion;
}

function normalizeFont(value: unknown): ReaderFont {
  return READER_FONTS.includes(value as ReaderFont)
    ? (value as ReaderFont)
    : DEFAULT_READING_PREFERENCES.fontFamily;
}

/**
 * Accepts the named steps and, for readers who stored the earlier free-form
 * `lineHeight` number, the closest step to that number.
 */
function normalizeLineSpacing(value: unknown, legacyLineHeight: unknown): ReaderLineSpacing {
  if (READER_LINE_SPACINGS.includes(value as ReaderLineSpacing)) {
    return value as ReaderLineSpacing;
  }
  if (typeof legacyLineHeight === "number" && Number.isFinite(legacyLineHeight)) {
    return READER_LINE_SPACINGS.reduce((best, step) =>
      Math.abs(LINE_SPACING_VALUES[step] - legacyLineHeight) <
      Math.abs(LINE_SPACING_VALUES[best] - legacyLineHeight)
        ? step
        : best,
    );
  }
  return DEFAULT_READING_PREFERENCES.lineSpacing;
}

export function normalizeReadingPreferences(value: unknown): ReadingPreferences {
  if (!isRecord(value)) return DEFAULT_READING_PREFERENCES;
  return {
    fontFamily: normalizeFont(value.fontFamily),
    fontScale: clampNumber(
      value.fontScale,
      READER_PREFERENCE_LIMITS.fontScale.min,
      READER_PREFERENCE_LIMITS.fontScale.max,
      DEFAULT_READING_PREFERENCES.fontScale,
    ),
    lineSpacing: normalizeLineSpacing(value.lineSpacing, value.lineHeight),
    fullWidth: value.fullWidth === true,
    reducedMotion: normalizeReducedMotion(value.reducedMotion),
  };
}

function readPreferences() {
  return readReaderStorage(
    READER_STORAGE_KEYS.preferences,
    (value) => normalizeReadingPreferences(value),
    DEFAULT_READING_PREFERENCES,
  );
}

const preferencesStore = createReaderStore<ReadingPreferences>({
  key: READER_STORAGE_KEYS.preferences,
  fallback: DEFAULT_READING_PREFERENCES,
  read: readPreferences,
  write: (value) =>
    writeReaderStorage(READER_STORAGE_KEYS.preferences, normalizeReadingPreferences(value)),
  equals: (left, right) =>
    left.fontFamily === right.fontFamily &&
    left.fontScale === right.fontScale &&
    left.lineSpacing === right.lineSpacing &&
    left.fullWidth === right.fullWidth &&
    left.reducedMotion === right.reducedMotion,
});

export function getReadingPreferences(): ReadingPreferences {
  preferencesStore.hydrate();
  return preferencesStore.getSnapshot();
}

export function setReadingPreferences(next: Partial<ReadingPreferences>) {
  const current = getReadingPreferences();
  preferencesStore.update(normalizeReadingPreferences({ ...current, ...next }));
}

export function resetReadingPreferences() {
  preferencesStore.reset();
}

export function useReadingPreferences(): ReadingPreferences {
  return useReaderStore(preferencesStore);
}

/** Move text size by whole steps, clamped to the stepper's bounds. */
export function stepFontScale(direction: 1 | -1) {
  const { min, max, step } = READER_PREFERENCE_LIMITS.fontScale;
  const next = getReadingPreferences().fontScale + direction * step;
  // Round to the step grid so repeated float additions cannot drift.
  const snapped = Math.round(next / step) * step;
  setReadingPreferences({ fontScale: Math.min(max, Math.max(min, snapped)) });
}

/**
 * Resolve the final motion decision from the OS media query and the explicit
 * persisted override. Keeping this pure makes the precedence easy to test.
 */
export function resolveReducedMotion(
  systemReduced: boolean,
  preference: ReducedMotionPreference,
): boolean {
  if (preference === "reduce") return true;
  if (preference === "no-preference") return false;
  return systemReduced;
}

/** Apply inherited reader variables and a site-wide motion data attribute. */
export function useApplyReadingPreferences() {
  const preferences = useReadingPreferences();

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--reader-font-scale", String(preferences.fontScale));
    root.style.setProperty(
      "--reader-line-height",
      String(LINE_SPACING_VALUES[preferences.lineSpacing]),
    );
    root.dataset.readerFont = preferences.fontFamily;
    root.dataset.readerWidth = preferences.fullWidth ? "full" : "measure";
    root.dataset.readerMotion = preferences.reducedMotion;
  }, [preferences]);

  return preferences;
}

/**
 * Route/layout integration can mount this once to apply the persisted values
 * before interactive children start animating. The controls remain optional.
 */
export function ReadingPreferencesProvider({ children }: { children: React.ReactNode }) {
  useApplyReadingPreferences();
  return children;
}

export function useReadingPreferenceActions() {
  return useMemo(
    () => ({
      set: (next: Partial<ReadingPreferences>) => setReadingPreferences(next),
      reset: resetReadingPreferences,
    }),
    [],
  );
}

export function useSetReadingPreference() {
  return useCallback((next: Partial<ReadingPreferences>) => setReadingPreferences(next), []);
}
