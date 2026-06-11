import type { Locale } from "@/i18n/config";
import { GlossaryTerm } from "../schemas/glossary-term";
import { glossaryDir, glossaryTermPath } from "./content-paths";
import { fileExists, listYamlFiles, parseYaml } from "./yaml-utils";

export interface LocalizedGlossaryTerm {
  id: string;
  category: GlossaryTerm["category"];
  tags: string[];
  label: string;
  definition: string;
  see_also: string[];
}

export function listGlossaryIds(): string[] {
  return listYamlFiles(glossaryDir());
}

export function loadGlossaryTerm(id: string): GlossaryTerm | null {
  const filePath = glossaryTermPath(id);
  if (!fileExists(filePath)) return null;
  return parseYaml(GlossaryTerm, filePath);
}

export function getGlossaryTerm(id: string, locale: Locale): LocalizedGlossaryTerm | null {
  const term = loadGlossaryTerm(id);
  if (!term) return null;
  return {
    id: term.id,
    category: term.category,
    tags: term.tags,
    label: term.label[locale],
    definition: term.definition[locale],
    see_also: term.see_also,
  };
}

export function listGlossaryTerms(locale: Locale): LocalizedGlossaryTerm[] {
  return listGlossaryIds()
    .map((id) => getGlossaryTerm(id, locale))
    .filter((term): term is LocalizedGlossaryTerm => term !== null)
    .sort((a, b) => a.label.localeCompare(b.label));
}
