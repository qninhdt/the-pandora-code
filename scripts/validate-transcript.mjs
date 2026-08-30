#!/usr/bin/env node
// validate-transcript.mjs — machine gate for chapter audio transcripts.
//
// Validates content/chapters/<slug>/{en,vi}.transcript.json against the
// chapter's mdx and the speech rules in i18n/transcript.prompt.md:
//   1. schema          — fields, block types, section id sequence
//   2. parity          — section count vs mdx headings; EN/VI ids + word ratio
//   3. floors          — non-empty sections/blocks; every mdx figure spoken
//   4. speech lint     — forbidden raw symbols (errors) vs decimals (warnings)
//   5. staleness       — mdx sha256 vs transcript.source.sha256 (warning)
//
// Usage:
//   pnpm transcript:validate <slug> [--locale en|vi]
//   node scripts/validate-transcript.mjs --selftest
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { extractSkeleton } from "./lib/transcript-skeleton.mjs";

const CHAPTERS = "content/chapters";
const RATIO_LO = 1.15;
const RATIO_HI = 1.95;

// Symbols the transcript prompt forbids outright: raw scientific/math symbols,
// markdown, JSX. Field/label values are searched inside block text.
const LINT_ERRORS = [
  [/\*\*|\`|\]\(/, "markdown leftover"],
  [/<[A-Z][A-Za-z]*|\/>/, "JSX leftover"],
  [/[₀-₉⁰-⁹]/, "subscript/superscript digit"],
  [/[%~→≥≤°×—−]/, "raw symbol (spell it out)"],
];
const LINT_WARNINGS = [
  [/\d[.,]\d/, "decimal number not spelled out"],
  [/\d\s?[–-]\s?\d/, "numeric range not spelled out"],
];

const words = (s) => s.split(/\s+/).filter(Boolean).length;
const blockText = (b) => (b && typeof b.text === "string" ? b.text : "");

export function validateOne(transcript, skeleton) {
  const issues = [];
  const err = (level, sectionId, msg) => issues.push({ level, sectionId, msg });

  // 1. schema
  for (const key of ["chapter", "locale", "title", "source", "sections"]) {
    if (!(key in transcript)) err("error", "*", `missing field "${key}"`);
  }
  // The title opens the audio: same spoken-form rules as block text.
  if (typeof transcript.title !== "string" || !transcript.title.trim()) {
    err("error", "*", "title missing or empty");
  } else {
    for (const [re, msg] of LINT_ERRORS) {
      if (re.test(transcript.title)) err("error", "*", `title ${msg}: "${(transcript.title.match(re) || [""])[0]}"`);
    }
  }
  if (!Array.isArray(transcript.sections) || transcript.sections.length === 0) {
    err("error", "*", "sections missing or empty");
    return issues;
  }
  transcript.sections.forEach((s, i) => {
    const want = `sec-${String(i).padStart(2, "0")}`;
    if (s.id !== want) err("error", s.id ?? want, `id "${s.id}" != expected "${want}"`);
    if (s.title === undefined) err("error", s.id, "missing title (null allowed for sec-00)");
    if (i > 0 && !s.title) err("error", s.id, "titled section has empty/null title");
    if (!Array.isArray(s.blocks) || s.blocks.length === 0) {
      err("error", s.id, "empty section");
      return;
    }
    for (const [j, b] of s.blocks.entries()) {
      const at = `${s.id}[${j}]`;
      if (!["p", "figure", "data", "note"].includes(b.type)) err("error", at, `bad type "${b.type}"`);
      if (b.type === "figure" && !b.figNo) err("error", at, "figure without figNo");
      if (b.type === "note" && !b.kind) err("error", at, "note without kind");
      if (!blockText(b).trim()) err("error", at, `empty text (${b.type})`);
    }
  });

  // 2. parity vs mdx skeleton
  if (skeleton) {
    if (transcript.sections.length !== skeleton.sections.length) {
      err("error", "*", `sections ${transcript.sections.length} != mdx ${skeleton.sections.length}`);
    }
    // 3. floors — every mdx figure must be spoken in this locale
    const mdxFigs = skeleton.sections.flatMap((s) => s.blocks)
      .filter((b) => b.type === "figure" && b.figNo).map((b) => b.figNo);
    const saidFigs = new Set(transcript.sections.flatMap((s) => s.blocks)
      .filter((b) => b.type === "figure" && b.figNo).map((b) => b.figNo));
    for (const f of mdxFigs) if (!saidFigs.has(f)) err("error", "*", `figure ${f} never spoken`);
  }

  // 4. speech lint (also locale-consistent figure tag)
  const tag = transcript.locale === "vi" ? "[Hình" : "[Figure";
  const wrongTag = transcript.locale === "vi" ? "[Figure" : "[Hình";
  for (const s of transcript.sections) {
    for (const [j, b] of s.blocks.entries()) {
      const at = `${s.id}[${j}]`;
      const t = blockText(b);
      if (!t) continue;
      if (b.type === "figure" && !t.startsWith(tag)) err("error", at, `figure text must open with ${tag} NN]`);
      if (t.includes(wrongTag)) err("error", at, `wrong-locale figure tag ${wrongTag}`);
      for (const [re, msg] of LINT_ERRORS) if (re.test(t)) err("error", at, `${msg}: "${(t.match(re) || [""])[0]}"`);
      for (const [re, msg] of LINT_WARNINGS) if (re.test(t)) err("warn", at, `${msg}: "${(t.match(re) || [""])[0]}"`);
    }
  }
  return issues;
}

export function validatePair(en, vi, enSkeleton, viSkeleton) {
  const issues = [];
  const ids = (t) => t.sections.map((s) => s.id).join(",");
  if (ids(en) !== ids(vi)) {
    issues.push({ level: "error", sectionId: "*", msg: `EN/VI section ids differ: ${ids(en)} vs ${ids(vi)}` });
  }
  for (let i = 0; i < Math.min(en.sections.length, vi.sections.length); i++) {
    const e = en.sections[i], v = vi.sections[i];
    const ew = e.blocks.reduce((n, b) => n + words(blockText(b)), 0);
    const vw = v.blocks.reduce((n, b) => n + words(blockText(b)), 0);
    if (ew > 60) {
      const ratio = Number((vw / ew).toFixed(2));
      if (ratio < RATIO_LO || ratio > RATIO_HI) {
        issues.push({ level: "warn", sectionId: e.id, msg: `VI/EN word ratio ${ratio} (EN ${ew}/VI ${vw}) outside ${RATIO_LO}-${RATIO_HI}` });
      }
    }
  }
  return issues;
}

export function staleness(transcript, mdxSource) {
  const now = createHash("sha256").update(mdxSource, "utf8").digest("hex");
  return transcript.source?.sha256 === now
    ? []
    : [{ level: "warn", sectionId: "*", msg: "transcript stale vs mdx (sha256 mismatch) — regenerate" }];
}

// --- cli ---

const load = (slug, locale) => {
  const file = path.join(CHAPTERS, slug, `${locale}.transcript.json`);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`${file}: ${e.message}`);
  }
};
const mdx = (slug, locale) =>
  readFileSync(path.join(CHAPTERS, slug, `${locale}.mdx`), "utf8");

function run(slug, localeArg) {
  const locales = localeArg ? [localeArg] : ["en", "vi"];
  let errors = 0, warnings = 0;
  const perLocale = {};
  for (const loc of locales) {
    const t = load(slug, loc);
    if (!t) { console.log(`${loc}: MISSING transcript`); errors++; continue; }
    const sk = extractSkeleton(slug, loc, mdx(slug, loc));
    const issues = [
      ...validateOne(t, sk),
      ...staleness(t, mdx(slug, loc)),
    ];
    perLocale[loc] = t;
    for (const i of issues) {
      console.log(`${loc} ${i.level === "error" ? "ERR " : "warn"} ${i.sectionId}: ${i.msg}`);
      if (i.level === "error") errors++; else warnings++;
    }
  }
  if (perLocale.en && perLocale.vi) {
    for (const i of validatePair(perLocale.en, perLocale.vi)) {
      console.log(`pair ${i.level === "error" ? "ERR " : "warn"} ${i.sectionId}: ${i.msg}`);
      if (i.level === "error") errors++; else warnings++;
    }
  }
  console.log(`\n${slug}: ${errors} error(s), ${warnings} warning(s)`);
  return errors === 0;
}

function selftest() {
  const sk = extractSkeleton("where-is-pandora", "en", mdx("where-is-pandora", "en"));
  // Machine-mock of the agent pass: every skeleton block mapped, lint-clean.
  const spoken = (s) => (s || "")
    .replace(/[*_]/g, "")
    .replace(/—/g, ", ")
    .replace(/[₀-₉]/g, (c) => ` ${["khong", "mot", "hai", "ba", "bon", "nam", "sau", "bay", "tam", "chau"]["₀₁₂₃₄₅₆₇₈₉".indexOf(c)]}`);
  const speak = (b) => {
    if (b.type === "p") return { type: "p", text: spoken(b.raw) };
    if (b.type === "figure") return { type: "figure", figNo: b.figNo, text: `[Figure ${Number(b.figNo)}] ${spoken(b.caption)}` };
    if (b.type === "note" && b.body) return { type: "note", kind: b.kind, text: spoken(b.body) };
    if (b.type === "data" && b.left) return { type: "data", text: `${spoken(b.left.title)} versus ${spoken(b.right?.title)}.` };
    return null;
  };
  const adapt = (mutate) => {
    const t = {
      chapter: sk.chapter, locale: "en",
      title: sk.expectedTitle,
      source: { file: "en.mdx", sha256: sk.source.sha256 },
      sections: sk.sections.map((s, i) => ({
        id: `sec-${String(i).padStart(2, "0")}`,
        title: s.title,
        blocks: s.blocks.map(speak).filter(Boolean),
      })),
    };
    if (mutate) mutate(t);
    return t;
  };
  const expect = (name, issues, level, needle) => {
    const hit = issues.some((i) => i.level === level && i.msg.includes(needle));
    console.log(`${hit ? "PASS" : "FAIL"} ${name}`);
    if (!hit) { console.log("  got:", JSON.stringify(issues)); process.exitCode = 1; }
  };
  const clean = validateOne(adapt(), sk);
  const cleanErrs = clean.filter((i) => i.level === "error");
  console.log(cleanErrs.length === 0 ? "PASS valid transcript has zero errors" : `FAIL valid transcript: ${JSON.stringify(cleanErrs)}`);
  if (cleanErrs.length) process.exitCode = 1;

  expect("missing title", validateOne(adapt((t) => { delete t.title; }), sk), "error", "title");
  expect("id sequence", validateOne(adapt((t) => { t.sections[2].id = "sec-99"; }), sk), "error", "sec-02");
  expect("empty section", validateOne(adapt((t) => { t.sections[3].blocks = []; }), sk), "error", "empty section");
  expect("dropped figure", validateOne(adapt((t) => { t.sections[1].blocks = t.sections[1].blocks.filter((b) => b.figNo !== "02"); }), sk), "error", "figure 02");
  expect("markdown leftover", validateOne(adapt((t) => { t.sections[0].blocks[0].text = "a **bold** line"; }), sk), "error", "markdown");
  expect("jsx leftover", validateOne(adapt((t) => { t.sections[0].blocks[0].text = "see <Callout"; }), sk), "error", "JSX");
  expect("percent", validateOne(adapt((t) => { t.sections[0].blocks[0].text = "55% real science"; }), sk), "error", "spell it out");
  expect("em-dash", validateOne(adapt((t) => { t.sections[0].blocks[0].text = "a — b"; }), sk), "error", "spell it out");
  expect("co2 subscript", validateOne(adapt((t) => { t.sections[0].blocks[0].text = "khí CO₂ đậm"; }), sk), "error", "subscript");
  expect("decimal warn", validateOne(adapt((t) => { t.sections[0].blocks[0].text = "khoảng 4.37 năm"; }), sk), "warn", "decimal");
  expect("stale", staleness(adapt((t) => { t.source.sha256 = "0".repeat(64); }), mdx("where-is-pandora", "en")), "warn", "stale");
  expect("wrong-locale tag", validateOne(adapt((t) => { t.locale = "vi"; }), sk), "error", "wrong-locale");
}

const [slug, ...rest] = process.argv.slice(2);
try {
  if (slug === "--selftest") selftest();
  else if (!slug) throw new Error("usage: validate-transcript.mjs <slug> [--locale en|vi] | --selftest");
  else {
    const locIdx = rest.indexOf("--locale");
    const locale = locIdx >= 0 ? rest[locIdx + 1] : null;
    if (locale && !["en", "vi"].includes(locale)) {
      throw new Error(`unsupported --locale "${locale}" (en|vi only)`);
    }
    const ok = run(slug, locale);
    if (!ok) process.exit(1);
  }
} catch (e) {
  console.error(`Error: ${e.message}`);
  process.exit(1);
}
