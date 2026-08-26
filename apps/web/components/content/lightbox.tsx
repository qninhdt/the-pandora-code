"use client";

import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import YARLightbox, { type SlideImage } from "yet-another-react-lightbox";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { AnnotationLayer, type ResolvedLabel, parseLabels } from "./figure-annotations";

// Event the clickable images dispatch to ask the singleton Lightbox to open at
// a given source. Decoupling via a window event lets any image in the rendered
// MDX drive one shared viewer without a provider threaded through the tree.
const OPEN_EVENT = "pandora:lightbox-open";

type AnnoSlide = SlideImage & { labels?: ResolvedLabel[] };

interface LightboxImageProps {
  src: string;
  alt?: string;
  className?: string;
  wrapperClassName?: string;
  /** Annotation callouts carried into the fullscreen slideshow. */
  labels?: ResolvedLabel[];
}

// A clickable image that opens the shared fullscreen slideshow. It tags itself
// with `data-lightbox-src` (and, if annotated, the labels as JSON) so the viewer
// can collect every such image on the page in DOM order.
export function LightboxImage({
  src,
  alt,
  className,
  wrapperClassName,
  labels,
}: LightboxImageProps) {
  return (
    <button
      type="button"
      className={cn("group block w-full cursor-zoom-in", wrapperClassName)}
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { src } }))}
      aria-label={alt ? `Phóng to: ${alt}` : "Phóng to ảnh"}
    >
      <img
        data-lightbox-src={src}
        data-lightbox-labels={labels?.length ? JSON.stringify(labels) : undefined}
        src={src}
        alt={alt ?? ""}
        className={cn(
          "w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]",
          className,
        )}
      />
    </button>
  );
}

// The single fullscreen slideshow for a page (mounted once in ChapterShell).
// Powered by yet-another-react-lightbox: swipe, keyboard, a thumbnail strip, and
// counter come for free. Each slide is custom-rendered so the figure's
// annotation dots + popovers ride along on the fullscreen image too.
export function Lightbox() {
  const t = useTranslations("lightbox");
  const [open, setOpen] = useState(false);
  const [slides, setSlides] = useState<AnnoSlide[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handler = (e: Event) => {
      const src = (e as CustomEvent<{ src: string }>).detail?.src;
      const nodes = Array.from(document.querySelectorAll<HTMLImageElement>("[data-lightbox-src]"));
      const list: AnnoSlide[] = nodes.map((n) => ({
        src: n.getAttribute("data-lightbox-src") ?? n.src,
        alt: n.alt,
        labels: parseLabels(n.getAttribute("data-lightbox-labels")),
      }));
      const idx = Math.max(
        0,
        list.findIndex((it) => it.src === src),
      );
      setSlides(list);
      setIndex(idx);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, handler);
    return () => window.removeEventListener(OPEN_EVENT, handler);
  }, []);

  const renderSlide = useCallback(
    ({ slide }: { slide: AnnoSlide }) => (
      <div className="relative flex h-full w-full items-center justify-center">
        <div className="relative">
          <img
            src={slide.src}
            alt={slide.alt ?? ""}
            className="max-h-[80vh] max-w-[92vw] object-contain"
            draggable={false}
          />
          {slide.labels && slide.labels.length > 0 && <AnnotationLayer labels={slide.labels} />}
        </div>
      </div>
    ),
    [],
  );

  return (
    <YARLightbox
      open={open}
      close={() => setOpen(false)}
      index={index}
      on={{ view: ({ index: i }) => setIndex(i) }}
      slides={slides}
      plugins={[Thumbnails]}
      thumbnails={{ position: "bottom", width: 96, height: 64, border: 0, gap: 8, padding: 4 }}
      carousel={{ finite: false, padding: 0 }}
      controller={{ closeOnBackdropClick: true }}
      styles={{ container: { backgroundColor: "rgba(4,6,12,0.94)" } }}
      labels={{
        Previous: t("previous"),
        Next: t("next"),
        Close: t("close"),
      }}
      render={{ slide: renderSlide }}
    />
  );
}
