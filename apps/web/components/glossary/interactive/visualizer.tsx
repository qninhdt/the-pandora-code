"use client";

import dynamic from "next/dynamic";
import type React from "react";
import type { GlossaryVisualizationId } from "./registry";

const GLOSSARY_VISUALIZATIONS: Record<
  GlossaryVisualizationId,
  React.ComponentType<{ locale: string }>
> = {
  "alpha-centauri": dynamic(() => import("./alpha-centauri"), { ssr: false }),
  "habitable-zone": dynamic(() => import("./habitable-zone"), { ssr: false }),
  exomoon: dynamic(() => import("./exomoon"), { ssr: false }),
  "tidal-heating": dynamic(() => import("./tidal-heating"), { ssr: false }),
  "roche-limit": dynamic(() => import("./roche-limit"), { ssr: false }),
  "radial-velocity": dynamic(() => import("./radial-velocity"), { ssr: false }),
  "direct-imaging": dynamic(() => import("./direct-imaging"), { ssr: false }),
  "transit-timing-variation": dynamic(() => import("./transit-timing-variation"), { ssr: false }),
  "hox-genes": dynamic(() => import("./hox-genes"), { ssr: false }),
  "niche-partitioning": dynamic(() => import("./niche-partitioning"), { ssr: false }),
  "countercurrent-exchange": dynamic(() => import("./countercurrent-exchange"), { ssr: false }),
  bioluminescence: dynamic(() => import("./bioluminescence"), { ssr: false }),
  cladogram: dynamic(() => import("./cladogram"), { ssr: false }),
  allometry: dynamic(() => import("./allometry"), { ssr: false }),
  "lotka-volterra-equations": dynamic(() => import("./lotka-volterra-equations"), { ssr: false }),
  chirality: dynamic(() => import("./chirality"), { ssr: false }),
  umwelt: dynamic(() => import("./umwelt"), { ssr: false }),
  "occams-razor": dynamic(() => import("./occams-razor"), { ssr: false }),
  "tidal-locking": dynamic(() => import("./tidal-locking"), { ssr: false }),
  "atmospheric-disequilibrium": dynamic(() => import("./atmospheric-disequilibrium"), {
    ssr: false,
  }),
  "half-life": dynamic(() => import("./half-life"), { ssr: false }),
  "quantum-locking": dynamic(() => import("./quantum-locking"), { ssr: false }),
  "hadley-cell": dynamic(() => import("./hadley-cell"), { ssr: false }),
  "percolation-theory": dynamic(() => import("./percolation-theory"), { ssr: false }),
  "integrated-information-theory": dynamic(() => import("./integrated-information-theory"), {
    ssr: false,
  }),
  "biological-market": dynamic(() => import("./biological-market"), { ssr: false }),
  "shannon-entropy": dynamic(() => import("./shannon-entropy"), { ssr: false }),
  daisyworld: dynamic(() => import("./daisyworld"), { ssr: false }),
  "cohesion-tension": dynamic(() => import("./cohesion-tension"), { ssr: false }),
  "dynamic-soaring": dynamic(() => import("./dynamic-soaring"), { ssr: false }),
  "square-cube-law": dynamic(() => import("./square-cube-law"), { ssr: false }),
  "transmission-spectroscopy": dynamic(() => import("./transmission-spectroscopy"), { ssr: false }),
};

interface GlossaryVisualizerProps {
  term: string;
  locale: string;
}

export function GlossaryVisualizer({ term, locale }: GlossaryVisualizerProps) {
  const Visualizer = GLOSSARY_VISUALIZATIONS[term as GlossaryVisualizationId];
  if (!Visualizer) return null;
  return <Visualizer locale={locale} />;
}
