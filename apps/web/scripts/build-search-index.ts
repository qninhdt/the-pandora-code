#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { type Locale, locales } from "../i18n/config";
import { listPublishedChapters } from "../lib/content/loader/chapter-loader";
import { listGlossaryTerms } from "../lib/content/loader/glossary-loader";
import type { SearchRecord } from "../lib/search/search-index";

// Build-time search index: emits public/search/index-{locale}.json with one
// record per published chapter, glossary term, and topic tag. Only metadata
// (title/summary/tags) is indexed — NOT full MDX bodies — so each file stays
// small (well under ~100KB uncompressed) and loads lazily client-side.

// Trim a hook/definition to a short preview so the stored index stays small.
// MiniSearch indexes the words we feed it, so a clipped summary still matches
// on its first ~30 words — full-body search is out of scope (YAGNI).
function snippet(text: string, max = 140): string {
  if (text.length <= max) return text;
  const slice = text.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  return `${slice.slice(0, lastSpace > 60 ? lastSpace : max).trimEnd()}…`;
}

function buildRecords(locale: Locale): SearchRecord[] {
  const records: SearchRecord[] = [];

  for (const chapter of listPublishedChapters(locale)) {
    records.push({
      id: `chapter:${chapter.meta.slug}`,
      type: "chapter",
      href: `/${locale}/chapters/${chapter.meta.slug}`,
      title: chapter.title,
      summary: snippet(chapter.hook),
      tags: chapter.meta.tags ?? [],
    });
  }

  for (const term of listGlossaryTerms(locale)) {
    records.push({
      id: `glossary:${term.id}`,
      type: "glossary",
      href: `/${locale}/glossary/${term.id}`,
      title: term.label,
      summary: snippet(term.definition),
      tags: term.tags ?? [],
    });
  }

  // Topic tags: collect from all chapters (locale-independent ids), label = tag.
  const tags = new Set<string>();
  for (const chapter of listPublishedChapters(locale)) {
    for (const tag of chapter.meta.tags ?? []) tags.add(tag);
  }
  for (const tag of tags) {
    records.push({
      id: `topic:${tag}`,
      type: "topic",
      href: `/${locale}/topics/${tag}`,
      title: tag,
      summary: "",
      tags: [tag],
    });
  }

  return records;
}

function main() {
  const outDir = path.resolve(process.cwd(), "public", "search");
  fs.mkdirSync(outDir, { recursive: true });

  for (const locale of locales) {
    const records = buildRecords(locale);
    if (records.length === 0) {
      console.warn(`[build-search-index] WARNING: 0 records for locale "${locale}".`);
    }
    const outPath = path.join(outDir, `index-${locale}.json`);
    fs.writeFileSync(outPath, JSON.stringify(records));
    const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
    console.log(`[build-search-index] ${locale}: ${records.length} records → ${kb}KB`);
  }
}

main();
