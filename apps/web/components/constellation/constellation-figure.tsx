"use client";

import { useLowPower } from "@/components/three/use-low-power";
import { useInViewMount } from "@/components/three/use-in-view-mount";
import { type Locale } from "@/i18n/config";
import { type GraphData, loadGraph } from "@/lib/constellation/graph-data";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ConstellationScene } from "./constellation-scene";

interface ConstellationFigureProps {
  locale: Locale;
  labels: { all: string; loading: string; hint: string };
  /** Server-rendered accessible list, shown on low-power / reduced-motion. */
  fallback: React.ReactNode;
}

// Client orchestrator: gates the 3D scene behind the same low-power policy as
// every other 3D figure (reduced-motion / weak device / no-WebGL2 → render the
// accessible fallback). Loads the precomputed graph lazily, then mounts the
// scene with a Part filter and a hover-label readout.
export function ConstellationFigure({ locale, labels, fallback }: ConstellationFigureProps) {
  const lowPower = useLowPower();
  const { ref, mounted, inView } = useInViewMount<HTMLDivElement>();
  const [data, setData] = useState<GraphData | null>(null);
  const [activePart, setActivePart] = useState<string | null>(null);

  const use3D = !lowPower && mounted;

  useEffect(() => {
    if (!use3D || data) return;
    let active = true;
    loadGraph(locale).then((g) => {
      if (active) setData(g);
    });
    return () => {
      active = false;
    };
  }, [use3D, data, locale]);

  // Low-power / reduced-motion: render only the accessible list.
  if (lowPower && mounted) {
    return <div className="reading-column">{fallback}</div>;
  }

  return (
    <div ref={ref}>
      <div className="relative h-[70vh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-border bg-abyss">
        {data && inView ? (
          <>
            <ConstellationScene data={data} activePart={activePart} />
            <PartFilter
              parts={data.parts}
              active={activePart}
              onSelect={setActivePart}
              allLabel={labels.all}
            />
            <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-sans text-xs text-subtle">
              {labels.hint}
            </p>
          </>
        ) : (
          <div className="grid h-full place-items-center font-sans text-sm text-subtle">
            {labels.loading}
          </div>
        )}
      </div>
      {/* The accessible list always remains in the DOM below the canvas, so the
          graph is never the only path to content. */}
      <details className="reading-column mt-6">
        <summary className="cursor-pointer font-sans text-sm text-muted">{labels.all}</summary>
        <div className="mt-4">{fallback}</div>
      </details>
    </div>
  );
}

interface PartFilterProps {
  parts: { id: string; label: string }[];
  active: string | null;
  onSelect: (id: string | null) => void;
  allLabel: string;
}

function PartFilter({ parts, active, onSelect, allLabel }: PartFilterProps) {
  return (
    <div className="absolute left-3 top-3 flex max-w-[60%] flex-wrap gap-1.5">
      <FilterChip label={allLabel} selected={active === null} onClick={() => onSelect(null)} />
      {parts.map((p) => (
        <FilterChip
          key={p.id}
          label={p.label}
          selected={active === p.id}
          onClick={() => onSelect(active === p.id ? null : p.id)}
        />
      ))}
    </div>
  );
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-full border px-2.5 py-1 font-sans text-xs transition-colors",
        selected
          ? "border-cyan/60 bg-cyan/15 text-cyan"
          : "border-border bg-void/60 text-muted hover:border-border-strong hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
