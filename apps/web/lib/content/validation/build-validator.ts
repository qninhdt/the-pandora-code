import fs from "node:fs";
import path from "node:path";
import {
  CONTENT_ROOT,
  authorsDir,
  chapterMdxPath,
  chapterMetaPath,
  glossaryDir,
  partsDir,
} from "../loader/content-paths";
import {
  ContentValidationError,
  listSubdirectories,
  listYamlFiles,
  parseYaml,
} from "../loader/yaml-utils";
import { AuthorPersona } from "../schemas/author-persona";
import { ChapterMeta } from "../schemas/chapter-meta";
import { GlossaryTerm } from "../schemas/glossary-term";
import { Part } from "../schemas/part";

interface ValidatorReport {
  ok: boolean;
  errors: string[];
  counts: {
    chapters: number;
    glossary: number;
    authors: number;
    parts: number;
  };
}

export function validateAllContent(): ValidatorReport {
  const errors: string[] = [];
  let chapters = 0;
  let glossary = 0;
  let authors = 0;
  let parts = 0;

  const tryParse = <T>(label: string, fn: () => T): T | null => {
    try {
      return fn();
    } catch (err) {
      if (err instanceof ContentValidationError) {
        errors.push(err.message);
      } else if (err instanceof Error) {
        errors.push(`[${label}] ${err.message}`);
      } else {
        errors.push(`[${label}] unknown error`);
      }
      return null;
    }
  };

  const chaptersDir = path.join(CONTENT_ROOT, "chapters");
  for (const slug of listSubdirectories(chaptersDir)) {
    const metaPath = chapterMetaPath(slug);
    if (!fs.existsSync(metaPath)) {
      errors.push(`[chapters/${slug}] missing meta.yaml at ${metaPath}`);
      continue;
    }
    const meta = tryParse(`chapters/${slug}`, () => parseYaml(ChapterMeta, metaPath));
    if (!meta) continue;
    chapters++;
    for (const locale of ["vi", "en"] as const) {
      const mdx = chapterMdxPath(slug, locale);
      if (!fs.existsSync(mdx)) {
        errors.push(`[chapters/${slug}] missing ${locale}.mdx at ${mdx}`);
      }
    }
  }

  for (const id of listYamlFiles(glossaryDir())) {
    const filePath = path.join(glossaryDir(), `${id}.yaml`);
    if (tryParse(`glossary/${id}`, () => parseYaml(GlossaryTerm, filePath))) glossary++;
  }

  for (const id of listYamlFiles(authorsDir())) {
    const filePath = path.join(authorsDir(), `${id}.yaml`);
    if (tryParse(`authors/${id}`, () => parseYaml(AuthorPersona, filePath))) authors++;
  }

  for (const id of listYamlFiles(partsDir())) {
    const filePath = path.join(partsDir(), `${id}.yaml`);
    if (tryParse(`parts/${id}`, () => parseYaml(Part, filePath))) parts++;
  }

  return {
    ok: errors.length === 0,
    errors,
    counts: { chapters, glossary, authors, parts },
  };
}
