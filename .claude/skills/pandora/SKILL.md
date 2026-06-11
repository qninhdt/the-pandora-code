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

`<slug>` and chapter order come from **`apps/web/lib/content/outline.ts`** -
the same single source the landing page and reader nav read. Do not maintain a
second list. See `references/command-reference.md`.

## The flow - `/pandora next` (the heart of this skill)

```
read outline.ts → first chapter with status != "published"
check research/{slug}.md exists?
  NO  → route to pandora-research: write research/{slug}.prompt.md
        print: open the prompt → run it in Gemini Deep Research →
                paste the result into research/{slug}.md → run `/pandora next` again
        STOP        ← THE ONLY MANUAL STOP. Do not continue. Do not guess canon.
  YES → ENTER PLAN MODE before reading the note or writing (see Hard Rules #2)
        then run automatically, with NO further prompts:
          0. read research/{slug}.md + outline → a short chapter plan
             (structure, dual-payload beats, components to reuse/create, figure list)
          1. pandora-author      → content/chapters/{slug}/en.mdx (5–7k words, fusion voice)
          2. pandora-art-director → content/chapters/{slug}/figures/fig-NN-*.json (many)
          3. scripts/gen-images.ts --chapter {slug}   → PNGs + flips asset_status
          4. figure-annotation pass → READ each generated PNG, author labels/notes
                                       onto its <DiagramFigure> in en.mdx (coords come
                                       from the real image, so this MUST follow image gen)
          5. pandora-translate   → content/chapters/{slug}/vi.mdx (body + captions + labels)
          6. pnpm check-glossary {slug} && pnpm validate:content && pnpm build
        print a summary + how to regen a figure (`/pandora figure <id>`)
```

Full detail, including `meta.yaml` authoring and the status taxonomy, lives in
`references/pipeline-flow.md`. Error messages live in `references/error-messages.md`.

## Hard Rules (non-negotiable)

1. **Exactly one manual stop.** The ONLY time `/pandora` stops for the user is to
   paste research. Everything after research-present is non-interactive - no
   "should I continue?" prompts between write, figures, images, translate, build.

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
   glossary page), not just a `category`.

6. **Components are a reference palette, not a checklist.** See the rule below.

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

## Component selection (palette, not checklist)

The component library is a **reference palette that grows chapter by chapter** -
never a fixed checklist to satisfy. After reading the research note, the
author/art-director:

- **Reuse** the components that exist in the project _at that moment_ (the fresh
  baseline plus everything accumulated from earlier chapters). Pick only what this
  chapter genuinely needs. **Never force-fit or cram in a component** to "use it".
- **Build new bespoke components** for anything the chapter needs that doesn't
  exist yet. Different chapters legitimately need different (and new) components;
  the library is expected to keep expanding.

New components follow the existing component standards: registered in
`apps/web/lib/mdx-components.ts`, styled from design tokens, a 2D fallback if 3D,
mobile-verified. The old project's components are NOT a source - they were
discarded for quality. See `references/component-palette.md`.

## Routing table (internal - user never sees these)

| Step                                | Sub-skill / script                                        |
| ----------------------------------- | --------------------------------------------------------- |
| Compose DR prompt, ingest research  | `pandora-research`                                        |
| Plan + write EN prose               | `pandora-author`                                          |
| Figure prompts + image gen          | `pandora-art-director` → `scripts/gen-images.ts`          |
| Figure annotation pass (labels)     | `pandora-art-director` (reads PNGs → labels in en.mdx)    |
| EN→VI translation (body + captions) | `pandora-translate`                                       |
| Glossary sync                       | `scripts/check-glossary-terms.ts` (`pnpm check-glossary`) |
| Validate + build                    | `pnpm validate:content`, `pnpm build`                     |

## Definition of done (per chapter)

- `content/chapters/{slug}/{meta.yaml,en.mdx,vi.mdx}` exist and validate.
- `figures/fig-NN-*.json` present; images generated; `asset_status: ready`.
- Every AI-image figure renders as a `<DiagramFigure>` and has been through the
  annotation pass: callout `labels=[…]` authored from the real PNG (EN), then
  translated (VI). Decorative cover/background layers (`fig-00`, `fig-99`) are
  exempt - they are not inline figures.
- `pnpm check-glossary {slug}` passes (no dangling terms).
- `pnpm validate:content` + `pnpm build` green.
- Chapter reads as a fused Pandora→STEM piece, not a wiki dump or a lecture.
