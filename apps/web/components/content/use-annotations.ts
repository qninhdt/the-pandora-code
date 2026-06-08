"use client";

import { useSyncExternalStore } from "react";

// A single global flag controlling whether figure annotations (callout labels)
// are shown. Shared across every DiagramFigure on every page, persisted to
// localStorage and synchronised across tabs. Default is ON.

const STORAGE_KEY = "pandora:annotations-visible";

let visible = true;
let hydrated = false;
const listeners = new Set<() => void>();

function readFromStorage(): boolean {
  if (typeof window === "undefined") return true;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  // Absent / unrecognised => default ON.
  return raw === null ? true : raw === "1";
}

function emit() {
  for (const l of listeners) l();
}

// Pull the persisted value into memory exactly once on the client. Done lazily
// from subscribe (post-mount) so the first client render still matches the
// server snapshot and avoids a hydration mismatch.
function hydrateOnce() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const persisted = readFromStorage();
  if (persisted !== visible) {
    visible = persisted;
    emit();
  }
}

export function setAnnotationsVisible(next: boolean) {
  if (next === visible) return;
  visible = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  }
  emit();
}

export function toggleAnnotations() {
  setAnnotationsVisible(!visible);
}

function subscribe(onChange: () => void): () => void {
  hydrateOnce();
  listeners.add(onChange);

  // Cross-tab sync: mirror changes written by other tabs.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    const next = readFromStorage();
    if (next !== visible) {
      visible = next;
      emit();
    }
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => visible;
const getServerSnapshot = () => true;

/** Subscribe to the global "annotations visible" flag. */
export function useAnnotationsVisible(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
