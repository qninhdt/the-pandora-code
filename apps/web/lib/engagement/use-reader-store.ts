"use client";

import { useSyncExternalStore } from "react";
import { notifyReaderStorageChanged, subscribeReaderStorage } from "./storage";

export interface ReaderStore<T> {
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  hydrate: () => void;
  update: (next: T) => void;
  reset: () => void;
}

interface CreateReaderStoreOptions<T> {
  key: string;
  fallback: T;
  read: () => T;
  write: (value: T) => boolean;
  equals?: (left: T, right: T) => boolean;
}

/**
 * Create a React 19-compatible external store with an SSR-safe default.
 * Hydration is deliberately lazy: server and first client render both see the
 * same fallback, then persisted data is loaded after subscription.
 */
export function createReaderStore<T>({
  key,
  fallback,
  read,
  write,
  equals = Object.is,
}: CreateReaderStoreOptions<T>): ReaderStore<T> {
  let current = fallback;
  let hydrated = false;
  const listeners = new Set<() => void>();

  const emit = () => {
    for (const listener of listeners) listener();
  };

  const hydrate = () => {
    if (hydrated || typeof window === "undefined") return;
    hydrated = true;
    const persisted = read();
    if (!equals(current, persisted)) {
      current = persisted;
      emit();
    }
  };

  const onExternalStorageChange = () => {
    const persisted = read();
    if (equals(current, persisted)) return;
    current = persisted;
    emit();
  };

  const subscribe = (listener: () => void) => {
    hydrate();
    listeners.add(listener);
    const unsubscribeStorage = subscribeReaderStorage(key, onExternalStorageChange);
    return () => {
      listeners.delete(listener);
      unsubscribeStorage();
    };
  };

  const update = (next: T) => {
    if (equals(current, next)) return;
    current = next;
    if (typeof window !== "undefined") {
      write(next);
      notifyReaderStorageChanged(key);
    }
    emit();
  };

  const reset = () => update(fallback);

  return {
    getSnapshot: () => current,
    getServerSnapshot: () => fallback,
    subscribe,
    hydrate,
    update,
    reset,
  };
}

export function useReaderStore<T>(store: ReaderStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
}
