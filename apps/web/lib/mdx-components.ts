import { CanonBadge } from "@/components/classification/canon-badge";
import { AnatomyPlate } from "@/components/content/anatomy-plate";
import { AtmosphereComparison } from "@/components/content/atmosphere-comparison";
import { BilateralLatticeTree } from "@/components/content/bilateral-lattice-tree";
import { BreathingModeToggle } from "@/components/content/breathing-mode-toggle";
import { Callout, ScientificNote, SideNote } from "@/components/content/callout";
import { CarbonVsSilicon } from "@/components/content/carbon-vs-silicon";
import { CharacterMatrixCladogram } from "@/components/content/character-matrix-cladogram";
import { Chart } from "@/components/content/chart";
import { ChiralityHandedness } from "@/components/content/chirality-handedness";
import { CirculationBands } from "@/components/content/circulation-bands";
import { ColdLightReaction } from "@/components/content/cold-light-reaction";
import { Comparison } from "@/components/content/comparison";
import { ConfidenceDial } from "@/components/content/confidence-dial";
import { ConfidenceMeter } from "@/components/content/confidence-meter";
import { ConvergenceToggle } from "@/components/content/convergence-toggle";
import { CountercurrentExchange } from "@/components/content/countercurrent-exchange";
import { DataComparison, StatGrid } from "@/components/content/data-comparison";
import { DetectionMethodScope } from "@/components/content/detection-method-scope";
import { DiagramFigure } from "@/components/content/diagram-figure";
import { EclipseDayClock } from "@/components/content/eclipse-day-clock";
import { Figure } from "@/components/content/figure";
import { FigureGrid } from "@/components/content/figure-grid";
import { FlightPowerCeiling } from "@/components/content/flight-power-ceiling";
import { FroudeGaitDial } from "@/components/content/froude-gait-dial";
import { FunctionalResponseCurves } from "@/components/content/functional-response-curves";
import { GlowBiogeographyToggle } from "@/components/content/glow-biogeography-toggle";
import { GlowOriginsTree } from "@/components/content/glow-origins-tree";
import { HabitableZoneExplorer } from "@/components/content/habitable-zone-explorer";
import { HalfLifeDecay } from "@/components/content/half-life-decay";
import { HoxColinearityMap } from "@/components/content/hox-colinearity-map";
import { IsochronPlot } from "@/components/content/isochron-plot";
import { KeystoneCascadeToggle } from "@/components/content/keystone-cascade-toggle";
import { LimbFieldToggle } from "@/components/content/limb-field-toggle";
import { LongBranchAttractionDemo } from "@/components/content/long-branch-attraction-demo";
import { MagneticCompassExplorer } from "@/components/content/magnetic-compass-explorer";
import { NichePartitionExplorer } from "@/components/content/niche-partition-explorer";
import { NightEyeOptics } from "@/components/content/night-eye-optics";
import { OpenQuestions } from "@/components/content/open-questions";
import { PhotophoreIntensity } from "@/components/content/photophore-intensity";
import { PredatorPreyOscillator } from "@/components/content/predator-prey-oscillator";
import { Quote } from "@/components/content/quote";
import { ReplayTheTape } from "@/components/content/replay-the-tape";
import { ScrollSequence } from "@/components/content/scroll-sequence";
import { SquareCubeScaler } from "@/components/content/square-cube-scaler";
import { SuperconductorCooldown } from "@/components/content/superconductor-cooldown";
import { TierLegend } from "@/components/content/tier-legend";
import { Timeline } from "@/components/content/timeline";
import { TwentySecondsTimeline } from "@/components/content/twenty-seconds-timeline";
import { UmweltLens } from "@/components/content/umwelt-lens";
import { WhatThisMeans } from "@/components/content/what-this-means";
import { WhittakerBiomeExplorer } from "@/components/content/whittaker-biome-explorer";
import { XenobiologyLadder } from "@/components/content/xenobiology-ladder";
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
  BilateralLatticeTree,
  BreathingModeToggle,
  Callout,
  CanonBadge,
  CarbonVsSilicon,
  ChapterHero,
  ChapterShell,
  CharacterMatrixCladogram,
  Chart,
  ChiralityHandedness,
  CirculationBands,
  ColdLightReaction,
  Comparison,
  ConfidenceDial,
  ConfidenceMeter,
  ConvergenceToggle,
  CountercurrentExchange,
  DataComparison,
  DetectionMethodScope,
  DiagramFigure,
  EclipseDayClock,
  Figure,
  FigureGrid,
  FlightPowerCeiling,
  FloatingMountainFigure,
  FluxFieldFigure,
  FroudeGaitDial,
  FunctionalResponseCurves,
  GlossaryTerm,
  GlowBiogeographyToggle,
  GlowOriginsTree,
  HabitableZoneExplorer,
  HalfLifeDecay,
  HoxColinearityMap,
  KeystoneCascadeToggle,
  MagneticCompassExplorer,
  NichePartitionExplorer,
  IsochronPlot,
  LimbFieldToggle,
  LongBranchAttractionDemo,
  NightEyeOptics,
  OpenQuestions,
  OrbitClock,
  PhotophoreIntensity,
  PredatorPreyOscillator,
  Quote,
  ReadingProgress,
  RelatedChapters,
  ReplayTheTape,
  ScientificNote,
  ScrollSequence,
  SideNote,
  SourceList,
  SquareCubeScaler,
  StatGrid,
  SuperconductorCooldown,
  TableOfContents,
  TierLegend,
  Timeline,
  TwentySecondsTimeline,
  UmweltLens,
  WhatThisMeans,
  WhittakerBiomeExplorer,
  XenobiologyLadder,
} as const;

export type MDXComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

export function getMDXComponents(extra?: Record<string, unknown>): Record<string, unknown> {
  return { ...pandoraMdxComponents, ...(extra ?? {}) };
}
