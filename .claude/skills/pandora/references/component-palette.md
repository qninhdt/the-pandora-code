# Component Palette — reuse, not a checklist

How `/pandora` chooses the interactive components for a chapter. This rule exists
because the old project either ignored components or crammed them in; both hurt.

## The rule

The component library is a **reference palette that grows chapter by chapter**.
It is **never a checklist** to satisfy. After reading the research note and
forming the chapter plan, the author/art-director:

1. **Reuse what exists right now.** The components present in the project at this
   moment = the fresh baseline + everything accumulated from earlier chapters.
   Pick only what *this* chapter genuinely needs.
2. **Never force-fit.** Do not add a component just because it exists. A chapter
   that needs three components uses three; one that needs eight uses eight.
3. **Build bespoke when needed.** If the chapter needs something the library
   doesn't have, build it. Different chapters legitimately need different (and
   new) components. The library is *expected* to keep expanding.

## Standards for new components

New components match the existing baseline:
- Registered in `apps/web/lib/mdx-components.ts` so MDX can use them.
- Styled from design tokens (`apps/web/lib/design-tokens.ts` /
  `globals.css`) — no hard-coded colors.
- If 3D (react-three-fiber), ship a 2D fallback and obey the perf/fallback
  gateway used by the other 3D components.
- Mobile-verified (works at ~375px) and desktop.
- Bilingual-ready: any visible strings come from props, so EN/VI both render.

## What NOT to do

- Do NOT pull components from the old project — discarded for quality.
- Do NOT reference plan artifacts (phase numbers, finding codes) in component
  names, files, or comments. Name for what the component *is*.
- Do NOT block a chapter waiting for a "complete" library — build what this
  chapter needs and move on.

## Where to look

Browse `apps/web/components/content/` and `apps/web/components/three/` for the
current palette before deciding to build new. The `/{locale}/design` page renders
the live inventory — a fast way to see what already exists.
