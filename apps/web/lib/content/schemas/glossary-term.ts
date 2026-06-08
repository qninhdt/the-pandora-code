import { z } from "zod";
import { LocalizedString, Slug } from "./shared";

export const GlossaryCategory = z.enum(["bio", "planet", "culture", "tech", "concept"]);
export type GlossaryCategory = z.infer<typeof GlossaryCategory>;

export const GlossaryTerm = z.object({
  id: Slug,
  label: LocalizedString,
  definition: LocalizedString,
  see_also: z.array(Slug).default([]),
  category: GlossaryCategory,
});
export type GlossaryTerm = z.infer<typeof GlossaryTerm>;
