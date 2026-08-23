# Component Authoring & Palette — Minimum 3 New Components per Chapter

How `/pandora` authors and integrates interactive components for each chapter.
Every chapter in The Pandora Code is an interactive, explorable experience where
visual and interactive models teach the STEM concepts.

## The Rule

1. **Build at least 3 new bespoke components per chapter.**
   Each chapter MUST author, implement, and register at least 3 brand-new custom
   components (interactive simulations, calculators, interactive 2D/3D physical
   models, dynamic charts, comparative visualizers) tailored specifically to that
   chapter's scientific phenomena and narrative beats.
2. **Reusing existing components is allowed ONLY if strictly necessary.**
   Do not lazily reuse components across chapters. Existing components from the
   baseline or earlier chapters may only be reused if there is a strict, genuine
   pedagogical justification (e.g., core infrastructural callouts or an exact
   comparative fit). Reusing an existing component does NOT count toward the
   mandatory minimum of 3 new bespoke components.
3. **Plan components in Plan Mode (Step 0).**
   Before authoring prose, identify the exact 3+ new components to create, their
   props, what scientific mechanism they demonstrate, and how they interact with
   the reader.

## Standards for New Components

New components must match the existing codebase quality standards:
- **Registered in `apps/web/lib/mdx-components.ts`** so MDX files can use them directly.
- **Located under `apps/web/components/content/`** (or `apps/web/components/three/` if 3D).
- **Styled from design tokens** (`apps/web/lib/design-tokens.ts` / `globals.css`) — no hard-coded arbitary colors.
- **2D Fallback for 3D:** If using 3D (`react-three-fiber`), provide a smooth 2D fallback and respect WebGL capabilities and performance toggles.
- **Mobile-verified:** Must function seamlessly on mobile screens (~375px) as well as desktop.
- **Bilingual-ready (i18n):** All visible strings, axis labels, legends, tooltips, and annotations MUST be passed via props so both `en.mdx` and `vi.mdx` can localize them cleanly.
- **Human-facing text:** Render clear human-readable labels throughout UI elements. Never expose raw variable names (`t`, `R`, `flux`, `omega`) without accessible labels.

## What NOT to do

- Do NOT skip the 3 new components requirement.
- Do NOT reuse existing components just to fill space — only reuse if truly necessary.
- Do NOT pull legacy components from old discarded projects.
- Do NOT reference plan artifacts (phase numbers, finding codes) in component names, files, or comments. Name them for what they actually are (e.g., `SuperconductorMeissnerSimulator`, `AtmosphereDensityCalculator`).

## Live Inventory

Browse `apps/web/components/content/` and `apps/web/components/three/` to see the current inventory. The `/{locale}/design` page renders the live component catalog.
