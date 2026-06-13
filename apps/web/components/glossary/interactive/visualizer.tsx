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
