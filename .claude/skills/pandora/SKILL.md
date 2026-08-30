---
name: pandora
description: Single entry point for producing chapters of The Pandora Code interactive book. Drives the whole pipeline - research prompt → write EN → figures → images → translate VI → validate - with exactly one manual stop (paste research). Auto-routes to sub-skills; never invents canon.
triggers:
  - pandora
  - pandora next
  - write chapter
  - next chapter
  - generate chapter
  - chapter pipeline
metadata:
  type: project-skill
---

# /pandora - The Pandora Code Pipeline

The one command that turns the chapter outline into a finished, bilingual,
illustrated chapter. You only ever type `/pandora …`. This skill routes to the
sub-skills internally - never load a sub-skill by hand.

## Mission (read every run)

The Pandora Code is **not a wiki**. Pandora is the bait; real STEM is the meal.
Every chapter ships two payloads: a deeper read of Avatar/Pandora/the Na'vi, AND
a real, verifiable Earth-science concept the reader carries away. A chapter that
only describes Pandora is incomplete; one that only lectures is wrong. Weave the
science in subtly - it should feel like the natural next sentence, never homework.

## Commands

| Command                     | What it does                                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `/pandora status`           | List the outline (9 Parts + prologue, 50 chapters) with each chapter's state: published / drafted / has-research / pending.            |
| `/pandora next`             | Find the first non-published chapter and either emit a research prompt + STOP, or (research present) run the full chain automatically. |
| `/pandora write <slug>`     | Run the write→figures→images→translate→validate chain for one chapter. Hard error if its research note is missing.                     |
| `/pandora figure <id>`      | Regenerate a single figure image (`fig-NN-…`) via `gen-images.ts --figure`.                                                            |
| `/pandora translate <slug>` | (Re)generate `vi.mdx` from `en.mdx` for one chapter (body + figure captions).                                                          |
| `/pandora transcript <slug>` | (Re)generate `{en,vi}.transcript.json` for one chapter (skeleton → adapt → validate both locales).                                  |

`<slug>` and chapter order come from **`apps/web/lib/content/outline.ts`** -
the same single source the landing page and reader nav read. Do not maintain a
second list. See `references/command-reference.md`.

## The flow - `/pandora next` (the heart of this skill)

```
read outline.ts → first chapter with status != "published"
check research/{slug}.md exists?
  NO  → route to pandora-research: write research/{slug}.prompt.md
        print: copy prompt.md → run in Gemini Deep Research →
                send English export prompt in same chat →
                paste codeblock into research/{slug}.md → run `/pandora next` again
        STOP        ← THE ONLY MANUAL STOP. Do not continue. Do not guess canon.
  YES → ENTER PLAN MODE before reading the note or writing (see Hard Rules #2)
        then run automatically, with NO further prompts:
          0. read research/{slug}.md + outline → a short chapter plan
             (structure, dual-payload beats, plan for ≥3 new bespoke components, strictly justified reuse of existing components, figure list)
          1. pandora-author      → content/chapters/{slug}/en.mdx (5–7k words, fusion voice)
          2. pandora-art-director → 7–10 inline figure specs + fig-00 cover
          3. scripts/gen-images.ts --chapter {slug}   → PNGs + flips asset_status
          4. figure-annotation pass → READ each generated PNG, author labels/notes
                                       onto its <DiagramFigure> in en.mdx (coords come
                                       from the real image, so this MUST follow image gen)
          5. pandora-translate   → content/chapters/{slug}/vi.mdx (body + captions + labels)
          6. pandora-transcript  → content/chapters/{slug}/{en,vi}.transcript.json
                                  (run for both locales, then pnpm transcript:validate {slug})
          7. pnpm check-glossary {slug} && pnpm validate:content && pnpm build
        print a summary + how to regen a figure (`/pandora figure <id>`)
```

Full detail, including `meta.yaml` authoring and the status taxonomy, lives in
`references/pipeline-flow.md`. Error messages live in `references/error-messages.md`.

## Hard Rules (non-negotiable)

1. **Exactly one manual stop.** The ONLY time `/pandora` stops for the user is to
   paste research. Everything after research-present is non-interactive - no
   "should I continue?" prompts between write, figures, images, translate,
   transcript, build.

2. **Plan mode before reading research / writing.** Before the author reads the
   research note and drafts prose, `/pandora` MUST be in plan mode. Auto-enable it
   if the environment allows; otherwise stop and ask the user to turn it on, then
   resume. Rationale: the chapter plan (structure, beats, component + figure
   choices) must be formed and reviewable **before** 5–7k words are generated.
   This is a mode guarantee inside the automatic chain - it is NOT a second manual
   content stop and does not count against Rule #1.

3. **Never invent canon.** If `research/{slug}.md` is missing, hard-error with the
   exact paste path + next command (see `references/error-messages.md`). Do not
   improvise Pandora facts from memory. Research files are git-ignored
   (`research/*.md`); prompts are tracked (`research/*.prompt.md`).

4. **Pull only what the chapter needs.** Deep Research returns a sprawling library;
   most is out of scope for this chapter. Filter aggressively. Force-fitting all
   research into the prose is the exact failure mode this pipeline prevents.

5. **Glossary stays in sync (continuous).** Every run ends with
   `pnpm check-glossary {slug}`. Any term the chapter references via
   `<GlossaryTerm slug="…">` or in `meta.yaml` `glossary_terms` MUST have a
   definition file at `content/glossary/{id}.yaml`. If the check fails, add the
   missing definitions (don't remove the reference) and re-run. The old project
   shipped many dangling terms - this guard prevents recurrence. Every glossary
   definition file MUST also carry a `tags:` array from the fixed vocabulary in
   `apps/web/lib/content/schemas/glossary-tags.ts` (the lookup facet on the
   glossary page), not just a `category`. Prefer existing tags; if no tag fits a
   genuinely new facet, extend the vocabulary first (add the slug to
   `GLOSSARY_TAGS` + a vi/en label to `GLOSSARY_TAG_LABELS`), then use it. Adding
   a tag ad-hoc in content YAML without registering it fails schema validation.

6. **At least 3 new bespoke components per chapter; reuse old only if truly necessary.**
   Every chapter MUST build and introduce at least 3 new custom interactive components
   tailored specifically to the chapter's unique scientific mechanisms and narrative beats.
   Reusing existing components is permitted ONLY when strictly necessary and explicitly
   justified in the chapter plan; never default to reusing old components out of convenience.
   See the rule below and `references/component-palette.md`.

7. **All code / identifiers / filenames / comments / commit messages in English.**
   Reader prose: EN authored first → VI translated. VI is the default display
   locale. Never reference plan artifacts (phase numbers, finding codes) in code,
   comments, or commit messages - describe the _why_, not the origin.

8. **Every AI-image figure is a `<DiagramFigure>`, annotated after image gen.**
   Author AI-generated image figures as `<DiagramFigure>` (never the bare
   `<Figure>`) so they carry callout labels and the global show/hide-annotations
   toggle. Labels CANNOT be authored until the PNG exists - their `{x,y}` coords
   are read off the real image - so the figure-annotation pass (flow step 4) runs
   AFTER `gen-images` and BEFORE translate. The author writes the `<DiagramFigure>`
   with `src/alt/figNo/caption/tier` first (labels empty); the annotation pass
   fills `labels=[…]`. See `pandora-art-director` (annotation pass) and
   `pandora-author` (figure component rule).

9. **Keep visual density high.** A standard 5–7k-word chapter ships **7–10
   inline AI-image figures**, in addition to `fig-00-cover`; `fig-99-background`
   remains optional and does not count toward the range. Treat seven inline
   figures as the default minimum. Distribute them across distinct narrative or
   scientific beats instead of clustering them, and never pad the count with
   near-duplicates. Go below seven only when the chapter is materially shorter
   or another visual already communicates the same beat better; record that
   reason in the chapter plan.

## Component authoring (at least 3 new components per chapter)

Each chapter must deliver high interactive depth and visual explanation:

- **Build at least 3 new bespoke components** per chapter (interactive
  simulations, calculators, comparative diagrams, 2D/3D physical models, sensor
  visualizers) specifically designed to make that chapter's STEM payload
  tangible and explorable.
- **Strictly limit reuse of existing components.** Reusing components from earlier
  chapters or the baseline is only allowed if strictly and genuinely necessary
  (e.g., core infrastructural callouts or an exact pedagogical fit). Reusing an
  existing component does NOT count toward the minimum requirement of 3 new components.

New components follow the project's component standards: registered in
`apps/web/lib/mdx-components.ts`, styled from design tokens, a 2D fallback if 3D,
mobile-verified (~375px), and bilingual-ready (props for all text labels).
The old project's components are NOT a source - they were discarded for quality.
See `references/component-palette.md`.

## Routing table (internal - user never sees these)

| Step                                | Sub-skill / script                                        |
| ----------------------------------- | --------------------------------------------------------- |
| Compose DR prompt, ingest research  | `pandora-research`                                        |
| Plan + write EN prose               | `pandora-author`                                          |
| Figure prompts + image gen          | `pandora-art-director` → `scripts/gen-images.ts`          |
| Figure annotation pass (labels)     | `pandora-art-director` (reads PNGs → labels in en.mdx)    |
| EN→VI translation (body + captions) | `pandora-translate`                                       |
| Audio transcripts (EN+VI)           | `pandora-transcript` → `scripts/gen-transcript-skeleton.mjs` + `scripts/validate-transcript.mjs` |
| Glossary sync                       | `scripts/check-glossary-terms.ts` (`pnpm check-glossary`) |
| Validate + build                    | `pnpm validate:content`, `pnpm build`                     |

## Definition of done (per chapter)

- `content/chapters/{slug}/{meta.yaml,en.mdx,vi.mdx}` exist and validate.
- `content/chapters/{slug}/{en,vi}.transcript.json` exist and `pnpm transcript:validate {slug}` passes.
- Includes at least 3 newly created bespoke interactive components registered in
  `apps/web/lib/mdx-components.ts`; any reused components are strictly necessary and justified.
- `figures/fig-NN-*.json` present; images generated; `asset_status: ready`.
- Standard 5–7k-word chapters contain 7–10 distinct inline figures, plus the
  cover; any justified lower count is called out in the chapter plan.
- Every AI-image figure renders as a `<DiagramFigure>` and has been through the
  annotation pass: callout `labels=[…]` authored from the real PNG (EN), then
  translated (VI). Decorative cover/background layers (`fig-00`, `fig-99`) are
  exempt - they are not inline figures.
- `pnpm check-glossary {slug}` passes (no dangling terms).
- `pnpm validate:content` + `pnpm build` green.
- Chapter reads as a fused Pandora→STEM piece, not a wiki dump or a lecture.
