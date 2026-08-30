/**
 * Small, defensive localStorage adapter for client-only reader state.
 *
 * Storage is an untrusted boundary: browsers can disable it, extensions can
 * throw from it, and users can edit its contents. Every read therefore
 * validates the versioned envelope and falls back without surfacing an error
 * to the rendering tree.
 */

export const READER_STORAGE_VERSION = 1 as const;

export const READER_STORAGE_KEYS = {
  history: "pandora:reading-history:v1",
  preferences: "pandora:reading-preferences:v1",
  audio: "pandora:audio-state:v1",
} as const;

export type ReaderStorageKey = (typeof READER_STORAGE_KEYS)[keyof typeof READER_STORAGE_KEYS];

interface VersionedEnvelope<T> {
  version: typeof READER_STORAGE_VERSION;
  data: T;
}

type StorageListener = () => void;

const listeners = new Map<string, Set<StorageListener>>();
let bridgeAttached = false;

function emit(key: string) {
  const keyListeners = listeners.get(key);
  if (!keyListeners) return;
  for (const listener of keyListeners) listener();
}

function attachStorageBridge() {
  if (bridgeAttached || typeof window === "undefined") return;
  bridgeAttached = true;
  window.addEventListener("storage", (event) => {
    let localStorage: Storage | null = null;
    try {
      localStorage = window.localStorage;
    } catch {
      // A blocked storage area should not break the global event bridge.
    }
    if (event.storageArea !== null && localStorage && event.storageArea !== localStorage) return;
    if (event.key === null) {
      for (const key of listeners.keys()) emit(key);
    } else {
      emit(event.key);
    }
  });
}

/** Subscribe to one key, with a single cross-tab storage listener per tab. */
export function subscribeReaderStorage(key: string, listener: StorageListener): () => void {
  if (typeof window === "undefined") return () => {};
  attachStorageBridge();
  let keyListeners = listeners.get(key);
  if (!keyListeners) {
    keyListeners = new Set();
    listeners.set(key, keyListeners);
  }
  keyListeners.add(listener);
  return () => {
    keyListeners?.delete(listener);
    if (keyListeners?.size === 0) listeners.delete(key);
  };
}

/** Notify subscribers in this tab after a successful local write. */
export function notifyReaderStorageChanged(key: string) {
  if (typeof window !== "undefined") emit(key);
}

function getLocalStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readReaderStorage<T>(
  key: string,
  parse: (value: unknown) => T | null,
  fallback: T,
): T {
  const storage = getLocalStorage();
  if (!storage) return fallback;

  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    const envelope: unknown = JSON.parse(raw);
    if (!isVersionedEnvelope(envelope)) return fallback;
    return parse(envelope.data) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeReaderStorage<T>(key: string, data: T): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;

  try {
    const envelope: VersionedEnvelope<T> = {
      version: READER_STORAGE_VERSION,
      data,
    };
    storage.setItem(key, JSON.stringify(envelope));
    return true;
  } catch {
    // QuotaExceededError and SecurityError are intentionally swallowed. The
    // in-memory store remains usable for this page session.
    return false;
  }
}

export function removeReaderStorage(key: string): boolean {
  const storage = getLocalStorage();
  if (!storage) return false;
  try {
    storage.removeItem(key);
    notifyReaderStorageChanged(key);
    return true;
  } catch {
    return false;
  }
}

function isVersionedEnvelope(value: unknown): value is VersionedEnvelope<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === READER_STORAGE_VERSION &&
    "data" in value
  );
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  if (!finiteNumber(value)) return fallback;
  return Math.min(max, Math.max(min, value));
}

export function safeString(value: unknown, maxLength = 160): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
}
