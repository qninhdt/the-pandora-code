import { z } from "zod";
import { LocalizedString, Slug } from "./shared";

export const Part = z.object({
  id: Slug,
  order: z.number().int().min(0),
  title: LocalizedString,
  description: LocalizedString,
  cover_figure_id: z.string().optional(),
});
export type Part = z.infer<typeof Part>;
