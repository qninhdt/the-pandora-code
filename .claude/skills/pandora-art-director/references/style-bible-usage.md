# STYLE BIBLE Usage

The one global look for every image in the book lives in
`content/art-direction/style-bible.md`. This file is how the art director applies
it.

## How the bible reaches the image

`scripts/gen-images.ts` loads the bible via
`scripts/lib/style-bible-loader.ts` and **composes** it with each figure's JSON
prompt before calling the image model. So:

- The bible supplies the **global** layer: palette (canonical hex), medium,
  lighting language, recurring exclusions.
- The figure JSON supplies the **specific** layer: this subject, this scene, this
  composition.

Do not duplicate the bible's palette/medium into every figure's `palette` /
`style` fields verbatim — reference the bible's intent and add only what's
figure-specific. The two must never contradict (a figure that asks for a look the
bible forbids will read as off-brand).

## Anchors (reference images)

`content/art-direction/anchors/` holds reference images. Put their bare filenames
in a figure's `style_refs[]` (to lock palette/medium) or `character_refs[]` (to
keep a recurring creature/place consistent across figures). The script feeds them
to the image edit endpoint. Bare names resolve against the anchors dir; explicit
relative paths resolve from repo root (`scripts/lib/figure-paths.ts`
`resolveReferencePath`).

Use anchors when:
- A creature/place recurs across figures and must look the same.
- A chapter's figures must match the established establishing-shot palette.

## Consistency notes

Each figure's `consistency_notes` field is where you tell the model what must
stay stable (e.g. "same six-limbed body plan and queue as fig-02; bioluminescent
markings cyan not magenta"). This is the per-figure complement to the global
bible — use it to prevent drift between a chapter's own figures.

## If the bible needs a change

The bible is global — changing it affects every future image. Treat edits as a
deliberate, project-level decision, not a per-chapter tweak. Per-chapter needs
belong in figure JSON / consistency notes, not the bible.
