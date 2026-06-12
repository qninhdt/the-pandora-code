"use client";

// Versioned localStorage layer for engagement features (reading history +
// bookmarks). Each key is namespaced + versioned so a future shape change can
// reset cleanly instead of crashing on stale JSON. All access is guarded for
// SSR (typeof window) so importing this module never throws server-side.

const READING_KEY = "pandora.reading.v1";
const BOOKMARKS_KEY = "pandora.bookmarks.v1";

const MAX_READING_ENTRIES = 20;

export interface ReadingEntry {
  slug: string;
  locale: "vi" | "en";
  title: string;
  scrollPct: number;
  ts: number;
}

export interface BookmarkEntry {
  type: "chapter" | "glossary";
  slug: string;
  locale: "vi" | "en";
  title: string;
  ts: number;
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

// useSyncExternalStore requires a STABLE snapshot reference between renders
// (else "getSnapshot should be cached" crashes). Cache the sorted array keyed
// on the raw localStorage string, so the reference only changes when the
// stored value actually changes.
const snapshotCache = new Map<string, { raw: string | null; value: unknown[] }>();

function readSorted<T>(key: string, sort: (a: T, b: T) => number): T[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(key);
  const cached = snapshotCache.get(key);
  if (cached && cached.raw === raw) return cached.value as T[];
  const value = read<T>(key).sort(sort);
  snapshotCache.set(key, { raw, value });
  return value;
}

function write<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or disabled — fail silently; engagement is best-effort.
  }
}

// Notify same-tab listeners (the native "storage" event only fires in OTHER
// tabs). Components subscribe to re-read after a mutation in this tab.
const EVENT = "pandora:engagement";
function emit() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(EVENT));
}

export function subscribe(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  // Only react to our own keys when the native cross-tab storage event fires.
  const onStorage = (e: StorageEvent) => {
    if (e.key === READING_KEY || e.key === BOOKMARKS_KEY) listener();
  };
  window.addEventListener(EVENT, listener);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}

// --- Reading history -------------------------------------------------------

export function getReadingHistory(): ReadingEntry[] {
  return readSorted<ReadingEntry>(READING_KEY, (a, b) => b.ts - a.ts);
}

// Reading history is keyed by (slug, locale): the same chapter read in both
// languages is two distinct entries, since each carries a locale-correct title
// and the continue-reading surface filters by locale.
export function recordReading(entry: Omit<ReadingEntry, "ts">): void {
  const history = read<ReadingEntry>(READING_KEY).filter(
    (e) => !(e.slug === entry.slug && e.locale === entry.locale),
  );
  history.unshift({ ...entry, ts: Date.now() });
  write(READING_KEY, history.slice(0, MAX_READING_ENTRIES));
  emit();
}

// --- Bookmarks -------------------------------------------------------------

export function getBookmarks(): BookmarkEntry[] {
  return readSorted<BookmarkEntry>(BOOKMARKS_KEY, (a, b) => b.ts - a.ts);
}

// Bookmark identity includes locale so the same chapter/term can be saved in
// both languages independently (each stores its locale-correct title, and
// /saved filters by the active locale).
function bookmarkId(type: BookmarkEntry["type"], locale: string, slug: string): string {
  return `${type}:${locale}:${slug}`;
}

export function isBookmarked(
  type: BookmarkEntry["type"],
  locale: string,
  slug: string,
): boolean {
  const id = bookmarkId(type, locale, slug);
  return read<BookmarkEntry>(BOOKMARKS_KEY).some(
    (b) => bookmarkId(b.type, b.locale, b.slug) === id,
  );
}

export function toggleBookmark(entry: Omit<BookmarkEntry, "ts">): boolean {
  const id = bookmarkId(entry.type, entry.locale, entry.slug);
  const current = read<BookmarkEntry>(BOOKMARKS_KEY);
  const exists = current.some((b) => bookmarkId(b.type, b.locale, b.slug) === id);
  const next = exists
    ? current.filter((b) => bookmarkId(b.type, b.locale, b.slug) !== id)
    : [{ ...entry, ts: Date.now() }, ...current];
  write(BOOKMARKS_KEY, next);
  emit();
  return !exists;
}

export function removeBookmark(
  type: BookmarkEntry["type"],
  locale: string,
  slug: string,
): void {
  const id = bookmarkId(type, locale, slug);
  write(
    BOOKMARKS_KEY,
    read<BookmarkEntry>(BOOKMARKS_KEY).filter(
      (b) => bookmarkId(b.type, b.locale, b.slug) !== id,
    ),
  );
  emit();
}
