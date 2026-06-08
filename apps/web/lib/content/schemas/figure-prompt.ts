import { z } from "zod";
import { FigureRole, Slug } from "./shared";

export const AspectRatio = z.enum(["16:9", "4:3", "1:1", "9:16", "3:2"]);

export const FigurePrompt = z.object({
  id: z.string().regex(/^fig-\d{2}-[a-z0-9-]+$/),
  chapter_slug: Slug,
  role: FigureRole,
  narrative_purpose: z.string().min(10),
  subject: z.string().min(5),
  scene: z.string().min(5),
  camera: z.string().min(3),
  light: z.string().min(3),
  palette: z.string().min(3),
  style: z.string().min(3),
  detail_level: z.string().min(3),
  composition: z.string().min(3),
  exclude: z.array(z.string().min(1)).default([]),
  consistency_notes: z.string().min(3),
  aspect_ratio: AspectRatio,
  negative_prompt: z.string().min(3),

  // Reference images (paths under content/art-direction/anchors/) fed to the
  // image edit endpoint so palette/medium stay locked and recurring creatures
  // match across figures.
  style_refs: z.array(z.string().min(1)).default([]),
  character_refs: z.array(z.string().min(1)).default([]),

  // Persisted after first generation so a figure can be regenerated
  // reproducibly. Written back by the generation script; absent until then.
  seed: z.number().int().optional(),
  response_id: z.string().min(1).optional(),
});
export type FigurePrompt = z.infer<typeof FigurePrompt>;
