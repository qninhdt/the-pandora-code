"use client";

import { type RefObject, useEffect, useRef, useState } from "react";

// Mount a 3D scene only once it scrolls into view, and report whether it is
// currently visible (so the canvas can pause its frameloop offscreen). Returns
// a ref to attach to the wrapper, a `mounted` latch, and `inView`.
export function useInViewMount<T extends HTMLElement>(): {
  ref: RefObject<T | null>;
  mounted: boolean;
  inView: boolean;
} {
  const ref = useRef<T>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, mounted, inView };
}
