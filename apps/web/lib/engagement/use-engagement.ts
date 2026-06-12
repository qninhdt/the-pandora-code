"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import {
  type BookmarkEntry,
  type ReadingEntry,
  getBookmarks,
  getReadingHistory,
  isBookmarked,
  subscribe,
  toggleBookmark,
} from "./storage";

export type { BookmarkEntry, ReadingEntry };

// SSR-safe reads: useSyncExternalStore returns the server snapshot ([]) during
// hydration, then the real localStorage value after mount — no hydration
// mismatch, no flash of stale state.

const EMPTY_READING: ReadingEntry[] = [];
const EMPTY_BOOKMARKS: BookmarkEntry[] = [];

export function useReadingHistory(): ReadingEntry[] {
  return useSyncExternalStore(subscribe, getReadingHistory, () => EMPTY_READING);
}

export function useBookmarks(): BookmarkEntry[] {
  return useSyncExternalStore(subscribe, getBookmarks, () => EMPTY_BOOKMARKS);
}

// Single bookmark toggle for a specific item. Returns the live state + a toggle
// fn. `mounted` guards the very first paint so the trigger renders a stable
// (un-bookmarked) state on the server and updates once localStorage is read.
export function useBookmark(entry: Omit<BookmarkEntry, "ts">) {
  const [mounted, setMounted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBookmarked(isBookmarked(entry.type, entry.locale, entry.slug));
    return subscribe(() => setBookmarked(isBookmarked(entry.type, entry.locale, entry.slug)));
  }, [entry.type, entry.locale, entry.slug]);

  const toggle = useCallback(() => {
    setBookmarked(toggleBookmark(entry));
  }, [entry]);

  return { bookmarked: mounted && bookmarked, mounted, toggle };
}
