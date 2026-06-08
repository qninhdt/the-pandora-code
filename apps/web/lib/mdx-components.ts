import { CanonBadge } from "@/components/classification/canon-badge";
import { AnatomyPlate } from "@/components/content/anatomy-plate";
import { Callout, ScientificNote, SideNote } from "@/components/content/callout";
import { Chart } from "@/components/content/chart";
import { Comparison } from "@/components/content/comparison";
import { ConfidenceMeter } from "@/components/content/confidence-meter";
import { DataComparison, StatGrid } from "@/components/content/data-comparison";
import { DiagramFigure } from "@/components/content/diagram-figure";
import { Figure } from "@/components/content/figure";
import { FigureGrid } from "@/components/content/figure-grid";
import { OpenQuestions } from "@/components/content/open-questions";
import { Quote } from "@/components/content/quote";
import { ScrollSequence } from "@/components/content/scroll-sequence";
import { Timeline } from "@/components/content/timeline";
import { WhatThisMeans } from "@/components/content/what-this-means";
import { GlossaryTerm } from "@/components/glossary/glossary-term";
import { ChapterHero } from "@/components/reading/chapter-hero";
import { ChapterShell } from "@/components/reading/chapter-shell";
import { ReadingProgress } from "@/components/reading/reading-progress";
import { RelatedChapters } from "@/components/reading/related-chapters";
import { TableOfContents } from "@/components/reading/table-of-contents";
import { SourceList } from "@/components/sources/source-list";
import type { ComponentType } from "react";

export const pandoraMdxComponents = {
  AnatomyPlate,
  Callout,
  CanonBadge,
  ChapterHero,
  ChapterShell,
  Chart,
  Comparison,
  ConfidenceMeter,
  DataComparison,
  DiagramFigure,
  Figure,
  FigureGrid,
  GlossaryTerm,
  OpenQuestions,
  Quote,
  ReadingProgress,
  RelatedChapters,
  ScientificNote,
  ScrollSequence,
  SideNote,
  SourceList,
  StatGrid,
  TableOfContents,
  Timeline,
  WhatThisMeans,
} as const;

export type MDXComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

export function getMDXComponents(extra?: Record<string, unknown>): Record<string, unknown> {
  return { ...pandoraMdxComponents, ...(extra ?? {}) };
}
