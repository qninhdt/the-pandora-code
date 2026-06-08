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

  // Required literal image-generation prompt for the term's cover image. The
  // glossary cover pipeline renders this exact prompt (STYLE BIBLE governed) to
  // apps/web/public/images/glossary/{id}.png. Describe the picture literally -
  // the model cannot infer from the term name alone.
  cover_prompt: z.string().min(20, "cover_prompt must describe a literal image"),
});
export type GlossaryTerm = z.infer<typeof GlossaryTerm>;
