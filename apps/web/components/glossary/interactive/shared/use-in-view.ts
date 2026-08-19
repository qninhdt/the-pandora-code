"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

// Lightweight visibility observer for 2D figures. Returns a ref to attach to the
// wrapper and an `inView` flag that flips as the element enters/leaves the
// viewport. Pair with `useRafLoop` so animations idle while scrolled away.
export function useInView<T extends HTMLElement>(
  options?: { rootMargin?: string; threshold?: number },
): { ref: RefObject<T | null>; inView: boolean } {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => setInView(entries[0]?.isIntersecting ?? false),
      {
        rootMargin: options?.rootMargin ?? "120px 0px",
        threshold: options?.threshold ?? 0.01,
      },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.rootMargin, options?.threshold]);

  return { ref, inView };
}
