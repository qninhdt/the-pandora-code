import { AnnotationLayer, type ResolvedLabel } from "@/components/content/figure-annotations";
import { LightboxImage } from "@/components/content/lightbox";
import { cn } from "@/lib/utils";
import { useLocale } from "next-intl";

interface Hotspot {
  x: number;
  y: number;
  label: { vi: string; en: string } | string;
  note?: { vi: string; en: string } | string;
}

interface AnatomyPlateProps {
  src: string;
  title?: string;
  hotspots: Hotspot[];
  className?: string;
}

function pick(v: { vi: string; en: string } | string | undefined, loc: "vi" | "en") {
  if (!v) return undefined;
  return typeof v === "string" ? v : v[loc];
}

// A creature/structure plate with annotated anchor points. Hover/focus/tap a
// dot to reveal its callout; click the image to open it fullscreen (where the
// same annotations ride along). Nothing is clipped or stacked below the frame.
export function AnatomyPlate({ src, title, hotspots, className }: AnatomyPlateProps) {
  const locale = useLocale() as "vi" | "en";
  const resolved: ResolvedLabel[] = hotspots.map((h) => ({
    x: h.x,
    y: h.y,
    label: pick(h.label, locale),
    note: pick(h.note, locale),
  }));

  return (
    <figure className={cn("my-8", className)}>
      {title && (
        <p className="mb-3 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-subtle">
          {title}
        </p>
      )}
      <div className="relative">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
          <LightboxImage
            src={src}
            alt={title ?? ""}
            labels={resolved}
            className="w-full object-contain"
          />
        </div>
        <AnnotationLayer labels={resolved} />
      </div>
    </figure>
  );
}
