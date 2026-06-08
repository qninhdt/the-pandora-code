import { CanonBadge } from "@/components/classification/canon-badge";
import type { ClassificationPct, LocalizedString } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";

interface ChapterHeroProps {
  title: LocalizedString;
  subtitle?: LocalizedString;
  hook?: LocalizedString;
  authors?: string[];
  readingTimeMin?: number;
  classification: ClassificationPct;
  locale: "vi" | "en";
  /** Optional hero image (the chapter's establishing figure) for full-bleed. */
  imageSrc?: string;
  className?: string;
}

// Full-bleed chapter opening: a deep bioluminescent gradient (or the chapter's
// establishing figure) behind the title, with the Bardabez byline, reading time
// and a classification summary. Breaks out of the reading measure for impact.
export function ChapterHero({
  title,
  subtitle,
  hook,
  authors,
  readingTimeMin,
  classification,
  locale,
  imageSrc,
  className,
}: ChapterHeroProps) {
  const tiers = [
    { kind: "canon" as const, pct: classification.canon_pct },
    { kind: "inference" as const, pct: classification.inference_pct },
    { kind: "speculation" as const, pct: classification.speculation_pct },
    { kind: "real_science" as const, pct: classification.real_science_pct },
  ].filter((t) => t.pct > 0);

  return (
    <header className={cn("relative isolate overflow-hidden", className)}>
      {/* Backdrop: chapter figure if present, else a living gradient field. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="size-full object-cover opacity-40" />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(80rem 40rem at 20% -10%, color-mix(in oklab, var(--cyan) 22%, transparent), transparent 60%), radial-gradient(60rem 40rem at 90% 10%, color-mix(in oklab, var(--magenta) 14%, transparent), transparent 55%)",
          }}
        />
        {/* fade the backdrop into the page so content below sits on void */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{ background: "linear-gradient(to bottom, transparent, var(--void))" }}
        />
      </div>

      <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 sm:pt-32">
        {tiers.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {tiers.map((t) => (
              <CanonBadge key={t.kind} kind={t.kind} locale={locale}>
                {`${labelFor(t.kind, locale)} ${t.pct}%`}
              </CanonBadge>
            ))}
          </div>
        )}

        <h1 className="font-display text-4xl font-800 leading-[1.05] tracking-tight text-foreground sm:text-6xl">
          {title[locale]}
        </h1>

        {subtitle && (
          <p className="mt-4 max-w-2xl font-serif text-xl leading-snug text-muted sm:text-2xl">
            {subtitle[locale]}
          </p>
        )}

        {hook && (
          <p
            className="mt-8 max-w-2xl border-l-2 pl-5 font-serif text-lg italic leading-relaxed text-foreground/90"
            style={{ borderColor: "var(--cyan)" }}
          >
            {hook[locale]}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 font-sans text-sm text-muted">
          {authors && authors.length > 0 && (
            <span className="flex items-center gap-2">
              <span
                aria-hidden
                className="size-1.5 rounded-full"
                style={{ background: "var(--teal)", boxShadow: "0 0 8px 0 var(--teal)" }}
              />
              <span className="text-foreground">{authors.join(", ")}</span>
            </span>
          )}
          {readingTimeMin && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} aria-hidden />
              {readingTimeMin} {locale === "vi" ? "phút đọc" : "min read"}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

function labelFor(
  kind: "canon" | "inference" | "speculation" | "real_science",
  locale: "vi" | "en",
) {
  const map = {
    canon: { vi: "Chính truyện", en: "Canon" },
    inference: { vi: "Suy luận", en: "Inference" },
    speculation: { vi: "Suy đoán", en: "Speculation" },
    real_science: { vi: "KH thật", en: "Real sci" },
  };
  return map[kind][locale];
}
