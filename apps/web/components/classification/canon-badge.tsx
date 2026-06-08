import type { ClassificationKind } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";

// Built fresh for the dark bioluminescent system. Each tier glows in its own
// hue - a tiny dot of "living light" plus a soft outer bloom - so the four
// epistemic tiers read at a glance against the void without shouting.

const labelMap: Record<ClassificationKind, { vi: string; en: string }> = {
  canon: { vi: "Chính truyện", en: "Canon" },
  inference: { vi: "Suy luận", en: "Inference" },
  speculation: { vi: "Suy đoán", en: "Speculation" },
  real_science: { vi: "Khoa học thật", en: "Real science" },
};

// Token var per tier, used for text, dot, ring, and bloom.
const tierVar: Record<ClassificationKind, string> = {
  canon: "--canon",
  inference: "--inference",
  speculation: "--speculation",
  real_science: "--real-science",
};

interface CanonBadgeProps {
  kind: ClassificationKind;
  locale?: "vi" | "en";
  className?: string;
  children?: React.ReactNode;
}

export function CanonBadge({ kind, locale = "vi", className, children }: CanonBadgeProps) {
  const c = `var(${tierVar[kind]})`;
  return (
    <span
      data-classification={kind}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "font-sans text-[0.6875rem] font-medium uppercase tracking-wider whitespace-nowrap",
        "backdrop-blur-sm transition-colors duration-200",
        className,
      )}
      style={{
        color: c,
        borderColor: `color-mix(in oklab, ${c} 35%, transparent)`,
        background: `color-mix(in oklab, ${c} 9%, transparent)`,
        boxShadow: `0 0 14px -6px color-mix(in oklab, ${c} 70%, transparent)`,
      }}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{ background: c, boxShadow: `0 0 6px 0 ${c}` }}
      />
      {children ?? labelMap[kind][locale]}
    </span>
  );
}
