import { z } from "zod";
import {
  AssetStatus,
  AuthorId,
  ClassificationPct,
  FigureRole,
  LocalizedString,
  Slug,
  Source,
  Status,
} from "./shared";

export const ChapterFigureRef = z.object({
  id: z.string().regex(/^fig-\d{2}-[a-z0-9-]+$/, "figure id must match fig-NN-{slug}"),
  role: FigureRole,
  asset_status: AssetStatus,
});
export type ChapterFigureRef = z.infer<typeof ChapterFigureRef>;

export const ChapterMeta = z
  .object({
    slug: Slug,
    part: z.string().min(1),
    order: z.number().int().min(0),
    status: Status,
    title: LocalizedString,
    subtitle: LocalizedString.optional(),
    hook: LocalizedString,
    authors: z.array(AuthorId).min(1, "at least one author required").default(["bardabez"]),
    reading_time_min: z.number().int().min(1).max(120),
    tags: z.array(z.string().min(1)).default([]),
    classification: ClassificationPct,
    related_chapters: z.array(Slug).default([]),
    glossary_terms: z.array(Slug).default([]),
    figures: z.array(ChapterFigureRef).default([]),
    sources: z.array(Source).default([]),
  })
  .refine((data) => new Set(data.figures.map((f) => f.id)).size === data.figures.length, {
    message: "figure ids must be unique within a chapter",
  });
export type ChapterMeta = z.infer<typeof ChapterMeta>;

export interface LocalizedChapter {
  meta: ChapterMeta;
  locale: "vi" | "en";
  title: string;
  subtitle?: string;
  hook: string;
  mdxPath: string;
}
