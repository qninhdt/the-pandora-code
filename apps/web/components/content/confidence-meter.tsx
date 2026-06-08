import type { ClassificationPct } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";

interface ConfidenceMeterProps {
  classification: ClassificationPct;
  locale?: "vi" | "en";
  className?: string;
}

const tiers = [
  { key: "canon_pct", tone: "--canon", vi: "Chính truyện", en: "Canon" },
  { key: "inference_pct", tone: "--inference", vi: "Suy luận", en: "Inference" },
  { key: "speculation_pct", tone: "--speculation", vi: "Suy đoán", en: "Speculation" },
  { key: "real_science_pct", tone: "--real-science", vi: "Khoa học thật", en: "Real science" },
] as const;

// A single stacked bar showing how a chapter splits across the four epistemic
// tiers, each segment glowing in its tier hue with a legend beneath.
export function ConfidenceMeter({
  classification,
  locale = "vi",
  className,
}: ConfidenceMeterProps) {
  return (
    <div className={cn("my-8", className)}>
      <div className="flex h-3 w-full overflow-hidden rounded-full border border-border">
        {tiers.map((t) => {
          const pct = classification[t.key];
          if (pct <= 0) return null;
          const c = `var(${t.tone})`;
          return (
            <div
              key={t.key}
              style={{
                width: `${pct}%`,
                background: c,
                boxShadow: `0 0 12px -2px ${c}`,
              }}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {tiers.map((t) => {
          const pct = classification[t.key];
          if (pct <= 0) return null;
          return (
            <span key={t.key} className="flex items-center gap-1.5 font-sans text-xs text-muted">
              <span
                className="size-2 rounded-full"
                style={{ background: `var(${t.tone})`, boxShadow: `0 0 6px 0 var(${t.tone})` }}
              />
              {t[locale]} <span className="text-foreground tabular-nums">{pct}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
