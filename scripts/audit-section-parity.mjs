// Compares the EN and VI edition of every chapter section by section.
//
// A whole-file count check (headings, components, glossary terms) passes even when a
// Vietnamese section is not a translation of the English one it sits opposite: a dropped
// paragraph here and an invented one there cancel out in the totals. Splitting on `## `
// first and comparing paragraph counts and word ratio per section catches that.
//
// Word ratio: Vietnamese runs longer than English throughout this book, ~1.4-1.6x.
// A section outside 1.15-1.95 is either truncated or padded relative to its counterpart.
import { readdirSync, readFileSync, existsSync } from "node:fs";

const RATIO_LO = 1.15;
const RATIO_HI = 1.95;
const CHAPTERS = "content/chapters";

// Removes component *props* while keeping every word of prose, including prose that
// begins with an inline tag and prose wrapped in a paired container.
//
// Three shapes occur in this corpus:
//   <DiagramFigure          -> bare tag, props on following lines, terminated by `/>`. Props only.
//   <Callout title="...">   -> paired container whose body is prose. Keep the body.
//   <GlossaryTerm slug=..>x</GlossaryTerm> mid-sentence -> inline. Keep the whole line.
// Treating the third as a block is the trap: a paragraph often opens with one, and
// swallowing it silently drops real prose from the count.
function stripBlockJsx(text) {
  const kept = [];
  let mode = null; // "props" | "container"
  for (const line of text.split("\n")) {
    if (mode === "props") {
      if (/^\/>\s*$/.test(line)) mode = null;
      continue;
    }
    if (mode === "container") {
      if (/^<\/[A-Z]/.test(line)) mode = null;
      else kept.push(line);
      continue;
    }
    if (/^<[A-Z][A-Za-z]*\s*$/.test(line)) {
      mode = "props";
      continue;
    }
    if (/^<[A-Z][A-Za-z]*(\s+[^>]*)?\/>\s*$/.test(line)) continue;
    if (/^<[A-Z][A-Za-z]*(\s+[^>]*)?>\s*$/.test(line)) {
      mode = "container";
      continue;
    }
    if (/^<\/[A-Z]/.test(line)) continue;
    kept.push(line);
  }
  return kept.join("\n");
}

function sections(body) {
  const withoutFrontmatter = body.replace(/^---\n[\s\S]*?\n---\n/, "");
  const out = [];
  let current = { heading: "(preamble)", lines: [] };
  for (const line of withoutFrontmatter.split("\n")) {
    if (/^##\s+/.test(line)) {
      out.push(current);
      current = { heading: line.replace(/^##\s+/, "").trim(), lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  out.push(current);
  return out.map((s) => {
    const prose = stripBlockJsx(s.lines.join("\n")).replace(/```[\s\S]*?```/g, "");
    // No length floor. Vietnamese runs ~1.5x longer than English, so any character
    // threshold drops short English paragraphs while keeping their translations and
    // manufactures a phantom "VI has one extra paragraph" on every terse EN beat
    // ("Go back to the sandbar at dawn."). Filter on structure only.
    const paragraphs = prose
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !/^[|:>-]/.test(p) && !/^\{/.test(p));
    return {
      heading: s.heading,
      paragraphs: paragraphs.length,
      words: paragraphs.join(" ").split(/\s+/).filter(Boolean).length,
    };
  });
}

const findings = [];
for (const slug of readdirSync(CHAPTERS).sort()) {
  const en = `${CHAPTERS}/${slug}/en.mdx`;
  const vi = `${CHAPTERS}/${slug}/vi.mdx`;
  if (!existsSync(en) || !existsSync(vi)) continue;
  const e = sections(readFileSync(en, "utf8"));
  const v = sections(readFileSync(vi, "utf8"));
  if (e.length !== v.length) {
    findings.push({ slug, section: "*", issue: `section count EN ${e.length} / VI ${v.length}` });
    continue;
  }
  e.forEach((es, i) => {
    const vs = v[i];
    if (es.paragraphs !== vs.paragraphs) {
      findings.push({
        slug,
        section: es.heading,
        issue: `paragraphs EN ${es.paragraphs} / VI ${vs.paragraphs}`,
      });
    }
    if (es.words > 60) {
      const ratio = vs.words / es.words;
      if (ratio < RATIO_LO || ratio > RATIO_HI) {
        findings.push({
          slug,
          section: es.heading,
          issue: `word ratio ${ratio.toFixed(2)} (EN ${es.words} / VI ${vs.words})`,
        });
      }
    }
  });
}

const bySlug = new Map();
for (const f of findings) {
  if (!bySlug.has(f.slug)) bySlug.set(f.slug, []);
  bySlug.get(f.slug).push(f);
}
for (const [slug, list] of [...bySlug].sort((a, b) => b[1].length - a[1].length)) {
  console.log(`\n${slug}  (${list.length})`);
  for (const f of list) console.log(`   ${f.issue.padEnd(42)} ${f.section}`);
}
console.log(`\n${findings.length} findings across ${bySlug.size} chapters`);
