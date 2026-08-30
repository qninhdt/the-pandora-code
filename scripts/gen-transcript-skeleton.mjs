#!/usr/bin/env node
// gen-transcript-skeleton.mjs — deterministic step 1 of the chapter audio pipeline.
//
// Strips a chapter's {en,vi}.mdx into a structured skeleton (sections + typed
// blocks: p / figure / note / data / widget) that a coding agent then adapts
// into content/chapters/<slug>/<locale>.transcript.json following
// i18n/transcript.prompt.md. The skeleton itself is a temp artifact — never
// committed.
//
// Usage:
//   node scripts/gen-transcript-skeleton.mjs <slug> <locale> [--out <path>]
//   node scripts/gen-transcript-skeleton.mjs --all          # smoke-run every chapter
//
// --all verifies, for both locales of every chapter:
//   - section count == ## headings + 1, and EN/VI counts equal
//   - no empty sections
//   - speakable-char coverage vs a parity-style strip >= 0.85 (catches silent
//     prose drops inside the block classifier)
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { extractSkeleton, speakableChars } from "./lib/transcript-skeleton.mjs";

const CHAPTERS = "content/chapters";

// Parity-style kept-prose char count (props dropped, container bodies kept,
// inline tag syntax kept) — the coverage baseline.
function parityChars(body) {
  const kept = [];
  let mode = null;
  for (const line of body.split("\n")) {
    if (mode === "props") { if (/^\/>\s*$/.test(line)) mode = null; continue; }
    if (mode === "container") { if (/^<\/[A-Z]/.test(line)) mode = null; else kept.push(line); continue; }
    if (/^<[A-Z][A-Za-z]*\s*$/.test(line)) { mode = "props"; continue; }
    if (/^<[A-Z][A-Za-z]*(\s+[^>]*)?\/>\s*$/.test(line)) continue;
    if (/^<[A-Z][A-Za-z]*(\s+[^>]*)?>\s*$/.test(line)) { mode = "container"; continue; }
    if (/^<\/[A-Z]/.test(line)) continue;
    kept.push(line);
  }
  return kept.join("\n")
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^import\s.+$/gm, "")
    .replace(/```[\s\S]*?```/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !/^[|:>-]/.test(p) && !/^\{/.test(p))
    .join(" ").length;
}

function load(slug, locale) {
  const file = path.join(CHAPTERS, slug, `${locale}.mdx`);
  return { file, source: readFileSync(file, "utf8") };
}

function build(slug, locale) {
  const { source } = load(slug, locale);
  return extractSkeleton(slug, locale, source);
}

function smokeAll() {
  const problems = [];
  let minRatio = Infinity;
  const slugs = readdirSync(CHAPTERS).sort().filter((s) => existsSync(path.join(CHAPTERS, s, "en.mdx")));
  for (const slug of slugs) {
    const row = {};
    for (const locale of ["en", "vi"]) {
      if (!existsSync(path.join(CHAPTERS, slug, `${locale}.mdx`))) continue;
      const sk = build(slug, locale);
      const headings = sk.sections.length;
      const expect = (load(slug, locale).source.match(/^##\s+/gm) || []).length + 1;
      if (headings !== expect) problems.push(`${slug}/${locale}: sections ${headings} != headings+1 ${expect}`);
      const empty = sk.sections.filter((s) => s.blocks.length === 0).map((s) => s.id);
      if (empty.length) problems.push(`${slug}/${locale}: empty sections ${empty.join(",")}`);
      const base = parityChars(load(slug, locale).source);
      const ratio = base > 0 ? speakableChars(sk) / base : 1;
      minRatio = Math.min(minRatio, ratio);
      if (ratio < 0.85) problems.push(`${slug}/${locale}: speakable coverage ${(ratio * 100).toFixed(1)}%`);
      row[locale] = { sections: headings, ratio: (ratio * 100).toFixed(1) };
    }
    if (row.en && row.vi && row.en.sections !== row.vi.sections) {
      problems.push(`${slug}: EN/VI section mismatch ${row.en.sections}/${row.vi.sections}`);
    }
    const types = {};
    for (const locale of ["en"]) {
      if (!row[locale]) continue;
      for (const s of build(slug, locale).sections) for (const b of s.blocks) types[b.type] = (types[b.type] || 0) + 1;
    }
    console.log(`${slug.padEnd(44)} EN s${String(row.en?.sections ?? "-").padStart(2)} ${row.en?.ratio ?? "-"}%  VI s${String(row.vi?.sections ?? "-").padStart(2)} ${row.vi?.ratio ?? "-"}%  ${JSON.stringify(types)}`);
  }
  console.log(`\n${slugs.length} chapters, min speakable coverage ${(minRatio * 100).toFixed(1)}%`);
  if (problems.length) {
    console.log(`\n${problems.length} PROBLEMS:`);
    for (const p of problems) console.log(`  - ${p}`);
    process.exitCode = 1;
  } else console.log("smoke OK");
}

const [slug, localeArg, ...rest] = process.argv.slice(2);
try {
  if (slug === "--all") smokeAll();
  else {
    if (!slug || !localeArg || !["en", "vi"].includes(localeArg)) {
      throw new Error("usage: gen-transcript-skeleton.mjs <slug> <locale> [--out <path>] | --all");
    }
    const out = rest[0] === "--out" ? rest[1] : null;
    if (rest[0] === "--out" && !rest[1]) throw new Error("--out requires a path");
    const skeleton = build(slug, localeArg);
    const json = JSON.stringify(skeleton, null, 2);
    if (out) { writeFileSync(out, json); console.log(`Skeleton written: ${out} (${skeleton.sections.length} sections)`); }
    else console.log(json);
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
