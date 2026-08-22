import { CanonBadge } from "@/components/classification/canon-badge";
import { AirRegimeVisualizer } from "@/components/content/air-regime-visualizer";
import { AnatomyPlate } from "@/components/content/anatomy-plate";
import { AtmosphereComparison } from "@/components/content/atmosphere-comparison";
import { AtmosphericDisequilibrium } from "@/components/content/atmospheric-disequilibrium";
import { BilateralLatticeTree } from "@/components/content/bilateral-lattice-tree";
import { BreathingModeToggle } from "@/components/content/breathing-mode-toggle";
import { Callout, ScientificNote, SideNote } from "@/components/content/callout";
import { CarbonVsSilicon } from "@/components/content/carbon-vs-silicon";
import { CarbonateSilicateThermostat } from "@/components/content/carbonate-silicate-thermostat";
import { CascadingFailure } from "@/components/content/cascading-failure";
import { CharacterMatrixCladogram } from "@/components/content/character-matrix-cladogram";
import { Chart } from "@/components/content/chart";
import { ChiralityHandedness } from "@/components/content/chirality-handedness";
import { CirculationBands } from "@/components/content/circulation-bands";
import { ClaimAudit } from "@/components/content/claim-audit";
import { ColdLightReaction } from "@/components/content/cold-light-reaction";
import { Comparison } from "@/components/content/comparison";
import { ConfidenceDial } from "@/components/content/confidence-dial";
import { ConfidenceMeter } from "@/components/content/confidence-meter";
import { ConsciousBottleneck } from "@/components/content/conscious-bottleneck";
import { ConvergenceToggle } from "@/components/content/convergence-toggle";
import { CountercurrentExchange } from "@/components/content/countercurrent-exchange";
import { Daisyworld } from "@/components/content/daisyworld";
import { DataComparison, StatGrid } from "@/components/content/data-comparison";
import { DetectionMethodScope } from "@/components/content/detection-method-scope";
import { DiagramFigure } from "@/components/content/diagram-figure";
import { DriftingHumanClock } from "@/components/content/drifting-human-clock";
import { EclipseDayClock } from "@/components/content/eclipse-day-clock";
import { EntrainmentRangeDial } from "@/components/content/entrainment-range-dial";
import { Figure } from "@/components/content/figure";
import { FigureGrid } from "@/components/content/figure-grid";
import { FlightCeilingLab } from "@/components/content/flight-ceiling-lab";
import { FoundationVsKeystone } from "@/components/content/foundation-vs-keystone";
import { StrataDiversityEngine } from "@/components/content/strata-diversity-engine";
import { StructureVsBiomassClock } from "@/components/content/structure-vs-biomass-clock";
import { FroudeGaitDial } from "@/components/content/froude-gait-dial";
import { FunctionalResponseCurves } from "@/components/content/functional-response-curves";
import { GiantFlierShowdown } from "@/components/content/giant-flier-showdown";
import { GlowBiogeographyToggle } from "@/components/content/glow-biogeography-toggle";
import { GlowOriginsTree } from "@/components/content/glow-origins-tree";
import { HabitableZoneExplorer } from "@/components/content/habitable-zone-explorer";
import { HalfLifeDecay } from "@/components/content/half-life-decay";
import { HoxColinearityMap } from "@/components/content/hox-colinearity-map";
import { HydraulicLimitSimulator } from "@/components/content/hydraulic-limit-simulator";
import { IntegrationVsSize } from "@/components/content/integration-vs-size";
import { IsochronPlot } from "@/components/content/isochron-plot";
import { KeystoneCascadeToggle } from "@/components/content/keystone-cascade-toggle";
import { LimbFieldToggle } from "@/components/content/limb-field-toggle";
import { LongBranchAttractionDemo } from "@/components/content/long-branch-attraction-demo";
import { MagneticCompassExplorer } from "@/components/content/magnetic-compass-explorer";
import { MaskingOrClock } from "@/components/content/masking-or-clock";
import { MycorrhizalMarket } from "@/components/content/mycorrhizal-market";
import { NichePartitionExplorer } from "@/components/content/niche-partition-explorer";
import { NightEyeOptics } from "@/components/content/night-eye-optics";
import { OccamsRazorEngine } from "@/components/content/occams-razor-engine";
import { OpenQuestions } from "@/components/content/open-questions";
import { PandoraLightLadder } from "@/components/content/pandora-light-ladder";
import { PercolationNetwork } from "@/components/content/percolation-network";
import { PhotophoreIntensity } from "@/components/content/photophore-intensity";
import { TemporalNichePartition } from "@/components/content/temporal-niche-partition";
import { TorukFlightEngine } from "@/components/content/toruk-flight-engine";
import { PredatorPreyOscillator } from "@/components/content/predator-prey-oscillator";
import { QuorumCascade } from "@/components/content/quorum-cascade";
import { Quote } from "@/components/content/quote";
import { ReplayTheTape } from "@/components/content/replay-the-tape";
import { ScaleUpChallenge } from "@/components/content/scale-up-challenge";
import { ScrollSequence } from "@/components/content/scroll-sequence";
import { ShannonChannel } from "@/components/content/shannon-channel";
import { SuperconductorCooldown } from "@/components/content/superconductor-cooldown";
import { Timeline } from "@/components/content/timeline";
import { TierLegend } from "@/components/content/tier-legend";
import { VerticalForestDive } from "@/components/content/vertical-forest-dive";
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
  AirRegimeVisualizer,
  AnatomyPlate,
  AtmosphereComparison,
  AtmosphericDisequilibrium,
  BilateralLatticeTree,
  BreathingModeToggle,
  Callout,
  CanonBadge,
  CarbonVsSilicon,
  CarbonateSilicateThermostat,
  CascadingFailure,
  ChapterHero,
  ChapterShell,
  CharacterMatrixCladogram,
  Chart,
  ChiralityHandedness,
  CirculationBands,
  ClaimAudit,
  ColdLightReaction,
  Comparison,
  ConfidenceDial,
  ConfidenceMeter,
  ConsciousBottleneck,
  ConvergenceToggle,
  CountercurrentExchange,
  Daisyworld,
  DataComparison,
  DetectionMethodScope,
  DiagramFigure,
  DriftingHumanClock,
  EclipseDayClock,
  EntrainmentRangeDial,
  Figure,
  FigureGrid,
  FlightCeilingLab,
  FloatingMountainFigure,
  FluxFieldFigure,
  FoundationVsKeystone,
  StrataDiversityEngine,
  StructureVsBiomassClock,
  FroudeGaitDial,
  FunctionalResponseCurves,
  GiantFlierShowdown,
  GlossaryTerm,
  GlowBiogeographyToggle,
  GlowOriginsTree,
  HabitableZoneExplorer,
  HalfLifeDecay,
  HoxColinearityMap,
  HydraulicLimitSimulator,
  KeystoneCascadeToggle,
  MagneticCompassExplorer,
  MaskingOrClock,
  MycorrhizalMarket,
  NichePartitionExplorer,
  IsochronPlot,
  IntegrationVsSize,
  LimbFieldToggle,
  LongBranchAttractionDemo,
  NightEyeOptics,
  OccamsRazorEngine,
  OpenQuestions,
  OrbitClock,
  PandoraLightLadder,
  PercolationNetwork,
  PhotophoreIntensity,
  TemporalNichePartition,
  TorukFlightEngine,
  PredatorPreyOscillator,
  QuorumCascade,
  Quote,
  ReadingProgress,
  RelatedChapters,
  ReplayTheTape,
  ScaleUpChallenge,
  ScientificNote,
  ScrollSequence,
  ShannonChannel,
  SideNote,
  SourceList,
  StatGrid,
  SuperconductorCooldown,
  TableOfContents,
  TierLegend,
  Timeline,
  TwentySecondsTimeline,
  UmweltLens,
  VerticalForestDive,
  WhatThisMeans,
  WhittakerBiomeExplorer,
  XenobiologyLadder,
} as const;

export type MDXComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

export function getMDXComponents(extra?: Record<string, unknown>): Record<string, unknown> {
  return { ...pandoraMdxComponents, ...(extra ?? {}) };
}
