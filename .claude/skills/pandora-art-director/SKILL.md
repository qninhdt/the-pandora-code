---
name: pandora-art-director
description: Owns figure art direction for The Pandora Code - applies the one global STYLE BIBLE, authors figure-prompt JSON per chapter (content-driven count, density scales), and invokes gen-images.ts. Routed to by /pandora - not loaded directly.
triggers:
  - figure prompt
  - image prompt
  - style bible
  - figure json
  - chapter figures
  - art direction
metadata:
  type: project-skill
---

# Pandora Art Director

Owns the visual layer of a chapter: decides what to illustrate, writes the
figure-prompt JSON, and runs image generation. Routed to by `/pandora` after the
EN prose exists. One global look, set by the STYLE BIBLE.

## The STYLE BIBLE (single source of look)

Every image is governed by `content/art-direction/style-bible.md` - the canonical
palette (hex), medium, lighting, and exclusions. The generation script composes
each figure prompt _with_ the style bible (`scripts/lib/style-bible-loader.ts`),
so figure JSON describes the **subject and scene**, not the global style. Don't
re-specify the palette/medium in every figure; lean on the bible. See
`references/style-bible-usage.md`.

## Figure count is content-driven

No fixed minimum. Density scales with the chapter - a dense systems chapter earns
many figures; a short one earns fewer. Illustrate where a visual teaches faster
than prose: the cold-open anchor, each mechanism the reader must _see_,
comparisons, diagrams. Never add a figure that teaches nothing (decoration is an
anti-pattern). See `references/figure-planning.md`.

## Every chapter has a cover figure (`fig-00-cover`)

Each chapter MUST have ONE representative image - its cover - authored as
`fig-00-cover` (role `hero`, aspect `16:9` or `3:2`). This is the image shown on
the landing book-map plate and as the chapter's hero/thumbnail. Requirements:

- Author it as `content/chapters/{slug}/figures/fig-00-cover.json` like any other
  figure (STYLE BIBLE governs the look). Its `narrative_purpose` is to capture
  the chapter's essence at a glance - the single image that makes a reader want
  to open it.
- It generates with the rest via `pnpm gen-images --chapter {slug}` → PNG at
  `apps/web/public/images/chapters/{slug}/fig-00-cover.png`.
- The web app resolves the cover automatically (prefers `cover.png`, then
  `fig-00-cover.png`, then the lowest-numbered figure), so authoring
  `fig-00-cover` is all that's needed for it to appear on the landing.
- It is `fig-00` so it sorts first and never collides with the body figures
  (which start at `fig-01`). It can double as the chapter's in-page hero.

## Every chapter has a background figure (`fig-99-background`)

Each chapter ALSO gets ONE full-bleed atmospheric background — authored as
`fig-99-background` (role `hero`, aspect `16:9`). This is the macro vista the
reader's text floats over; the drifting atmosphere fireflies glow on top of it.
It is distinct from the cover (`fig-00`): the cover is a crisp focal thumbnail,
the background is a wide, dim, immersive mood layer. Requirements:

- Author it as `content/chapters/{slug}/figures/fig-99-background.json`. Give it
  macro/grand-scale traits: **ultra-wide / panoramic, very high vantage, deep
  atmospheric depth, dark and low-contrast (dark theme), no bright focal subject,
  detail dissolving into haze** — so overlaid long-form text stays readable. It
  is mood, not a figure to study.
- It generates with the rest via `pnpm gen-images --chapter {slug}` → PNG at
  `apps/web/public/images/chapters/{slug}/fig-99-background.png`.
- The web app resolves it automatically (fixed behind everything, under a dark
  scrim and under the atmosphere fireflies), so authoring `fig-99-background` is
  all that's needed for it to appear behind the chapter.
- It is `fig-99` so it always sorts last and never collides with body figures.
- Do NOT add it to `meta.yaml` `figures[]` (it is a background layer, not an
  inline figure shown in the prose).

## What this skill produces

For chapter `{slug}`:

- `content/chapters/{slug}/figures/fig-NN-*.json` - one file per figure, valid
  against `FigurePrompt` (`apps/web/lib/content/schemas/figure-prompt.ts`).
- A matching entry in `meta.yaml` `figures[]`: `{ id, role, asset_status: pending }`.
- Then runs `pnpm gen-images --chapter {slug}` → PNGs in
  `apps/web/public/images/chapters/{slug}/`, flips `asset_status` to `ready`,
  and persists `response_id` back into each JSON.

## FigurePrompt fields (what to author)

`id` (`fig-NN-{slug}`), `chapter_slug`, `role` (hero/inline/comparison/diagram),
`narrative_purpose` (why this figure exists - must be real), `subject`, `scene`,
`camera`, `light`, `palette`, `style`, `detail_level`, `composition`,
`exclude[]`, `consistency_notes`, `aspect_ratio` (16:9/4:3/1:1/9:16/3:2),
`negative_prompt`. Optional `style_refs[]` / `character_refs[]` (anchor image
names under `content/art-direction/anchors/`) to lock palette/medium and keep
recurring creatures consistent. `seed`/`response_id` are written back by the
script - don't author them. See `references/figure-prompt-authoring.md`.

## Hard Rules

1. **STYLE BIBLE governs the look.** Figure JSON describes subject/scene; the
   bible supplies palette/medium/lighting. Keep them consistent, never contradict
   the bible.
2. **Prompts must be literal and self-contained - the model cannot infer.** The
   image model renders ONLY what the text literally describes. It has no knowledge
   of physics, canon, or what any concept "looks like". Naming a concept
   ("Cooper pair", "Abrikosov vortices", "the Meissner effect", "flux pinning")
   produces nothing usable - those words mean nothing to it. Instead describe the
   literal picture: exact shapes, how many, where positioned, what colours, what
   arrows/lines connect what, spatial relationships - as if briefing an
   illustrator who has never heard of the subject. Pack `subject`, `scene`, and
   `composition` with concrete geometry, not jargon. If a reader of the prompt
   alone couldn't draw it, the model can't either. See
   `references/figure-prompt-authoring.md`.
3. **Use multiple reference images when they help.** `style_refs` AND
   `character_refs` are BOTH arrays - a figure may carry several of each. Use
   `style_refs` for palette/medium anchors, `character_refs` for recurring
   subjects/places. Because figures generate in `fig-NN` order, later figures can
   reference an already-generated PNG from the same chapter (e.g. point a
   mountain figure's `character_refs` at `apps/web/public/images/chapters/{slug}/
fig-00-cover.png`) to lock a consistent look. Missing ref paths are silently
   skipped, so this degrades gracefully.
4. **Every figure has a narrative purpose.** If you can't state what it teaches,
   don't make it.
5. **All prompts saved as committed JSON.** Reproducible regen is the point -
   `/pandora figure <id>` re-runs from the JSON.
6. **`id` must match `fig-NN-{slug}` and be unique within the chapter** (schema
   enforces both id format and uniqueness).
7. **Numbering is sequential** in narrative order: `fig-01-…`, `fig-02-…`
   (`fig-00-cover` is the cover; body figures start at `fig-01`).
8. **No plan-artifact references** in JSON fields, ids, or filenames.

## References

| Intent                               | Reference                               |
| ------------------------------------ | --------------------------------------- |
| Apply the STYLE BIBLE / anchors      | `references/style-bible-usage.md`       |
| Decide what + how many to illustrate | `references/figure-planning.md`         |
| Fill the FigurePrompt fields well    | `references/figure-prompt-authoring.md` |
