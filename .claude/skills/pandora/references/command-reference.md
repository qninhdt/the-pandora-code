# Command Reference

Every `/pandora` command, its arguments, and exact behavior.

## `/pandora status`
No args. Prints the full outline grouped by Part (book order) with each
chapter's state (`published` / `drafted` / `has-research` / `pending`).
Read-only — never mutates files. Source of order: `apps/web/lib/content/outline.ts`.

## `/pandora next`
No args. Resolves the first non-published chapter, then:
- **No `research/{slug}.md`** → route to `pandora-research`, write
  `research/{slug}.prompt.md`, print the paste instructions, and STOP.
- **Research present** → enter plan mode, run the full chain (see
  `pipeline-flow.md`). No prompts between steps.

## `/pandora write <slug>`
Arg: chapter slug (must exist in `outline.ts`). Runs the chain (steps 0–5) for
that chapter. Hard error if `research/{slug}.md` is missing — does NOT fall back
to the research-prompt branch (use `next` for that) and never invents canon.

## `/pandora figure <id>`
Arg: a figure id (`fig-NN-…`). Runs `pnpm gen-images --figure <id> --force`,
regenerating just that image and re-persisting `response_id`. Use after editing a
figure JSON or when an image needs a redo.

## `/pandora translate <slug>`
Arg: chapter slug. Routes to `pandora-translate` to (re)generate `vi.mdx` from
the existing `en.mdx` (body + all figure captions + callouts) in one pass.
Requires `en.mdx` to exist.

## Argument resolution

- Slugs are validated against `outline.ts`. An unknown slug → error listing the
  closest matches, never a silent no-op.
- All paths are repo-root-relative: `content/chapters/{slug}/…`,
  `research/{slug}.md`, `apps/web/public/images/chapters/{slug}/…`.

## Scripts these commands shell out to

| Command | Shell |
|---|---|
| images (chapter) | `pnpm gen-images --chapter {slug}` |
| images (one) | `pnpm gen-images --figure {id} [--force]` |
| glossary | `pnpm check-glossary {slug}` |
| validate | `pnpm validate:content` |
| build | `pnpm build` |
