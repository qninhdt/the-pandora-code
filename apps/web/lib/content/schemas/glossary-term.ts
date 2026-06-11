import { z } from "zod";
import { GlossaryTag } from "./glossary-tags";
import { LocalizedString, Slug } from "./shared";

export const GlossaryCategory = z.enum(["bio", "planet", "culture", "tech", "concept"]);
export type GlossaryCategory = z.infer<typeof GlossaryCategory>;

export const GlossaryTerm = z.object({
  id: Slug,
  label: LocalizedString,
  definition: LocalizedString,
  see_also: z.array(Slug).default([]),
  category: GlossaryCategory,

  // Topic tags from the fixed vocabulary (schemas/glossary-tags.ts). Primary
  // lookup facet on the glossary page; a term carries 1-4. Defaults to empty so
  // not-yet-tagged terms still validate.
  tags: z.array(GlossaryTag).default([]),

  // Required literal image-generation prompt for the term's cover image. The
  // glossary cover pipeline renders this exact prompt (STYLE BIBLE governed) to
  // apps/web/public/images/glossary/{id}.png. Describe the picture literally -
  // the model cannot infer from the term name alone.
  cover_prompt: z.string().min(20, "cover_prompt must describe a literal image"),
});
export type GlossaryTerm = z.infer<typeof GlossaryTerm>;
