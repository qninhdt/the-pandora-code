// 2D atmosphere for low-power devices and prefers-reduced-motion. Pure CSS +
// the style-anchor poster - no canvas, no JS animation loop. Drifting motes use
// a CSS keyframe that is disabled under reduced motion (see globals.css).

interface AtmosphereFallbackProps {
  /** Landing pages render a fixed particle layer above their painted vistas. */
  showMotes?: boolean;
}

export function AtmosphereFallback({ showMotes = true }: AtmosphereFallbackProps) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      {/* Establishing-shot poster, deeply darkened so text stays readable. */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.18]"
        style={{
          backgroundImage: "url(/images/atmosphere/pandora-establishing.png)",
        }}
      />
      {/* Bioluminescent glow blooms. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70rem 50rem at 15% -10%, color-mix(in oklab, var(--cyan) 16%, transparent), transparent 60%), radial-gradient(55rem 45rem at 88% 8%, color-mix(in oklab, var(--teal) 12%, transparent), transparent 58%), radial-gradient(60rem 60rem at 50% 115%, color-mix(in oklab, var(--magenta) 9%, transparent), transparent 60%)",
        }}
      />
      {/* Slow drifting mote layer (CSS keyframe; off under reduced motion). */}
      {showMotes && <div className="atmosphere-motes absolute inset-0" />}
      {/* Fade toward the void at the edges. */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(120% 100% at 50% 40%, transparent 55%, var(--void) 100%)",
        }}
      />
    </div>
  );
}
