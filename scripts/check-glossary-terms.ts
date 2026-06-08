#!/usr/bin/env tsx
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

// Continuous glossary sync guard: every term a chapter references must have a
// definition file in content/glossary/. Scans both the rendered <GlossaryTerm>
// usages in the MDX and the glossary_terms list in meta.yaml, then reports any
// referenced-but-undefined term. Non-zero exit so the pipeline surfaces gaps
// instead of shipping dangling term links.

const ROOT = process.cwd();
const CHAPTERS_DIR = path.join(ROOT, "content", "chapters");
const GLOSSARY_DIR = path.join(ROOT, "content", "glossary");

// <GlossaryTerm ... slug="cooper-pair" ... /> — capture the slug attribute
// regardless of attribute order or quote style. The leading \s ensures we match
// the standalone `slug` attribute, not a suffix like `data-slug`.
const GLOSSARY_TAG = /<GlossaryTerm\b[^>]*?\sslug=("|')([a-z0-9][a-z0-9-]*)\1/g;

interface Reference {
  term: string;
  source: string; // where the reference came from, for the report
}

function fail(message: string): never {
  console.error(`\n[check-glossary] ${message}\n`);
  process.exit(1);
}

// All glossary ids that have a definition file (content/glossary/{id}.yaml).
function definedTermIds(): Set<string> {
  if (!existsSync(GLOSSARY_DIR)) return new Set();
  const ids = readdirSync(GLOSSARY_DIR)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => f.replace(/\.ya?ml$/, ""));
  return new Set(ids);
}

// Collect every glossary slug referenced by one chapter, from its MDX bodies
// and its meta.yaml glossary_terms list.
function referencesForChapter(slug: string): Reference[] {
  const dir = path.join(CHAPTERS_DIR, slug);
  const refs: Reference[] = [];

  for (const locale of ["en", "vi"]) {
    const mdxPath = path.join(dir, `${locale}.mdx`);
    if (!existsSync(mdxPath)) continue;
    const body = readFileSync(mdxPath, "utf8");
    for (const match of body.matchAll(GLOSSARY_TAG)) {
      refs.push({ term: match[2], source: `${slug}/${locale}.mdx` });
    }
  }

  const metaPath = path.join(dir, "meta.yaml");
  if (existsSync(metaPath)) {
    let meta: { glossary_terms?: unknown } | null;
    try {
      meta = yaml.load(readFileSync(metaPath, "utf8")) as { glossary_terms?: unknown } | null;
    } catch (err) {
      fail(`Malformed YAML in ${slug}/meta.yaml: ${err instanceof Error ? err.message : err}`);
    }
    const terms = meta?.glossary_terms;
    if (Array.isArray(terms)) {
      for (const term of terms) {
        if (typeof term === "string") refs.push({ term, source: `${slug}/meta.yaml` });
      }
    }
  }

  return refs;
}

function listChapterSlugs(): string[] {
  if (!existsSync(CHAPTERS_DIR)) return [];
  return readdirSync(CHAPTERS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function main(): void {
  const arg = process.argv[2];
  const slugs = arg ? [arg] : listChapterSlugs();

  if (arg && !existsSync(path.join(CHAPTERS_DIR, arg))) {
    fail(`Chapter "${arg}" not found under content/chapters/.`);
  }
  if (slugs.length === 0) {
    console.log("[check-glossary] no chapters to check.");
    return;
  }

  const defined = definedTermIds();
  const missing: Reference[] = [];
  let totalRefs = 0;

  for (const slug of slugs) {
    for (const ref of referencesForChapter(slug)) {
      totalRefs += 1;
      if (!defined.has(ref.term)) missing.push(ref);
    }
  }

  if (missing.length > 0) {
    // Group missing terms so the same undefined term across files reads clearly.
    const byTerm = new Map<string, string[]>();
    for (const m of missing) {
      const list = byTerm.get(m.term) ?? [];
      list.push(m.source);
      byTerm.set(m.term, list);
    }
    console.error(
      `\n[check-glossary] ${byTerm.size} undefined term(s) referenced (${missing.length} usage(s)):`,
    );
    for (const [term, sources] of byTerm) {
      console.error(`  - "${term}" → define at content/glossary/${term}.yaml`);
      for (const src of [...new Set(sources)]) console.error(`      used in ${src}`);
    }
    console.error(
      `\nAdd the missing definition file(s), then re-run. Checked ${slugs.length} chapter(s), ${totalRefs} reference(s).\n`,
    );
    process.exit(1);
  }

  console.log(
    `[check-glossary] OK — ${slugs.length} chapter(s), ${totalRefs} reference(s), all defined.`,
  );
}

main();
