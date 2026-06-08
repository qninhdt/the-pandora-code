#!/usr/bin/env tsx
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import "dotenv/config";
import { ANCHORS_DIR } from "./lib/figure-paths";
import { generateImage } from "./lib/openai-image-client";
import { loadStyleBible } from "./lib/style-bible-loader";

// One-time art-direction setup: produce the single Pandora establishing shot
// that becomes the style anchor fed to every later figure. Re-run with --force
// to iterate on the look before locking it.
const ESTABLISHING_SHOT = [
  "--- THIS FIGURE (STYLE ANCHOR) ---",
  "Narrative purpose: the canonical establishing shot that defines the visual",
  "language of the whole project — every later figure references this image.",
  "Subject: a sweeping Pandoran rainforest valley at night, bioluminescent flora",
  "glowing from within — towering trees, hanging vines, spore-lit understory.",
  "Scene: layered depth, distant floating rock silhouettes barely visible through",
  "teal volumetric haze; a slow river of mist on the forest floor.",
  "Camera: wide establishing vista, slight low angle, deep focus.",
  "Light: bioluminescent key from the flora (cyan and living teal), deep indigo",
  "ambient shadow, subtle ember-amber warmth deep in one hollow.",
  "Palette emphasis: cool Pandora base dominant; warm accent scarce and deliberate.",
  "Detail level: high, painterly naturalist-plate texture.",
  "Composition: confident focal hierarchy, generous haze and negative space.",
  "Negative prompt: no text, no Avatar branding, no actors, no UI, no photo or 3D render look.",
].join("\n");

async function main(): Promise<void> {
  const force = process.argv.includes("--force");
  const outPath = path.join(ANCHORS_DIR, "pandora-establishing.png");

  if (!force && existsSync(outPath)) {
    console.log(`[gen-anchor] anchor exists at ${outPath} (use --force to regenerate)`);
    return;
  }
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
    console.error("[gen-anchor] OPENAI_API_KEY is not set. Add it to .env and re-run.");
    process.exit(1);
  }

  const prompt = `${loadStyleBible()}\n\n${ESTABLISHING_SHOT}`;
  console.log("[gen-anchor] generating style anchor (1536x1024)...");
  const result = await generateImage({ prompt, aspect: "16:9" });

  mkdirSync(ANCHORS_DIR, { recursive: true });
  writeFileSync(outPath, result.bytes);
  console.log(`[gen-anchor] wrote ${path.relative(process.cwd(), outPath)}`);
}

main().catch((err) => {
  console.error(`[gen-anchor] ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
