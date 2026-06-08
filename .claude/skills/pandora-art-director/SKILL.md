---
name: pandora-art-director
description: Owns figure art direction for The Pandora Code — applies the one global STYLE BIBLE, authors figure-prompt JSON per chapter (content-driven count, density scales), and invokes gen-images.ts. Routed to by /pandora — not loaded directly.
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

Every image is governed by `content/art-direction/style-bible.md` — the canonical
palette (hex), medium, lighting, and exclusions. The generation script composes
each figure prompt *with* the style bible (`scripts/lib/style-bible-loader.ts`),
so figure JSON describes the **subject and scene**, not the global style. Don't
re-specify the palette/medium in every figure; lean on the bible. See
`references/style-bible-usage.md`.

## Figure count is content-driven

No fixed minimum. Density scales with the chapter — a dense systems chapter earns
many figures; a short one earns fewer. Illustrate where a visual teaches faster
than prose: the cold-open anchor, each mechanism the reader must *see*,
comparisons, diagrams. Never add a figure that teaches nothing (decoration is an
anti-pattern). See `references/figure-planning.md`.

## What this skill produces

For chapter `{slug}`:
- `content/chapters/{slug}/figures/fig-NN-*.json` — one file per figure, valid
  against `FigurePrompt` (`apps/web/lib/content/schemas/figure-prompt.ts`).
- A matching entry in `meta.yaml` `figures[]`: `{ id, role, asset_status: pending }`.
- Then runs `pnpm gen-images --chapter {slug}` → PNGs in
  `apps/web/public/images/chapters/{slug}/`, flips `asset_status` to `ready`,
  and persists `response_id` back into each JSON.

## FigurePrompt fields (what to author)

`id` (`fig-NN-{slug}`), `chapter_slug`, `role` (hero/inline/comparison/diagram),
`narrative_purpose` (why this figure exists — must be real), `subject`, `scene`,
`camera`, `light`, `palette`, `style`, `detail_level`, `composition`,
`exclude[]`, `consistency_notes`, `aspect_ratio` (16:9/4:3/1:1/9:16/3:2),
`negative_prompt`. Optional `style_refs[]` / `character_refs[]` (anchor image
names under `content/art-direction/anchors/`) to lock palette/medium and keep
recurring creatures consistent. `seed`/`response_id` are written back by the
script — don't author them. See `references/figure-prompt-authoring.md`.

## Hard Rules

1. **STYLE BIBLE governs the look.** Figure JSON describes subject/scene; the
   bible supplies palette/medium/lighting. Keep them consistent, never contradict
   the bible.
2. **Every figure has a narrative purpose.** If you can't state what it teaches,
   don't make it.
3. **All prompts saved as committed JSON.** Reproducible regen is the point —
   `/pandora figure <id>` re-runs from the JSON.
4. **`id` must match `fig-NN-{slug}` and be unique within the chapter** (schema
   enforces both id format and uniqueness).
5. **Numbering is sequential** in narrative order: `fig-01-…`, `fig-02-…`.
6. **No plan-artifact references** in JSON fields, ids, or filenames.

## References

| Intent | Reference |
|---|---|
| Apply the STYLE BIBLE / anchors | `references/style-bible-usage.md` |
| Decide what + how many to illustrate | `references/figure-planning.md` |
| Fill the FigurePrompt fields well | `references/figure-prompt-authoring.md` |
