import { CanonBadge } from "@/components/classification/canon-badge";
import { AnatomyPlate } from "@/components/content/anatomy-plate";
import { AtmosphereComparison } from "@/components/content/atmosphere-comparison";
import { Callout, ScientificNote, SideNote } from "@/components/content/callout";
import { Chart } from "@/components/content/chart";
import { CirculationBands } from "@/components/content/circulation-bands";
import { Comparison } from "@/components/content/comparison";
import { ConfidenceDial } from "@/components/content/confidence-dial";
import { ConfidenceMeter } from "@/components/content/confidence-meter";
import { DataComparison, StatGrid } from "@/components/content/data-comparison";
import { DetectionMethodScope } from "@/components/content/detection-method-scope";
import { DiagramFigure } from "@/components/content/diagram-figure";
import { EclipseDayClock } from "@/components/content/eclipse-day-clock";
import { Figure } from "@/components/content/figure";
import { FigureGrid } from "@/components/content/figure-grid";
import { HabitableZoneExplorer } from "@/components/content/habitable-zone-explorer";
import { HalfLifeDecay } from "@/components/content/half-life-decay";
import { IsochronPlot } from "@/components/content/isochron-plot";
import { OpenQuestions } from "@/components/content/open-questions";
import { Quote } from "@/components/content/quote";
import { ScrollSequence } from "@/components/content/scroll-sequence";
import { SuperconductorCooldown } from "@/components/content/superconductor-cooldown";
import { TierLegend } from "@/components/content/tier-legend";
import { Timeline } from "@/components/content/timeline";
import { TwentySecondsTimeline } from "@/components/content/twenty-seconds-timeline";
import { WhatThisMeans } from "@/components/content/what-this-means";
import { WhittakerBiomeExplorer } from "@/components/content/whittaker-biome-explorer";
import { GlossaryTerm } from "@/components/glossary/glossary-term";
import { ChapterHero } from "@/components/reading/chapter-hero";
import { ChapterShell } from "@/components/reading/chapter-shell";
import { ReadingProgress } from "@/components/reading/reading-progress";
import { RelatedChapters } from "@/components/reading/related-chapters";
import { TableOfContents } from "@/components/reading/table-of-contents";
import { SourceList } from "@/components/sources/source-list";
import { FloatingMountainFigure } from "@/components/three/floating-mountain-figure";
import { FluxFieldFigure } from "@/components/three/flux-field-figure";
import { OrbitClock } from "@/components/three/orbit-clock-figure";
import type { ComponentType } from "react";

export const pandoraMdxComponents = {
  AnatomyPlate,
  AtmosphereComparison,
  Callout,
  CanonBadge,
  ChapterHero,
  ChapterShell,
  Chart,
  CirculationBands,
  Comparison,
  ConfidenceDial,
  ConfidenceMeter,
  DataComparison,
  DetectionMethodScope,
  DiagramFigure,
  EclipseDayClock,
  Figure,
  FigureGrid,
  FloatingMountainFigure,
  FluxFieldFigure,
  GlossaryTerm,
  HabitableZoneExplorer,
  HalfLifeDecay,
  IsochronPlot,
  OpenQuestions,
  OrbitClock,
  Quote,
  ReadingProgress,
  RelatedChapters,
  ScientificNote,
  ScrollSequence,
  SideNote,
  SourceList,
  StatGrid,
  SuperconductorCooldown,
  TableOfContents,
  TierLegend,
  Timeline,
  TwentySecondsTimeline,
  WhatThisMeans,
  WhittakerBiomeExplorer,
} as const;

export type MDXComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

export function getMDXComponents(extra?: Record<string, unknown>): Record<string, unknown> {
  return { ...pandoraMdxComponents, ...(extra ?? {}) };
}
