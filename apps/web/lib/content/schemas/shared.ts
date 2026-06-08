import { z } from "zod";

export const LocalizedString = z.object({
  vi: z.string().min(1, "vi must be non-empty"),
  en: z.string().min(1, "en must be non-empty"),
});
export type LocalizedString = z.infer<typeof LocalizedString>;

export const Slug = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]*$/, "slug must be kebab-case (a-z, 0-9, -)");

export const Status = z.enum(["draft", "in_review", "published"]);
export type Status = z.infer<typeof Status>;

export const AssetStatus = z.enum(["pending", "ready"]);
export type AssetStatus = z.infer<typeof AssetStatus>;

export const FigureRole = z.enum(["hero", "inline", "comparison", "diagram"]);
export type FigureRole = z.infer<typeof FigureRole>;

export const ClassificationKind = z.enum(["canon", "inference", "speculation", "real_science"]);
export type ClassificationKind = z.infer<typeof ClassificationKind>;

export const ClassificationPct = z
  .object({
    canon_pct: z.number().int().min(0).max(100),
    inference_pct: z.number().int().min(0).max(100),
    speculation_pct: z.number().int().min(0).max(100),
    real_science_pct: z.number().int().min(0).max(100),
  })
  .refine((d) => d.canon_pct + d.inference_pct + d.speculation_pct + d.real_science_pct === 100, {
    message: "classification_pct values must sum to 100",
  });
export type ClassificationPct = z.infer<typeof ClassificationPct>;

export const SourceKind = z.enum([
  "canon",
  "research-note",
  "wiki",
  "community",
  "science",
  "other",
]);

export const Source = z.object({
  kind: SourceKind,
  label: z.string().min(1),
  url: z.string().url().optional(),
});
export type Source = z.infer<typeof Source>;

export const FIXED_AUTHOR_IDS = ["bardabez"] as const;
export const AuthorId = z.enum(FIXED_AUTHOR_IDS);
export type AuthorId = z.infer<typeof AuthorId>;
