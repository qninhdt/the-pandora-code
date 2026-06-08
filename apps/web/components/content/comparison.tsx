import { cn } from "@/lib/utils";

interface ComparisonProps {
  left: { title: string; children?: React.ReactNode };
  right: { title: string; children?: React.ReactNode };
  /** Optional center label, e.g. "Pandora" vs "Earth". */
  className?: string;
}

// Two glass columns set side by side for a Pandora-vs-real comparison. The
// columns tint cyan (left) and teal (right) so the contrast reads instantly.
export function Comparison({ left, right, className }: ComparisonProps) {
  return (
    <div className={cn("my-8 grid gap-4 sm:grid-cols-2", className)}>
      {[
        { side: left, tone: "--cyan" },
        { side: right, tone: "--teal" },
      ].map(({ side, tone }, i) => (
        <div
          key={i}
          className="rounded-2xl border p-5 backdrop-blur-sm"
          style={{
            borderColor: `color-mix(in oklab, var(${tone}) 26%, transparent)`,
            background: `color-mix(in oklab, var(${tone}) 6%, transparent)`,
          }}
        >
          <h4 className="mb-3 font-display text-base font-700" style={{ color: `var(${tone})` }}>
            {side.title}
          </h4>
          <div className="font-serif text-[0.95rem] leading-relaxed text-foreground/90">
            {side.children}
          </div>
        </div>
      ))}
    </div>
  );
}
