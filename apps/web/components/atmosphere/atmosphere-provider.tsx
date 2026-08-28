"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { AtmosphereProfile } from "./atmosphere-config";
import { AtmosphereFallback } from "./atmosphere-fallback";
import { useAtmosphereTier } from "./use-atmosphere-tier";

// WebGL canvas is client-only and lazy: it never enters the server bundle and
// only downloads once the device qualifies for the `webgl` tier.
const AtmosphereCanvas = dynamic(
  () => import("./atmosphere-canvas").then((m) => m.AtmosphereCanvas),
  { ssr: false },
);

// Reader routes get the calmer field so it never competes with long-form text.
function profileFor(pathname: string): AtmosphereProfile {
  return /\/chapters\/[^/]+$/.test(pathname) ? "calm" : "full";
}

// Mounted once in the locale layout, fixed behind all content, persisting
// across route changes so WebGL never re-initializes on navigation.
export function AtmosphereProvider() {
  const { tier, weaker } = useAtmosphereTier();
  const pathname = usePathname();
  const profile = profileFor(pathname);
  const isLanding = /^\/(?:en|vi)\/?$/.test(pathname);
  const landingFallback = tier === "fallback" && isLanding;
  const landingWebgl = tier === "webgl" && isLanding;

  // Pause the WebGL loop while the tab is hidden (battery / CPU).
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <>
      <div className="atmosphere-layer" aria-hidden>
        {tier === "pending" ? null : tier === "webgl" ? (
          landingWebgl ? null : (
            <AtmosphereCanvas profile={profile} weaker={weaker} paused={hidden} />
          )
        ) : (
          <AtmosphereFallback showMotes={!isLanding} />
        )}
        {/* Light vignette: center stays clear so the field shows; edges deepen
            toward the void to frame the content. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(130% 100% at 50% 40%, transparent 0%, transparent 55%, color-mix(in oklab, var(--void) 55%, transparent) 100%)",
          }}
        />
      </div>
      {/* Keep the complete landing atmosphere above painted vistas but below
          each section's content stack. One transparent canvas avoids creating
          two WebGL contexts while preserving both haze and drifting spores. */}
      {landingWebgl && (
        <div className="atmosphere-landing-overlay" aria-hidden>
          <AtmosphereCanvas profile={profile} weaker={weaker} paused={hidden} />
        </div>
      )}
      {landingFallback && <div className="atmosphere-motes-overlay" aria-hidden />}
    </>
  );
}
