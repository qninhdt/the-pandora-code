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
