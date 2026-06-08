import { readFileSync } from "node:fs";
import path from "node:path";
import type { FigurePrompt } from "../../apps/web/lib/content/schemas/figure-prompt";

const STYLE_BIBLE_PATH = path.resolve(process.cwd(), "content/art-direction/style-bible.md");

let cachedBible: string | null = null;

export function loadStyleBible(): string {
  if (cachedBible !== null) return cachedBible;
  let contents: string;
  try {
    contents = readFileSync(STYLE_BIBLE_PATH, "utf8").trim();
  } catch {
    throw new Error(
      `STYLE BIBLE not found at ${STYLE_BIBLE_PATH}. ` +
        "It is the required prepend for every figure prompt.",
    );
  }
  cachedBible = contents;
  return contents;
}

// Compose the final prompt: STYLE BIBLE invariants first (locks medium, palette,
// lighting, exclusions), then the per-figure specifics. The figure's own
// negative/exclude lines reinforce the global exclusions.
export function composePrompt(figure: FigurePrompt, styleBible: string): string {
  const excludeLine =
    figure.exclude.length > 0 ? `Avoid in this figure: ${figure.exclude.join(", ")}.` : "";

  return [
    styleBible,
    "",
    "--- THIS FIGURE ---",
    `Narrative purpose: ${figure.narrative_purpose}`,
    `Subject: ${figure.subject}`,
    `Scene: ${figure.scene}`,
    `Camera: ${figure.camera}`,
    `Light: ${figure.light}`,
    `Palette emphasis: ${figure.palette}`,
    `Style notes: ${figure.style}`,
    `Detail level: ${figure.detail_level}`,
    `Composition: ${figure.composition}`,
    `Consistency: ${figure.consistency_notes}`,
    excludeLine,
    `Negative prompt: ${figure.negative_prompt}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}
