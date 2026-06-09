import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface WhatThisMeansProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

// A "what this means" takeaway block - the payoff line that ties the Pandora
// hook back to the real science. Glows teal to mark the meal, not the bait. The
// default heading falls back to the shared chapter label so it stays in the
// reader's locale instead of a hardcoded English string.
export function WhatThisMeans({ title, children, className }: WhatThisMeansProps) {
  const t = useTranslations("chapter");
  return (
    <aside
      className={cn("my-8 rounded-2xl border p-5", className)}
      style={{
        borderColor: "color-mix(in oklab, var(--teal) 30%, transparent)",
        background: "color-mix(in oklab, var(--teal) 8%, transparent)",
        boxShadow: "0 0 40px -20px color-mix(in oklab, var(--teal) 60%, transparent)",
      }}
    >
      <p className="mb-2 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wider text-teal">
        <Sparkles size={14} />
        {title ?? t("whatThisMeans")}
      </p>
      <div className="font-serif text-base leading-relaxed text-foreground/90">{children}</div>
    </aside>
  );
}
