# Figure-Prompt Authoring

How to fill the `FigurePrompt` fields so the image both teaches and stays on
brand. Schema: `apps/web/lib/content/schemas/figure-prompt.ts`.

## Field-by-field

| Field | What to write |
|---|---|
| `id` | `fig-NN-{short-slug}`, sequential in narrative order, unique in chapter |
| `chapter_slug` | the chapter slug (matches the dir) |
| `role` | `hero` / `inline` / `comparison` / `diagram` |
| `narrative_purpose` | the real teaching reason (≥10 chars) — not "looks nice" |
| `subject` | the focal thing: creature, structure, scene element |
| `scene` | the setting/context around the subject |
| `camera` | shot type, angle, distance (e.g. "low wide establishing shot") |
| `light` | lighting intent, consistent with the STYLE BIBLE |
| `palette` | figure-specific palette notes (defer global palette to the bible) |
| `style` | medium/rendering notes that don't contradict the bible |
| `detail_level` | how rendered (e.g. "high detail foreground, soft background") |
| `composition` | layout, focal placement, negative space |
| `exclude[]` | things that must NOT appear |
| `consistency_notes` | what must match other figures / canon (≥3 chars) |
| `aspect_ratio` | one of 16:9 / 4:3 / 1:1 / 9:16 / 3:2 |
| `negative_prompt` | quality/contamination guardrails (≥3 chars) |
| `style_refs[]` | anchor filenames to lock palette/medium (optional) |
| `character_refs[]` | anchor filenames to lock a recurring subject (optional) |

`seed` / `response_id` are written back by the generation script — leave them out.

## Writing good prompts

- **Describe, don't direct.** Concrete nouns and spatial relationships beat
  adjectives. "A six-limbed grazer mid-stride across a glowing fern flat" beats
  "a beautiful majestic alien animal".
- **Let the bible carry the look.** Don't restate the global palette/medium in
  every figure — `palette`/`style` hold only what's specific here.
- **Aspect ratio fits role.** Heroes wide (16:9 / 3:2); portraits/diagrams often
  4:3 or 1:1; vertical 9:16 only when the subject is tall.
- **Exclusions matter.** Use `exclude` + `negative_prompt` to keep out
  contaminants (text, watermarks, Earth flora, wrong limb counts).
- **Consistency is explicit.** Name what must match prior figures in
  `consistency_notes`; attach `character_refs` for recurring subjects.

## After authoring

Add the figure to `meta.yaml` `figures[]` (`id`, `role`, `asset_status: pending`),
then run `pnpm gen-images --chapter {slug}`. Regenerate a single figure with
`pnpm gen-images --figure {id} --force` (or `/pandora figure {id}`).
