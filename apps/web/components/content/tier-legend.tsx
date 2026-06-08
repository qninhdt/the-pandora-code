import type { ClassificationKind } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";

// The canonical reference for the book's four epistemic tiers. The prologue
// defines the system here; every later chapter's CanonBadge / ConfidenceMeter
// points back to these four hues and meanings. Each tier glows in its own
// token color so the ladder reads at a glance against the void.
//
// Reader-facing strings (gloss / on-Earth equivalent / on-Pandora example) come
// in via props so the EN and VI chapters each supply their own translated copy.
// The tier label and hue are derived from `kind`, matching CanonBadge.

const labelMap: Record<ClassificationKind, { vi: string; en: string }> = {
  canon: { vi: "Chính truyện", en: "Canon" },
  inference: { vi: "Suy luận", en: "Inference" },
  speculation: { vi: "Suy đoán", en: "Speculation" },
  real_science: { vi: "Khoa học thật", en: "Real science" },
};

const tierVar: Record<ClassificationKind, string> = {
  canon: "--canon",
  inference: "--inference",
  speculation: "--speculation",
  real_science: "--real-science",
};

// Mini section labels inside each card, localized from the `locale` prop so MDX
// stays clean (the chapter only supplies the tier-specific copy).
const rowLabels = {
  vi: { earth: "Trên Trái Đất", pandora: "Trên Pandora" },
  en: { earth: "On Earth", pandora: "On Pandora" },
} as const;

interface TierEntry {
  kind: ClassificationKind;
  /** One-line definition of what the tier licenses. */
  gloss: string;
  /** The real-world epistemic practice this tier mirrors. */
  realWorld: string;
  /** A concrete Pandoran claim that sits in this tier. */
  example: string;
}

interface TierLegendProps {
  /** The four tiers, in ladder order. Strings are locale-specific (set per MDX file). */
  tiers: TierEntry[];
  locale?: "vi" | "en";
  /** Optional heading shown above the ladder. */
  title?: string;
  className?: string;
}

export function TierLegend({ tiers, locale = "vi", title, className }: TierLegendProps) {
  const rl = rowLabels[locale];
  return (
    <section
      className={cn(
        "my-10 rounded-2xl border border-border bg-surface/40 p-5 backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      {title && (
        <h3 className="mb-5 font-display text-lg font-700 text-foreground">{title}</h3>
      )}
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map((t, i) => {
          const c = `var(${tierVar[t.kind]})`;
          return (
            <li
              key={t.kind}
              className="flex flex-col rounded-xl border bg-void/30 p-4"
              style={{
                borderColor: `color-mix(in oklab, ${c} 30%, transparent)`,
                boxShadow: `0 0 28px -22px ${c}`,
              }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ background: c, boxShadow: `0 0 7px 0 ${c}` }}
                />
                <span
                  className="font-sans text-[0.7rem] font-semibold uppercase tracking-wider tabular-nums"
                  style={{ color: c }}
                >
                  {String(i + 1).padStart(2, "0")} · {labelMap[t.kind][locale]}
                </span>
              </div>

              <p className="font-serif text-[0.95rem] leading-relaxed text-foreground/90">
                {t.gloss}
              </p>

              <dl className="mt-3 space-y-2 border-t border-border/60 pt-3">
                <div>
                  <dt className="font-sans text-[0.6rem] uppercase tracking-[0.18em] text-subtle">
                    {rl.earth}
                  </dt>
                  <dd className="mt-0.5 font-serif text-[0.85rem] leading-snug text-muted">
                    {t.realWorld}
                  </dd>
                </div>
                <div>
                  <dt
                    className="font-sans text-[0.6rem] uppercase tracking-[0.18em]"
                    style={{ color: `color-mix(in oklab, ${c} 75%, var(--text-muted))` }}
                  >
                    {rl.pandora}
                  </dt>
                  <dd className="mt-0.5 font-serif text-[0.85rem] leading-snug text-muted">
                    {t.example}
                  </dd>
                </div>
              </dl>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
