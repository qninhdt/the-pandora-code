import type { ClassificationPct } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ConfidenceMeterProps {
  classification?: ClassificationPct;
  className?: string;
}

// Tier hue + the classification key whose display name lives in common.json,
// so confidence-meter, tier-legend, and CanonBadge all read one shared label set.
const tiers = [
  { pctKey: "canon_pct", name: "canon", tone: "--canon" },
  { pctKey: "inference_pct", name: "inference", tone: "--inference" },
  { pctKey: "speculation_pct", name: "speculation", tone: "--speculation" },
  { pctKey: "real_science_pct", name: "real_science", tone: "--real-science" },
] as const;

const defaultClassification: ClassificationPct = {
  canon_pct: 0,
  inference_pct: 0,
  speculation_pct: 0,
  real_science_pct: 0,
};

// A single stacked bar showing how a chapter splits across the four epistemic
// tiers, each segment glowing in its tier hue with a legend beneath.
export function ConfidenceMeter({ classification = defaultClassification, className }: ConfidenceMeterProps) {
  const t = useTranslations("classification");
  const aria = useTranslations("viz.confidenceMeter");
  return (
    <div className={cn("my-8", className)}>
      <div
        className="relative flex h-3.5 w-full overflow-hidden rounded-full border border-border"
        role="img"
        aria-label={aria("aria")}
        style={{
          boxShadow:
            "inset 0 1px 2px 0 color-mix(in oklab, var(--void) 60%, transparent), inset 0 -1px 0 0 color-mix(in oklab, var(--foreground) 6%, transparent)",
        }}
      >
        {tiers.map((tier) => {
          const pct = classification[tier.pctKey];
          if (pct <= 0) return null;
          const c = `var(${tier.tone})`;
          return (
            <div
              key={tier.pctKey}
              className="relative"
              style={{
                width: `${pct}%`,
                // a soft vertical sheen over the tier hue gives the segment depth
                background: `linear-gradient(180deg, color-mix(in oklab, ${c} 80%, var(--foreground)), ${c} 55%, color-mix(in oklab, ${c} 82%, var(--void)))`,
                boxShadow: `inset 0 1px 0 0 color-mix(in oklab, var(--foreground) 22%, transparent), 0 0 14px -3px ${c}`,
              }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {tiers.map((tier) => {
          const pct = classification[tier.pctKey];
          if (pct <= 0) return null;
          return (
            <span
              key={tier.pctKey}
              className="flex items-center gap-1.5 font-sans text-xs text-muted"
            >
              <span
                className="size-2 rounded-full"
                style={{
                  background: `var(${tier.tone})`,
                  boxShadow: `0 0 6px 0 var(${tier.tone})`,
                }}
              />
              {t(tier.name)} <span className="text-foreground tabular-nums">{pct}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
