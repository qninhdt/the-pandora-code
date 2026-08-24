"use client";

import { consumeScrollPosition } from "@/lib/navigation/scroll-position";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Completes the locale-switch scroll hand-off after the new route has painted.
 * A couple of animation frames cover the normal client transition; fonts,
 * images, and late layout shifts are handled by the short ResizeObserver
 * window below.
 */
export function ScrollPositionRestorer() {
  const pathname = usePathname();

  useEffect(() => {
    const route = `${pathname}${window.location.search}${window.location.hash}`;
    const top = consumeScrollPosition(route);
    if (top === null) return;

    let cancelled = false;
    let firstFrame = 0;
    let secondFrame = 0;

    const restore = () => {
      if (cancelled) return;
      window.scrollTo({ top, behavior: "auto" });
    };
    const observer =
      typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => restore());

    function cleanup() {
      if (cancelled) return;
      cancelled = true;
      if (firstFrame) window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(timeout);
      observer?.disconnect();
      window.removeEventListener("load", restore);
      document.fonts?.removeEventListener?.("loadingdone", restore);
    }

    observer?.observe(document.documentElement);

    restore();
    firstFrame = window.requestAnimationFrame(() => {
      restore();
      secondFrame = window.requestAnimationFrame(restore);
    });
    window.addEventListener("load", restore, { once: true });
    document.fonts?.addEventListener?.("loadingdone", restore);
    void document.fonts?.ready.then(() => {
      if (!cancelled) window.requestAnimationFrame(restore);
    });
    const timeout = window.setTimeout(cleanup, 1200);

    return cleanup;
  }, [pathname]);

  return null;
}
