import { staticUrl } from "@/lib/static-url";

interface ChapterBackgroundProps {
  src: string;
}

// Full-bleed per-chapter background image, fixed behind everything — including
// the atmosphere fireflies (which sit at z-index -1), so the drifting fireflies
// glow *over* this macro vista. A shaped scrim keeps long-form text readable
// without crushing the image into a black wash. Purely decorative.
export function ChapterBackground({ src }: ChapterBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-[2]" aria-hidden>
      <img
        src={staticUrl(src)}
        alt=""
        className="size-full scale-[1.02] object-cover"
        style={{ filter: "brightness(0.98) saturate(1.1) contrast(1.03)" }}
      />
      {/* Keep the vista visible while still easing it back behind long-form text. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 78% at 50% 42%, transparent 0%, color-mix(in oklab, var(--void) 30%, transparent) 58%, color-mix(in oklab, var(--void) 68%, transparent) 100%), linear-gradient(to bottom, color-mix(in oklab, var(--void) 42%, transparent) 0%, color-mix(in oklab, var(--void) 58%, transparent) 42%, color-mix(in oklab, var(--void) 86%, transparent) 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(72rem 28rem at 18% 18%, color-mix(in oklab, var(--cyan) 8%, transparent), transparent 62%), radial-gradient(64rem 26rem at 82% 16%, color-mix(in oklab, var(--teal) 6%, transparent), transparent 60%)",
        }}
      />
    </div>
  );
}
