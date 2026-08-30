# Figure-Prompt Authoring

How to fill the `FigurePrompt` fields so the image both teaches and stays on
brand. Schema: `apps/web/lib/content/schemas/figure-prompt.ts`.

## Field-by-field

| Field | What to write |
|---|---|
| `id` | `fig-NN-{short-slug}`, sequential in narrative order, unique in chapter |
| `chapter_slug` | the chapter slug (matches the dir) |
| `role` | `hero` / `inline` / `comparison` / `diagram` |
| `narrative_purpose` | the real teaching reason (≥10 chars) - not "looks nice" |
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

`seed` / `response_id` are written back by the generation script - leave them out.

## Writing good prompts

- **The model cannot infer - describe the literal picture.** The image model
  renders only what the words say; it has zero knowledge of physics, canon, or
  what a concept "looks like". NEVER rely on a concept name to carry the image.
  "A Cooper pair", "Abrikosov vortices", "the Meissner effect" render nothing.
  Translate every concept into concrete visual instructions: exact shapes, how
  many of them, where they sit, what colour, what lines/arrows connect what, and
  the spatial layout. Brief it like an illustrator who has never heard the term.
  Test: if someone could draw the figure from `subject` + `scene` + `composition`
  alone, the model can too; if they'd have to look the concept up, rewrite.
- **Describe, don't direct.** Concrete nouns and spatial relationships beat
  adjectives. "A six-limbed grazer mid-stride across a glowing fern flat" beats
  "a beautiful majestic alien animal".
- **Let the bible carry the global look.** Don't restate the global palette/
  medium in every figure - `palette`/`style` hold only what's specific here. But
  DO spell out the figure's own content in full literal detail.
- **Aspect ratio fits role.** Heroes wide (16:9 / 3:2); portraits/diagrams often
  4:3 or 1:1; vertical 9:16 only when the subject is tall.
- **Exclusions matter.** Use `exclude` + `negative_prompt` to keep out
  contaminants (text, watermarks, Earth flora, wrong limb counts). For diagrams,
  exclude "text" and "numbers" since the model renders garbled glyphs - let the
  component overlay real labels instead.
- **Consistency is self-contained OR a real reference.** `consistency_notes` must
  describe the look in words (it is just more prompt text) - never point at
  another figure by name ("same as fig-02"); the model can't see other figures.
  For genuine visual matching, attach actual files via `style_refs` /
  `character_refs`.

## Reference images (multiple allowed)

`style_refs` and `character_refs` are BOTH arrays - attach as many as help. The
generation script feeds them to the image edit endpoint, so the model literally
sees them (unlike text naming another figure, which does nothing).

- `style_refs`: palette/medium anchors (e.g. `pandora-establishing.png` in
  `content/art-direction/anchors/`).
- `character_refs`: a recurring creature/place to keep consistent.
- **Chain within a chapter:** figures generate in `fig-NN` order, so a later
  figure can reference an already-rendered PNG from the same chapter, e.g.
  `"character_refs": ["apps/web/public/images/chapters/{slug}/fig-00-cover.png"]`
  to lock the same mountain look. Bare names resolve against the anchors dir;
  paths containing `/` resolve from the repo root. Missing paths are silently
  skipped, so referencing a not-yet-generated file just degrades to no-ref.
- Photoreal scenes benefit from a photoreal anchor; clean schematic diagrams
  usually should NOT take a photoreal ref (it muddies the line-art look) - anchor
  those with the STYLE BIBLE prepend and literal wording instead.

## After authoring

Add the figure to `meta.yaml` `figures[]` (`id`, `role`, `asset_status: pending`),
then run `pnpm gen-images --chapter {slug}`. Regenerate a single figure with
`pnpm gen-images --figure {id} --force` (or `/pandora figure {id}`).
