import { CanonBadge } from "@/components/classification/canon-badge";
import { LightboxImage } from "@/components/content/lightbox";
import type { ClassificationKind } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";

interface FigureProps {
  src: string;
  /** Bilingual caption - both translated in the same pass. */
  caption?: { vi: string; en: string } | string;
  locale?: "vi" | "en";
  alt?: string;
  tier?: ClassificationKind;
  /** Plate/figure number for the margin. */
  figNo?: string;
  /** Break out of the reading column to full width. */
  bleed?: boolean;
  className?: string;
}

// A chapter figure: framed image, a figure number, an optional classification
// tag, and a bilingual caption. The frame reads as a glass specimen plate.
export function Figure({
  src,
  caption,
  locale = "vi",
  alt,
  tier,
  figNo,
  bleed,
  className,
}: FigureProps) {
  const text = typeof caption === "string" ? caption : caption?.[locale];
  return (
    <figure className={cn("my-8", bleed && "lg:-mx-24", className)}>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <LightboxImage src={src} alt={alt ?? text ?? ""} className="w-full object-cover" />
      </div>
      {(text || figNo || tier) && (
        <figcaption className="mt-3 px-1">
          {/* Meta row: on mobile the figure number and tier badge share a line
              above the caption; on sm+ they flank the caption inline. */}
          <div className="flex items-start gap-3">
            {figNo && (
              <span className="shrink-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-subtle">
                № {figNo}
              </span>
            )}
            {text && (
              <span className="hidden flex-1 font-serif text-sm italic leading-relaxed text-muted sm:block">
                {text}
              </span>
            )}
            {tier && (
              <CanonBadge kind={tier} locale={locale} className="ml-auto shrink-0 sm:ml-0" />
            )}
          </div>
          {text && (
            <span className="mt-2 block font-serif text-sm italic leading-relaxed text-muted sm:hidden">
              {text}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
