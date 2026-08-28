// Prints the paragraph-by-paragraph pairing of one chapter section so a VI/EN
// count mismatch can be read as either a translator paragraph split or a dropped
// paragraph. Mirrors the section/prose extraction in audit-section-parity.mjs.
import { readFileSync } from "node:fs";

function stripBlockJsx(text) {
  const kept = [];
  let mode = null;
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
    if (/^<[A-Z][A-Za-z]*\s*$/.test(line)) { mode = "props"; continue; }
    if (/^<[A-Z][A-Za-z]*(\s+[^>]*)?\/>\s*$/.test(line)) continue;
    if (/^<[A-Z][A-Za-z]*(\s+[^>]*)?>\s*$/.test(line)) { mode = "container"; continue; }
    if (/^<\/[A-Z]/.test(line)) continue;
    kept.push(line);
  }
  return kept.join("\n");
}

function sections(body) {
  const out = [];
  let current = { heading: "(preamble)", lines: [] };
  for (const line of body.replace(/^---\n[\s\S]*?\n---\n/, "").split("\n")) {
    if (/^##\s+/.test(line)) { out.push(current); current = { heading: line.replace(/^##\s+/, "").trim(), lines: [] }; }
    else current.lines.push(line);
  }
  out.push(current);
  return out.map((s) => ({
    heading: s.heading,
    paragraphs: stripBlockJsx(s.lines.join("\n"))
      .replace(/```[\s\S]*?```/g, "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 40 && !/^[|:>-]/.test(p) && !/^\{/.test(p)),
  }));
}

const [slug, wanted] = process.argv.slice(2);
const e = sections(readFileSync(`content/chapters/${slug}/en.mdx`, "utf8"));
const v = sections(readFileSync(`content/chapters/${slug}/vi.mdx`, "utf8"));
e.forEach((es, i) => {
  if (wanted && !es.heading.toLowerCase().includes(wanted.toLowerCase())) return;
  const vs = v[i];
  console.log(`\n### ${es.heading}   EN ${es.paragraphs.length} / VI ${vs.paragraphs.length}`);
  const n = Math.max(es.paragraphs.length, vs.paragraphs.length);
  for (let k = 0; k < n; k++) {
    console.log(`\n[${k}] EN: ${(es.paragraphs[k] ?? "<none>").slice(0, 150)}`);
    console.log(`[${k}] VI: ${(vs.paragraphs[k] ?? "<none>").slice(0, 150)}`);
  }
});
