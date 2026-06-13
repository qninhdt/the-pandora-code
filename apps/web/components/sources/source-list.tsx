import type { Source } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface SourceListProps {
  sources: Source[];
  heading?: string;
  className?: string;
}

const kindStyle: Record<Source["kind"], string> = {
  canon: "text-[color:var(--canon)]",
  science: "text-[color:var(--real-science)]",
  community: "text-[color:var(--speculation)]",
  "research-note": "text-[color:var(--inference)]",
  wiki: "text-[color:var(--inference)]",
  other: "text-[color:var(--muted)]",
};

export function SourceList({ sources = [], heading, className }: SourceListProps) {
  const t = useTranslations("sources");
  if (sources.length === 0) return null;
  return (
    <section
      className={cn("my-12 border-t border-[color:var(--border)] pt-8", className)}
      aria-label={heading ?? t("heading")}
    >
      <h3 className="text-xs uppercase tracking-wide font-mono mb-4 text-[color:var(--muted)]">
        {heading ?? t("heading")}
      </h3>
      <ol className="space-y-3 list-decimal pl-6 text-sm">
        {sources.map((s, i) => (
          <li key={`${s.kind}-${i}-${s.label}`} className="leading-relaxed">
            <span
              className={cn("text-xs font-mono uppercase tracking-wide mr-2", kindStyle[s.kind])}
            >
              {t(`kinds.${s.kind}`)}
            </span>
            {s.url ? (
              <a href={s.url} className="font-medium" rel="noreferrer noopener" target="_blank">
                {s.label}
              </a>
            ) : (
              <span className="font-medium">{s.label}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
