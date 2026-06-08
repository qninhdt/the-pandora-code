import type { Locale } from "@/i18n/config";
import { Part } from "../schemas/part";
import { partPath, partsDir } from "./content-paths";
import { fileExists, listYamlFiles, parseYaml } from "./yaml-utils";

export interface LocalizedPart {
  id: string;
  order: number;
  title: string;
  description: string;
  cover_figure_id?: string;
}

export function listPartIds(): string[] {
  return listYamlFiles(partsDir());
}

export function loadPart(id: string): Part | null {
  const filePath = partPath(id);
  if (!fileExists(filePath)) return null;
  return parseYaml(Part, filePath);
}

export function getPart(id: string, locale: Locale): LocalizedPart | null {
  const part = loadPart(id);
  if (!part) return null;
  return {
    id: part.id,
    order: part.order,
    title: part.title[locale],
    description: part.description[locale],
    cover_figure_id: part.cover_figure_id,
  };
}

export function listParts(locale: Locale): LocalizedPart[] {
  return listPartIds()
    .map((id) => getPart(id, locale))
    .filter((p): p is LocalizedPart => p !== null)
    .sort((a, b) => a.order - b.order);
}
