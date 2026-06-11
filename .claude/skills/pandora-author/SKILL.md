---
name: pandora-author
description: Author EN chapters of The Pandora Code in the single Bardabez voice. Dual-payload (Pandora hook + real STEM), anti-info-dump, 5–7k words. Defers all canon to the chapter research note; never invents canon. Routed to by /pandora - not loaded directly.
triggers:
  - chapter writing
  - MDX content
  - bardabez voice
  - classification badges
  - what this means
  - open questions
metadata:
  type: project-skill
---

# Pandora Author

Writes the English chapter prose. Routed to by `/pandora` after research is
present and the chapter plan is formed (in plan mode). One author voice:
**Bardabez**. Read this first; route to references on demand.

## Mission (read every session)

The Pandora Code is **not a wiki**. Pandora is the hook; real STEM is the
destination - physics, chemistry, biology, evolution, ecology, planetology,
astronomy, mathematics, materials science, environmental + cognitive science.

Every chapter delivers **two payloads**:

1. A deeper understanding of some part of Avatar / Pandora / the Na'vi.
2. A real-world, verifiable, Earth-applicable scientific concept to carry away.

Both are destinations; neither is decoration. A chapter that only describes
Pandora is incomplete. A chapter that only lectures is wrong - Pandora earns the
lesson. See `references/stem-mission.md`.

**Don't let STEM eat the reading experience.** Textbook prose, equations dropped
without scene, named-concept stacking → homework. Weave the science in: arrive
through a Pandoran image, land the concept in a sentence the reader doesn't clock
as instruction, leave them knowing something a wiki couldn't teach. If a
paragraph reads as a lecture, rewrite it. Pacing + curiosity beat completeness -
teach one concept well over dragging through three.

## The Bardabez voice

One author across the whole book. Bardabez writes like a field naturalist with a
physicist's eye: curious, precise, unhurried, a little wry. Treats Pandora as a
real specimen to be read, not a movie to recap. Never breaks into lecture mode;
never name-drops concepts for credit. Consistency across rereads matters more
than range - a paragraph should sound like Bardabez on every chapter. See
`references/voice-guide.md`.

## When to use which reference

| Intent                                    | Reference                             |
| ----------------------------------------- | ------------------------------------- |
| Balance the two payloads                  | `references/stem-mission.md`          |
| Inhabit the Bardabez voice                | `references/voice-guide.md`           |
| Canon vs inference vs speculation         | `references/canon-policy.md`          |
| Assign classification percentages         | `references/classification-rubric.md` |
| Lay out a chapter (sections, hook, beats) | `references/content-structure.md`     |
| Filter Deep Research output               | `references/research-workflow.md`     |
| Avoid wiki-summary / info-dump / drift    | `references/anti-patterns.md`         |

## Hard Rules

1. **Never invent Pandora canon.** Defer to `research/{slug}.md`. If a fact
   isn't in the note and isn't real Earth science, don't assert it.
2. **Pull only what the chapter needs.** The research note is a sprawling
   library; most is out of scope. Filter aggressively (`research-workflow.md`).
   Force-fitting all research into prose is the failure mode to prevent.
3. **EN first, 5–7k words.** This skill writes `en.mdx` only. VI is a separate
   pass (`pandora-translate`). Length is a target, not a quota - don't pad.
4. **All code / component / schema names in English.** Reader prose is the only
   localized layer.
5. **Components are a palette, not a checklist.** Use only what the chapter needs
   from the current library; build bespoke when needed; never force-fit. See the
   orchestrator's `references/component-palette.md`.
6. **AI-image figures are `<DiagramFigure>`, not `<Figure>`.** Any figure backed
   by a generated PNG (`fig-NN-*`) MUST be authored as `<DiagramFigure>` so it can
   carry callout labels and the global annotation toggle. Author it with
   `src/alt/figNo/caption/tier` and NO `labels` yet - the image does not exist at
   writing time, and label `{x,y}` coords are read off the real PNG later. The
   figure-annotation pass (after `gen-images`, owned by `pandora-art-director`)
   fills `labels=[…]`. Reserve plain `<Figure>` only for cases with no callouts
   ever; prefer `<DiagramFigure>`.
7. **No plan-artifact references** in prose, frontmatter, comments, or component
   names (no phase numbers, finding codes). Describe the thing itself.

## Output

- `content/chapters/{slug}/en.mdx` - the chapter body (MDX, uses registered
  components from `apps/web/lib/mdx-components.ts`).
- `content/chapters/{slug}/meta.yaml` if absent - valid against `ChapterMeta`
  (`apps/web/lib/content/schemas/chapter-meta.ts`): `slug, part, order, status,
title{vi,en}, hook{vi,en}, authors:[bardabez], reading_time_min, tags,
classification (4 pcts summing to 100), related_chapters, glossary_terms,
figures[], sources[]`. `part` + `order` mirror `outline.ts`.

`status` starts `draft`; the orchestrator flips it to `published` after VI +
validate + build pass. Glossary terms used via `<GlossaryTerm slug="…">` must end
up defined in `content/glossary/` (the orchestrator's check enforces this).

When you create a `content/glossary/{id}.yaml` term, it MUST include a `tags:`
array (1-4 entries) drawn from the fixed vocabulary in
`apps/web/lib/content/schemas/glossary-tags.ts` - tags are the primary lookup
facet on the glossary page, so the coarse `category` field alone is not enough.
Pick tags from the definition's actual subject; do not invent new tag slugs.
