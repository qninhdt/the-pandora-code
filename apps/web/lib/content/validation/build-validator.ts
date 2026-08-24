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
import { type ReadingTimeDiagnostics, estimateReadingTimeCached } from "../reading-time";
import { AuthorPersona } from "../schemas/author-persona";
import { ChapterMeta } from "../schemas/chapter-meta";
import { GlossaryTerm } from "../schemas/glossary-term";
import { Part } from "../schemas/part";

export interface ReadingTimeAuditEntry {
  slug: string;
  locale: "vi" | "en";
  minutes: number;
  diagnostics: ReadingTimeDiagnostics;
}

export interface ValidatorReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
  counts: {
    chapters: number;
    glossary: number;
    authors: number;
    parts: number;
  };
  readingTime: { estimates: ReadingTimeAuditEntry[] };
}

export function validateAllContent(): ValidatorReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const readingEstimates: ReadingTimeAuditEntry[] = [];
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
    const localizedEstimates = new Map<"vi" | "en", ReadingTimeAuditEntry>();
    for (const locale of ["vi", "en"] as const) {
      const mdx = chapterMdxPath(slug, locale);
      if (!fs.existsSync(mdx)) {
        const message = `[chapters/${slug}] missing ${locale}.mdx at ${mdx}`;
        if (meta.status === "published") errors.push(message);
        else warnings.push(message);
        continue;
      }
      const source = fs.readFileSync(mdx, "utf8");
      const estimate = estimateReadingTimeCached(mdx, source, locale, {
        figureCount: meta.figures.length,
        override: meta.reading_time_override?.[locale],
      });
      const auditEntry: ReadingTimeAuditEntry = {
        slug: meta.slug,
        locale,
        minutes: estimate.minutes,
        diagnostics: estimate.diagnostics,
      };
      readingEstimates.push(auditEntry);
      localizedEstimates.set(locale, auditEntry);
    }

    if (meta.status === "published") {
      const en = localizedEstimates.get("en");
      const vi = localizedEstimates.get("vi");
      if (en && vi) {
        const ratio = en.minutes / vi.minutes;
        // A localized override is an explicit editorial decision for content
        // that is intentionally condensed/expanded in one language. Keep the
        // audit visible, but do not block a production build on the parity
        // gate when that decision has a documented reason in meta.yaml.
        if (meta.reading_time_override?.en || meta.reading_time_override?.vi) {
          warnings.push(
            `[chapters/${meta.slug}] reading-time locale ratio ${Number(ratio.toFixed(3))}x is covered by a documented localized override`,
          );
          continue;
        }
        const normalizedRatio = Number(ratio.toFixed(3));
        if (normalizedRatio < 0.5 || normalizedRatio > 2) {
          errors.push(
            `[chapters/${meta.slug}] reading-time locale ratio ${normalizedRatio}x is outside the hard range 0.5–2x (en=${en.minutes}m, vi=${vi.minutes}m)`,
          );
        } else if (normalizedRatio < 0.65 || normalizedRatio > 1.45) {
          warnings.push(
            `[chapters/${meta.slug}] reading-time locale ratio ${normalizedRatio}x is outside the review range 0.65–1.45x (en=${en.minutes}m, vi=${vi.minutes}m)`,
          );
        }
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
    warnings,
    counts: { chapters, glossary, authors, parts },
    readingTime: { estimates: readingEstimates },
  };
}
