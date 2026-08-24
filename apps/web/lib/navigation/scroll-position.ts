/**
 * A short-lived hand-off for scroll positions across a locale navigation.
 *
 * The locale switcher uses client navigation with `scroll: false`, but the
 * App Router can still replace the page tree before the new localized layout
 * has measured. Session storage bridges that small gap without leaking reader
 * state into localStorage or another browsing session.
 */

export const SCROLL_POSITION_STORAGE_PREFIX = "pandora:scroll-position:v1:";
export const SCROLL_POSITION_MAX_AGE_MS = 2 * 60 * 1000;

interface StoredScrollPosition {
  top: number;
  createdAt: number;
}

function getSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function storageKey(path: string): string {
  return `${SCROLL_POSITION_STORAGE_PREFIX}${path}`;
}

export function rememberScrollPosition(path: string, top: number, now = Date.now()): boolean {
  const storage = getSessionStorage();
  if (!storage || !path || !Number.isFinite(top)) return false;

  const value: StoredScrollPosition = {
    top: Math.max(0, Math.round(top)),
    createdAt: now,
  };
  try {
    storage.setItem(storageKey(path), JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Read once and remove the hand-off so a later fresh visit starts at the top. */
export function consumeScrollPosition(path: string, now = Date.now()): number | null {
  const storage = getSessionStorage();
  if (!storage || !path) return null;

  const key = storageKey(path);
  try {
    const raw = storage.getItem(key);
    storage.removeItem(key);
    if (!raw) return null;

    const value: unknown = JSON.parse(raw);
    if (!isStoredScrollPosition(value)) return null;
    if (now - value.createdAt > SCROLL_POSITION_MAX_AGE_MS || value.createdAt - now > 5_000) {
      return null;
    }
    return value.top;
  } catch {
    return null;
  }
}

function isStoredScrollPosition(value: unknown): value is StoredScrollPosition {
  return (
    typeof value === "object" &&
    value !== null &&
    "top" in value &&
    typeof value.top === "number" &&
    Number.isFinite(value.top) &&
    value.top >= 0 &&
    "createdAt" in value &&
    typeof value.createdAt === "number" &&
    Number.isFinite(value.createdAt)
  );
}
