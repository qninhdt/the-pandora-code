"use client";

import { useLocale, useTranslations } from "next-intl";
import { CanonBadge } from "@/components/classification/canon-badge";
import { AnnotationLayer, type ResolvedLabel } from "@/components/content/figure-annotations";
import { LightboxImage } from "@/components/content/lightbox";
import type { ClassificationKind } from "@/lib/content/schemas/shared";
import { cn } from "@/lib/utils";
import { Tag, TagsIcon } from "lucide-react";
import { toggleAnnotations, useAnnotationsVisible } from "./use-annotations";

type Localized = { vi: string; en: string } | string;

interface DiagramLabel {
  /** Anchor point as a percentage of the image box. */
  x: number;
  y: number;
  /** Short callout text. `label` and `text` are interchangeable. */
  label?: Localized;
  text?: Localized;
  /** Optional second line with a little more detail. */
  note?: Localized;
  /** Which side of the anchor dot the callout box sits on. Default "right". */
  side?: "left" | "right";
}

interface DiagramFigureProps {
  src: string;
  /** Bilingual or pre-localized caption. */
  caption?: Localized;
  /** Positioned callout labels overlaid on the image. */
  labels?: DiagramLabel[];
  alt?: string;
  /** Epistemic tier badge in the caption row. */
  tier?: ClassificationKind;
  /** Plate/figure number for the margin. */
  figNo?: string;
  /** Break out of the reading column to full width. */
  bleed?: boolean;
  className?: string;
}

function pick(v: Localized | undefined, loc: "vi" | "en"): string | undefined {
  if (v === undefined) return undefined;
  return typeof v === "string" ? v : v[loc];
}

// A unified chapter figure: a framed "glass specimen plate" image with
// optional callout labels overlaid on it. A per-figure button toggles the
// labels, but the on/off state is GLOBAL - shared across every figure on every
// page and persisted across visits. Without labels it degrades to a plain
// captioned figure (and the toggle button is hidden).
export function DiagramFigure({
  src,
  caption,
  labels = [],
  alt,
  tier,
  figNo,
  bleed,
  className,
}: DiagramFigureProps) {
  const t = useTranslations("common");
  const locale = useLocale() as "vi" | "en";
  const annotationsVisible = useAnnotationsVisible();
  const captionText = pick(caption, locale);
  const hasLabels = labels.length > 0;
  const showLabels = hasLabels && annotationsVisible;

  // Localized annotation points, shared by the inline overlay and the slideshow.
  const resolved: ResolvedLabel[] = labels.map((l) => ({
    x: l.x,
    y: l.y,
    label: pick(l.label ?? l.text, locale),
    note: pick(l.note, locale),
  }));

  const btnTitle = annotationsVisible
    ? t("hideAllLabels")
    : t("showAllLabels");

  return (
    <figure className={cn("my-8", bleed && "lg:-mx-24", className)}>
      {/* Outer wrapper is NOT clipped, so annotation popovers can extend past
          the image frame instead of being cut off. */}
      <div className="relative">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
          <LightboxImage
            src={src}
            alt={alt ?? captionText ?? ""}
            labels={resolved}
            className="w-full object-contain"
          />

          {/* Global show/hide toggle - rendered per figure, controls all. */}
          {hasLabels && (
            <button
              type="button"
              onClick={toggleAnnotations}
              aria-pressed={annotationsVisible}
              title={btnTitle}
              className={cn(
                "absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border p-1.5",
                "font-sans text-[0.6875rem] font-medium uppercase tracking-wider backdrop-blur-md transition-colors duration-200",
                annotationsVisible
                  ? "border-[color-mix(in_oklab,var(--cyan)_45%,transparent)] bg-[color-mix(in_oklab,var(--cyan)_14%,transparent)] text-cyan"
                  : "border-border bg-void/60 text-subtle hover:text-foreground",
              )}
            >
              {annotationsVisible ? (
                <TagsIcon aria-hidden className="size-3.5" />
              ) : (
                <Tag aria-hidden className="size-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Annotation dots: hover/focus/tap a dot to reveal its callout. */}
        {showLabels && <AnnotationLayer labels={resolved} />}
      </div>

      {(captionText || figNo || tier) && (
        <figcaption className="mt-3 px-1">
          <div className="flex items-start gap-3">
            {figNo && (
              <span className="shrink-0 font-sans text-[0.65rem] uppercase tracking-[0.2em] text-subtle">
                № {figNo}
              </span>
            )}
            {captionText && (
              <span className="hidden flex-1 font-serif text-sm italic leading-relaxed text-muted sm:block">
                {captionText}
              </span>
            )}
            {tier && (
              <CanonBadge kind={tier} className="ml-auto shrink-0 sm:ml-0" />
            )}
          </div>
          {captionText && (
            <span className="mt-2 block font-serif text-sm italic leading-relaxed text-muted sm:hidden">
              {captionText}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
