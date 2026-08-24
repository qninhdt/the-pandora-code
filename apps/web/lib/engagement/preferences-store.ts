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

export const READER_PREFERENCE_LIMITS = {
  fontScale: { min: 0.9, max: 1.3, step: 0.05 },
  lineHeight: { min: 1.4, max: 2.2, step: 0.1 },
  columnWidth: { min: 60, max: 100, step: 1 },
} as const;

export type ReducedMotionPreference = "system" | "reduce" | "no-preference";

export interface ReadingPreferences {
  fontScale: number;
  lineHeight: number;
  columnWidth: number;
  reducedMotion: ReducedMotionPreference;
}

export const DEFAULT_READING_PREFERENCES: ReadingPreferences = {
  fontScale: 1,
  lineHeight: 1.8,
  columnWidth: 84,
  reducedMotion: "system",
};

function normalizeReducedMotion(value: unknown): ReducedMotionPreference {
  return value === "reduce" || value === "no-preference" || value === "system"
    ? value
    : DEFAULT_READING_PREFERENCES.reducedMotion;
}

export function normalizeReadingPreferences(value: unknown): ReadingPreferences {
  if (!isRecord(value)) return DEFAULT_READING_PREFERENCES;
  return {
    fontScale: clampNumber(
      value.fontScale,
      READER_PREFERENCE_LIMITS.fontScale.min,
      READER_PREFERENCE_LIMITS.fontScale.max,
      DEFAULT_READING_PREFERENCES.fontScale,
    ),
    lineHeight: clampNumber(
      value.lineHeight,
      READER_PREFERENCE_LIMITS.lineHeight.min,
      READER_PREFERENCE_LIMITS.lineHeight.max,
      DEFAULT_READING_PREFERENCES.lineHeight,
    ),
    columnWidth: clampNumber(
      value.columnWidth,
      READER_PREFERENCE_LIMITS.columnWidth.min,
      READER_PREFERENCE_LIMITS.columnWidth.max,
      DEFAULT_READING_PREFERENCES.columnWidth,
    ),
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
    left.fontScale === right.fontScale &&
    left.lineHeight === right.lineHeight &&
    left.columnWidth === right.columnWidth &&
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
    root.style.setProperty("--reader-line-height", String(preferences.lineHeight));
    root.style.setProperty("--reader-measure", `${preferences.columnWidth}ch`);
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
