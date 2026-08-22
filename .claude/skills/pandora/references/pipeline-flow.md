# Pipeline Flow - full detail

The exact mechanics behind `/pandora next` and `/pandora write <slug>`. The
SKILL.md has the summary; this is the operational reference.

## Resolving "next pending"

The outline is `apps/web/lib/content/outline.ts` (`OUTLINE: OutlinePart[]`,
prologue + 9 Parts, 50 chapters, ordered). A chapter is **published** when
`content/chapters/{slug}/meta.yaml` has `status: published` AND both `en.mdx`
and `vi.mdx` exist. "Next pending" = walk `OUTLINE` parts in order, then chapters
in array order, and return the first slug that is not published.

To read the order without a runtime: parse `outline.ts` for the ordered `slug:`
values (they appear top-to-bottom in book order), or run a tiny `tsx` snippet
importing `OUTLINE`. Do not duplicate the list into a new file.

## Status taxonomy (`/pandora status`)

For each outline chapter, report one state:

| State | Condition |
|---|---|
| `published` | `meta.yaml` status `published` + both mdx present |
| `drafted` | chapter dir + `en.mdx` exist, not yet published |
| `has-research` | `research/{slug}.md` exists, no `en.mdx` yet |
| `pending` | nothing yet |

Group the printout by Part, in book order, so it mirrors the landing map.

## The automatic chain (research present)

Run these in order, no prompts between them. Stop only on a hard failure
(surface the error, do not silently continue).

### 0. Chapter plan (in plan mode)
Read `research/{slug}.md` + the chapter's outline entry (title + payload).
Produce a short plan: section structure, the dual-payload beats (where Pandora
hooks, where the STEM lands), which existing components to reuse, which new
components to build, and the figure list (role + purpose each). This is the
plan-mode artifact - reviewable before prose.

### 1. Write EN - `pandora-author`
Author `content/chapters/{slug}/en.mdx` (5–7k words) and the chapter
`meta.yaml` if absent. `meta.yaml` fields (validated by `ChapterMeta`):
`slug, part, order, status, title{vi,en}, hook{vi,en}, authors:[bardabez],
reading_time_min, tags, classification{canon/inference/speculation/real_science
_pct summing to 100}, related_chapters, glossary_terms, figures[], sources[]`.
`part` + `order` must match the chapter's position in `outline.ts`.

### 2. Figures - `pandora-art-director`
Emit `content/chapters/{slug}/figures/fig-NN-*.json`, one per figure, each
valid against `FigurePrompt`. Add a matching `figures[]` entry (id, role,
`asset_status: pending`) to `meta.yaml`. For a standard 5–7k-word chapter,
author **7–10 inline figures** across distinct narrative/science beats; seven is
the default minimum, not a reason to create filler. Go lower only for a
materially shorter chapter or when another visual already carries the same
beat better, and record the reason in the chapter plan. **Always author a
`fig-00-cover` (role `hero`, 16:9/3:2)** - the chapter's representative image
shown on the landing book-map plate. An optional `fig-99-background` is
decorative and does not count toward the inline target. The web resolves the
cover automatically (`fig-00` sorts first; body figures start at `fig-01`).

### 3. Images - `scripts/gen-images.ts`
`pnpm gen-images --chapter {slug}`. Writes PNGs to
`apps/web/public/images/chapters/{slug}/` and flips each figure's
`asset_status` to `ready` in `meta.yaml`. Needs `OPENAI_API_KEY` (+ optional
`OPENAI_BASE_URL`, `OPENAI_IMAGE_MODEL`) in `.env`. Single figure:
`pnpm gen-images --figure fig-NN-… [--force]`.

### 4. Figure annotations - `pandora-art-director`
The figures now have real pixels, so author their callout labels. For each
AI-generated image figure in `en.mdx`:
- Ensure it is a `<DiagramFigure>` (convert any `<Figure>`), carrying
  `src/alt/figNo/caption/tier`.
- READ the generated PNG (`apps/web/public/images/chapters/{slug}/fig-NN-*.png`)
  and author `labels=[{ x, y, side, label, note? }]` - `{x,y}` are percentages
  of the image box placed on the actual features, `label` is the short callout,
  `note` an optional second line. 2–4 labels per figure is the norm; never
  clutter. English strings here (VI comes in the translate pass).
- This pass MUST run after step 3 (coords depend on the real image) and before
  step 5 (so translate carries the labels). Cover/background layers (`fig-00`,
  `fig-99`) are decorative and get no labels.

### 5. Translate - `pandora-translate`
Author `content/chapters/{slug}/vi.mdx` from `en.mdx`: body + every figure
caption + every `<DiagramFigure>` label/note + callouts, in one pass. VI must
read as native VI (see that skill's naturalness checklist). Set `meta.yaml`
`status: published` once VI is done and both mdx exist.

### 6. Validate
```
pnpm check-glossary {slug}   # dangling glossary terms → non-zero
pnpm validate:content        # schema + frontmatter
pnpm build                   # fumadocs-mdx + Next build
```
All three green = chapter done. Print summary + `/pandora figure <id>` hint.

## `/pandora write <slug>` vs `next`

`write <slug>` is the same chain steps 0–6 for a named chapter, with the same
hard-error-if-no-research guard. `next` adds the resolve-next + research-prompt
branch in front. `figure` / `translate` run a single step in isolation.
