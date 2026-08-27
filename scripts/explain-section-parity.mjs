// Re-runs the section pairing but reports, for every EN/VI paragraph-count mismatch,
// whether the difference is explained purely by the 40-character prose filter in
// audit-section-parity.mjs: a short EN sentence ("Go back to the breach.", 24 chars)
// is dropped while its Vietnamese translation runs ~1.5x longer and clears the bar.
// That is a measurement artifact, not lost or invented content.
import { readdirSync, readFileSync, existsSync } from "node:fs";

const MIN = 40;
const CHAPTERS = "content/chapters";

function stripBlockJsx(text) {
  const kept = [];
  let mode = null;
  for (const line of text.split("\n")) {
    if (mode === "props") { if (/^\/>\s*$/.test(line)) mode = null; continue; }
    if (mode === "container") { if (/^<\/[A-Z]/.test(line)) mode = null; else kept.push(line); continue; }
    if (/^<[A-Z][A-Za-z]*\s*$/.test(line)) { mode = "props"; continue; }
    if (/^<[A-Z][A-Za-z]*(\s+[^>]*)?\/>\s*$/.test(line)) continue;
    if (/^<[A-Z][A-Za-z]*(\s+[^>]*)?>\s*$/.test(line)) { mode = "container"; continue; }
    if (/^<\/[A-Z]/.test(line)) continue;
    kept.push(line);
  }
  return kept.join("\n");
}

// Same split as the audit, but returns both the kept paragraphs and the ones the
// length filter discarded, so the two can be compared.
function sections(body) {
  const out = [];
  let cur = { heading: "(preamble)", lines: [] };
  for (const line of body.replace(/^---\n[\s\S]*?\n---\n/, "").split("\n")) {
    if (/^##\s+/.test(line)) { out.push(cur); cur = { heading: line.replace(/^##\s+/, "").trim(), lines: [] }; }
    else cur.lines.push(line);
  }
  out.push(cur);
  return out.map((s) => {
    const all = stripBlockJsx(s.lines.join("\n"))
      .replace(/```[\s\S]*?```/g, "")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !/^[|:>-]/.test(p) && !/^\{/.test(p));
    return {
      heading: s.heading,
      kept: all.filter((p) => p.length > MIN),
      dropped: all.filter((p) => p.length <= MIN),
    };
  });
}

const only = process.argv[2];
for (const slug of readdirSync(CHAPTERS).sort()) {
  if (only && slug !== only) continue;
  const enP = `${CHAPTERS}/${slug}/en.mdx`;
  const viP = `${CHAPTERS}/${slug}/vi.mdx`;
  if (!existsSync(enP) || !existsSync(viP)) continue;
  const e = sections(readFileSync(enP, "utf8"));
  const v = sections(readFileSync(viP, "utf8"));
  if (e.length !== v.length) { console.log(`${slug}: SECTION COUNT ${e.length}/${v.length}`); continue; }
  e.forEach((es, i) => {
    const vs = v[i];
    if (es.kept.length === vs.kept.length) return;
    const delta = vs.kept.length - es.kept.length;
    // With the filter removed, do the two sides agree?
    const eTotal = es.kept.length + es.dropped.length;
    const vTotal = vs.kept.length + vs.dropped.length;
    const verdict = eTotal === vTotal ? "FILTER ARTIFACT" : "REAL MISMATCH";
    console.log(`\n${slug} :: ${es.heading}`);
    console.log(`  filtered  EN ${es.kept.length} / VI ${vs.kept.length}  (delta ${delta > 0 ? "+" : ""}${delta})`);
    console.log(`  unfiltered EN ${eTotal} / VI ${vTotal}   -> ${verdict}`);
    for (const p of es.dropped) console.log(`    EN short (${p.length}): ${p}`);
    for (const p of vs.dropped) console.log(`    VI short (${p.length}): ${p}`);
  });
}
