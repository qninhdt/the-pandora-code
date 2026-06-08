import { cn } from "@/lib/utils";

interface DiagonalBreakProps {
  /** Tint of the faint glowing edge. */
  tone?: "cyan" | "teal" | "magenta";
  /** Flip the slant direction. */
  flip?: boolean;
  className?: string;
}

// Full-bleed angled section divider — a clip-path slash with a faint glowing
// edge, separating editorial bands without a hard horizontal line.
export function DiagonalBreak({ tone = "cyan", flip = false, className }: DiagonalBreakProps) {
  const clip = flip
    ? "polygon(0 100%, 100% 0, 100% 100%, 0 100%)"
    : "polygon(0 0, 100% 100%, 0 100%)";
  return (
    <div aria-hidden className={cn("relative h-24 w-full overflow-hidden", className)}>
      <div
        className="absolute inset-0"
        style={{
          clipPath: clip,
          background: `linear-gradient(${flip ? "-12deg" : "12deg"}, color-mix(in oklab, var(--${tone}) 14%, transparent), transparent 70%)`,
        }}
      />
    </div>
  );
}
