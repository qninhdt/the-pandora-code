interface ChapterBackgroundProps {
  src: string;
}

// Full-bleed per-chapter background image, fixed behind everything — including
// the atmosphere fireflies (which sit at z-index -1), so the drifting fireflies
// glow *over* this macro vista. A heavy dark scrim keeps long-form text readable
// on top. Purely decorative.
export function ChapterBackground({ src }: ChapterBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-[2]" aria-hidden>
      <img src={src} alt="" className="size-full object-cover" />
      {/* Dark scrim: the image stays a mood, never competes with the text. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, color-mix(in oklab, var(--void) 82%, transparent), color-mix(in oklab, var(--void) 92%, transparent))",
        }}
      />
    </div>
  );
}
