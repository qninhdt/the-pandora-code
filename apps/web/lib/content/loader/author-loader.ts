import type { Locale } from "@/i18n/config";
import { AuthorPersona } from "../schemas/author-persona";
import { authorPath, authorsDir } from "./content-paths";
import { fileExists, listYamlFiles, parseYaml } from "./yaml-utils";

export interface LocalizedAuthor {
  id: string;
  name: string;
  title: string;
  institution: string;
  domain: string;
  bio: string;
  voice_traits: string[];
  reader_contract?: string;
  photo_prompt?: string;
}

export function listAuthorIds(): string[] {
  return listYamlFiles(authorsDir());
}

export function loadAuthor(id: string): AuthorPersona | null {
  const filePath = authorPath(id);
  if (!fileExists(filePath)) return null;
  return parseYaml(AuthorPersona, filePath);
}

export function getAuthor(id: string, locale: Locale): LocalizedAuthor | null {
  const author = loadAuthor(id);
  if (!author) return null;
  return {
    id: author.id,
    name: author.name,
    institution: author.institution,
    title: author.title[locale],
    domain: author.domain[locale],
    bio: author.bio[locale],
    voice_traits: author.voice_traits,
    reader_contract: author.reader_contract?.[locale],
    photo_prompt: author.photo_prompt,
  };
}

export function listAuthors(locale: Locale): LocalizedAuthor[] {
  return listAuthorIds()
    .map((id) => getAuthor(id, locale))
    .filter((a): a is LocalizedAuthor => a !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
