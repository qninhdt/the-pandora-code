import { staticUrl } from "@/lib/static-url";

interface PageBackgroundProps {
  src: string;
  /**
   * Scrim strength. Listing pages with dense card grids want a heavy scrim so
   * the imagery stays a faint mood; airier pages can go lighter. 0-1.
   */
  intensity?: number;
}

// Full-bleed, fixed page backdrop for listing pages. Generalizes
// ChapterBackground: a single painted vista pinned behind everything (below the
// atmosphere fireflies at z-index -1, so they glow over it) with a strong dark
// gradient scrim that keeps headers and card grids fully legible. Purely
// decorative; no motion, so it is inherently reduced-motion safe.
export function PageBackground({ src, intensity = 0.9 }: PageBackgroundProps) {
  const top = Math.round(70 + intensity * 22); // 70-92% void at the top
  const bottom = Math.round(82 + intensity * 14); // 82-96% void at the bottom
  return (
    <div className="fixed inset-0 -z-[2]" aria-hidden>
      <img src={staticUrl(src)} alt="" className="size-full object-cover" />
      {/* Dark scrim: the image stays a mood, never competes with the text. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, color-mix(in oklab, var(--void) ${top}%, transparent), color-mix(in oklab, var(--void) ${bottom}%, transparent))`,
        }}
      />
    </div>
  );
}
