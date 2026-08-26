import {
  DEFAULT_READING_PREFERENCES,
  READER_PREFERENCE_LIMITS,
  getReadingPreferences,
  normalizeReadingPreferences,
  resetReadingPreferences,
  resolveReducedMotion,
  setReadingPreferences,
  stepFontScale,
} from "@/lib/engagement/preferences-store";
import {
  COMPLETION_THRESHOLD,
  MAX_READING_HISTORY,
  clearReadingHistory,
  getReadingHistory,
  getReadingLocation,
  isReadingComplete,
  normalizeReadingHistory,
  saveReadingLocation,
} from "@/lib/engagement/reading-store";
import {
  READER_STORAGE_KEYS,
  readReaderStorage,
  subscribeReaderStorage,
} from "@/lib/engagement/storage";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("reader storage", () => {
  beforeEach(() => {
    localStorage.clear();
    clearReadingHistory();
    resetReadingPreferences();
  });

  it("falls back for corrupt and old-version envelopes", () => {
    const fallback = { safe: true };
    localStorage.setItem(READER_STORAGE_KEYS.history, "not-json");
    expect(readReaderStorage(READER_STORAGE_KEYS.history, () => null, fallback)).toEqual(fallback);

    localStorage.setItem(
      READER_STORAGE_KEYS.history,
      JSON.stringify({ version: 0, data: [{ locale: "en" }] }),
    );
    expect(readReaderStorage(READER_STORAGE_KEYS.history, () => null, fallback)).toEqual(fallback);
  });

  it("clamps preference values and ignores unknown enum members", () => {
    const preferences = normalizeReadingPreferences({
      fontFamily: "comic",
      fontScale: 99,
      lineSpacing: "airy",
      fullWidth: "yes",
      reducedMotion: "fast",
    });
    expect(preferences).toEqual({
      fontFamily: DEFAULT_READING_PREFERENCES.fontFamily,
      fontScale: READER_PREFERENCE_LIMITS.fontScale.max,
      lineSpacing: DEFAULT_READING_PREFERENCES.lineSpacing,
      fullWidth: false,
      reducedMotion: DEFAULT_READING_PREFERENCES.reducedMotion,
    });

    setReadingPreferences({ fontScale: 1.2, reducedMotion: "reduce", fontFamily: "mono" });
    expect(getReadingPreferences()).toMatchObject({
      fontScale: 1.2,
      reducedMotion: "reduce",
      fontFamily: "mono",
    });
    expect(resolveReducedMotion(false, "reduce")).toBe(true);
    expect(resolveReducedMotion(true, "no-preference")).toBe(false);
  });

  it("maps a legacy free-form lineHeight onto the nearest named step", () => {
    expect(normalizeReadingPreferences({ lineHeight: 1.45 }).lineSpacing).toBe("tight");
    expect(normalizeReadingPreferences({ lineHeight: 1.8 }).lineSpacing).toBe("normal");
    expect(normalizeReadingPreferences({ lineHeight: 2.2 }).lineSpacing).toBe("loose");
  });

  it("steps text size on the step grid and stops at the bounds", () => {
    const { min, max, step } = READER_PREFERENCE_LIMITS.fontScale;
    setReadingPreferences({ fontScale: 1 });
    stepFontScale(1);
    expect(getReadingPreferences().fontScale).toBeCloseTo(1 + step);

    setReadingPreferences({ fontScale: max });
    stepFontScale(1);
    expect(getReadingPreferences().fontScale).toBeCloseTo(max);

    setReadingPreferences({ fontScale: min });
    stepFontScale(-1);
    expect(getReadingPreferences().fontScale).toBeCloseTo(min);
  });

  it("keeps at most twenty recent chapter locations and marks completion", () => {
    for (let index = 0; index < MAX_READING_HISTORY + 1; index += 1) {
      saveReadingLocation({ locale: "en", slug: `chapter-${index}`, progress: index / 20 });
    }
    const history = getReadingHistory();
    expect(history).toHaveLength(MAX_READING_HISTORY);
    expect(history.some((entry) => entry.slug === "chapter-0")).toBe(false);

    const complete = saveReadingLocation({
      locale: "vi",
      slug: "finished",
      progress: COMPLETION_THRESHOLD,
    });
    expect(isReadingComplete(complete)).toBe(true);
    expect(getReadingLocation("vi", "finished")?.completed).toBe(true);
  });

  it("deduplicates malformed history by chapter identity", () => {
    const history = normalizeReadingHistory([
      { locale: "en", slug: "one", progress: 0.2, updatedAt: 1 },
      { locale: "en", slug: "one", progress: 0.8, updatedAt: 2 },
      { locale: "", slug: "bad", progress: 0.5, updatedAt: 3 },
    ]);
    expect(history).toEqual([
      expect.objectContaining({ locale: "en", slug: "one", progress: 0.8 }),
    ]);
  });

  it("bridges a storage event to one key subscriber", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeReaderStorage(READER_STORAGE_KEYS.preferences, listener);
    localStorage.setItem(
      READER_STORAGE_KEYS.preferences,
      JSON.stringify({ version: 1, data: DEFAULT_READING_PREFERENCES }),
    );
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: READER_STORAGE_KEYS.preferences,
        storageArea: localStorage,
      }),
    );
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
