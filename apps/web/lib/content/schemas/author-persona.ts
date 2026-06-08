import { z } from "zod";
import { AuthorId, LocalizedString } from "./shared";

export const AuthorPersona = z.object({
  id: AuthorId,
  name: z.string().min(1),
  title: LocalizedString,
  institution: z.string().min(1),
  domain: LocalizedString,
  bio: LocalizedString,
  photo_prompt: z.string().optional(),
  voice_traits: z.array(z.string().min(1)).default([]),
  reader_contract: LocalizedString.optional(),
});
export type AuthorPersona = z.infer<typeof AuthorPersona>;
