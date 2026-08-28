// Restores the blank line before `## ` headings in Vietnamese chapter files.
//
// The English editions all separate a heading from the paragraph above it with one
// blank line; twelve Vietnamese files had lost it in 93 places. CommonMark lets an
// ATX heading interrupt a paragraph, so this renders correctly either way and the
// validator never complained — but it makes the two editions diff badly and it hides
// section boundaries from any tool that splits on a blank-line-delimited heading.
//
// Whitespace-only change: no word of prose is touched.
import { readFileSync, writeFileSync } from "node:fs";

const files = process.argv.slice(2);
let total = 0;
for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  const out = [];
  let fixed = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^## /.test(lines[i]) && out.length > 0 && out[out.length - 1].trim() !== "") {
      out.push("");
      fixed++;
    }
    out.push(lines[i]);
  }
  if (fixed > 0) {
    writeFileSync(file, out.join("\n"));
    console.log(`${file}  +${fixed}`);
    total += fixed;
  }
}
console.log(`${total} blank lines inserted across ${files.length} files`);
