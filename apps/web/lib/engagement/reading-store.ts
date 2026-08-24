"use client";

import { useMemo } from "react";
import {
  READER_STORAGE_KEYS,
  clampNumber,
  finiteNumber,
  isRecord,
  readReaderStorage,
  safeString,
  writeReaderStorage,
} from "./storage";
import { createReaderStore, useReaderStore } from "./use-reader-store";

export const MAX_READING_HISTORY = 20;
export const COMPLETION_THRESHOLD = 0.95;

export interface ReaderChapterKey {
  locale: string;
  slug: string;
}

export interface ReadingLocation extends ReaderChapterKey {
  progress: number;
  /** Absolute document scroll offset captured for exact same-page resume. */
  scrollY?: number;
  updatedAt: number;
  completed: boolean;
}

const EMPTY_HISTORY: readonly ReadingLocation[] = [];

function chapterKey(locale: string, slug: string): string {
  return `${locale}\u0000${slug}`;
}

function normalizeLocation(value: unknown): ReadingLocation | null {
  if (!isRecord(value)) return null;
  const locale = safeString(value.locale, 12);
  const slug = safeString(value.slug, 180);
  if (!locale || !slug) return null;

  const progress = clampNumber(value.progress, 0, 1, 0);
  const scrollY =
    finiteNumber(value.scrollY) && value.scrollY >= 0
      ? Math.min(value.scrollY, 100_000_000)
      : undefined;
  const updatedAt = finiteNumber(value.updatedAt) && value.updatedAt > 0 ? value.updatedAt : 0;
  return {
    locale,
    slug,
    progress,
    ...(scrollY === undefined ? {} : { scrollY }),
    updatedAt,
    completed: value.completed === true || progress >= COMPLETION_THRESHOLD,
  };
}

function normalizeHistory(value: unknown): readonly ReadingLocation[] {
  if (!Array.isArray(value)) return EMPTY_HISTORY;
  const deduped = new Map<string, ReadingLocation>();
  for (const item of value) {
    const location = normalizeLocation(item);
    if (!location) continue;
    const id = chapterKey(location.locale, location.slug);
    const existing = deduped.get(id);
    if (!existing || location.updatedAt >= existing.updatedAt) deduped.set(id, location);
  }
  return [...deduped.values()]
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, MAX_READING_HISTORY);
}

function readHistory(): readonly ReadingLocation[] {
  return readReaderStorage(
    READER_STORAGE_KEYS.history,
    (value) => normalizeHistory(value),
    EMPTY_HISTORY,
  );
}

const historyStore = createReaderStore<readonly ReadingLocation[]>({
  key: READER_STORAGE_KEYS.history,
  fallback: EMPTY_HISTORY,
  read: readHistory,
  write: (value) => writeReaderStorage(READER_STORAGE_KEYS.history, normalizeHistory(value)),
  equals: (left, right) => left === right,
});

/** Returns the most recent valid chapter locations, newest first. */
export function getReadingHistory(): readonly ReadingLocation[] {
  historyStore.hydrate();
  return historyStore.getSnapshot();
}

export function getReadingLocation(locale: string, slug: string): ReadingLocation | null {
  return (
    getReadingHistory().find((location) => location.locale === locale && location.slug === slug) ??
    null
  );
}

export function saveReadingLocation(
  location: ReaderChapterKey & Partial<Pick<ReadingLocation, "progress" | "scrollY" | "completed">>,
): ReadingLocation {
  const now = Date.now();
  const previous = getReadingLocation(location.locale, location.slug);
  const next = normalizeLocation({
    locale: location.locale,
    slug: location.slug,
    progress: location.progress ?? previous?.progress ?? 0,
    scrollY: location.scrollY ?? previous?.scrollY,
    completed: location.completed ?? previous?.completed ?? false,
    updatedAt: now,
  });

  // The public API only accepts valid key values in normal app usage. The
  // guard keeps malformed integration calls harmless in development/tests.
  if (!next) {
    return (
      previous ?? {
        locale: String(location.locale),
        slug: String(location.slug),
        progress: 0,
        updatedAt: now,
        completed: false,
      }
    );
  }

  const withoutChapter = getReadingHistory().filter(
    (item) => chapterKey(item.locale, item.slug) !== chapterKey(next.locale, next.slug),
  );
  historyStore.update(normalizeHistory([next, ...withoutChapter]));
  return next;
}

export function removeReadingLocation(locale: string, slug: string) {
  historyStore.update(
    getReadingHistory().filter(
      (item) => chapterKey(item.locale, item.slug) !== chapterKey(locale, slug),
    ),
  );
}

export function clearReadingHistory() {
  historyStore.reset();
}

export function useReadingHistory(): readonly ReadingLocation[] {
  return useReaderStore(historyStore);
}

export function useReadingLocation(locale: string | undefined, slug: string | undefined) {
  const history = useReadingHistory();
  return useMemo(() => {
    if (!locale || !slug) return null;
    return history.find((item) => item.locale === locale && item.slug === slug) ?? null;
  }, [history, locale, slug]);
}

export function isReadingComplete(location: Pick<ReadingLocation, "progress" | "completed">) {
  return location.completed || location.progress >= COMPLETION_THRESHOLD;
}

// Exported for focused unit tests and future build-time diagnostics.
export function normalizeReadingHistory(value: unknown): readonly ReadingLocation[] {
  return normalizeHistory(value);
}
