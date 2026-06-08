import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

// Frosted-glass surface that content floats on, at varying depth. Higher depth
// = more blur + opacity + lift, so panels read as nearer/farther in the scene.
const glassPanel = cva(
  "relative rounded-2xl border backdrop-blur-xl transition-colors",
  {
    variants: {
      depth: {
        1: "border-border/60 bg-surface/40",
        2: "border-border bg-surface/55",
        3: "border-border-strong bg-surface-raised/70",
      },
      glow: {
        none: "",
        cyan: "",
        teal: "",
        magenta: "",
      },
    },
    defaultVariants: { depth: 2, glow: "none" },
  },
);

const glowShadow: Record<string, string | undefined> = {
  none: undefined,
  cyan: "0 12px 50px -18px color-mix(in oklab, var(--cyan) 55%, transparent)",
  teal: "0 12px 50px -18px color-mix(in oklab, var(--teal) 50%, transparent)",
  magenta:
    "0 12px 50px -18px color-mix(in oklab, var(--magenta) 50%, transparent)",
};

interface GlassPanelProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassPanel> {}

export function GlassPanel({
  depth,
  glow,
  className,
  style,
  children,
  ...rest
}: GlassPanelProps) {
  return (
    <div
      className={cn(glassPanel({ depth, glow }), className)}
      style={{ boxShadow: glow ? glowShadow[glow] : undefined, ...style }}
      {...rest}
    >
      {/* top inner highlight - the "lit edge" of glass */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, var(--foreground) 22%, transparent), transparent)",
        }}
      />
      {children}
    </div>
  );
}
