"use client";

import { useEffect } from "react";

// Bind ⌘K / Ctrl+K to toggle the command palette. Ignores the combo when the
// user is typing in an input/textarea/contenteditable so it never hijacks text
// entry elsewhere on the page.
export function useSearchHotkey(onToggle: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const el = document.activeElement;
        const tag = el?.tagName;
        const typing =
          tag === "INPUT" ||
          tag === "TEXTAREA" ||
          (el instanceof HTMLElement && el.isContentEditable);
        if (typing) return;
        e.preventDefault();
        onToggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onToggle]);
}
