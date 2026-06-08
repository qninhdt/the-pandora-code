"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

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
  locale?: "vi" | "en";
  className?: string;
}

function pick(
  v: { vi: string; en: string } | string | undefined,
  loc: "vi" | "en",
) {
  if (!v) return undefined;
  return typeof v === "string" ? v : v[loc];
}

// A creature/structure plate with interactive hotspots. Hovering/focusing a
// glowing node reveals its bilingual label + note - a naturalist's annotated
// specimen drawing.
export function AnatomyPlate({
  src,
  title,
  hotspots,
  locale = "vi",
  className,
}: AnatomyPlateProps) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <figure className={cn("my-8", className)}>
      {title && (
        <p className="mb-3 font-sans text-[0.65rem] uppercase tracking-[0.25em] text-subtle">
          {title}
        </p>
      )}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface">
        <img src={src} alt={title ?? ""} className="w-full object-contain" />
        {hotspots.map((h, i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${h.x}%`, top: `${h.y}%` }}
            aria-label={pick(h.label, locale)}
          >
            <span
              className="block size-3 rounded-full transition-transform hover:scale-125"
              style={{
                background: "var(--cyan)",
                boxShadow: "0 0 12px 1px var(--cyan)",
              }}
            />
            {active === i && (
              <span className="absolute left-5 top-1/2 z-10 w-44 -translate-y-1/2 rounded-lg border border-border-strong bg-void/90 p-2.5 text-left backdrop-blur">
                <span className="block font-sans text-xs font-semibold text-cyan">
                  {pick(h.label, locale)}
                </span>
                {pick(h.note, locale) && (
                  <span className="mt-1 block font-serif text-xs leading-snug text-muted">
                    {pick(h.note, locale)}
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>
    </figure>
  );
}
