# Figure Planning - what and how many to illustrate

Figure count is content-driven, within a density floor. A standard 5–7k-word
chapter ships **7–10 inline AI-image figures** (plus the mandatory `fig-00-cover`;
`fig-99-background` is optional and does not count). Treat **seven inline figures
as the default minimum**. The question is never "how do I hit the number" but
"what does the reader need to *see* to understand this chapter" — then check the
count clears seven and every figure earns its place. Go below seven only when the
chapter is materially shorter or another visual already teaches the same beat,
and record that reason in the chapter plan.

## Where figures earn their place

- **Cold-open anchor (hero).** One strong establishing image for the chapter's
  opening observation. Usually 16:9 or 3:2.
- **Mechanism figures (inline/diagram).** Each step or structure the reader must
  picture to follow the science. If a paragraph describes a spatial/physical
  process, a figure probably teaches it faster.
- **Comparisons.** Pandora-vs-Earth, before-vs-after, scale comparisons - where
  the *contrast* is the point. Role `comparison`.
- **Diagrams.** Abstract relationships (networks, cycles, anatomy callouts) that
  a photo-real scene can't show. Role `diagram`.

## How to plan from the prose

1. Reread the EN chapter section by section.
2. At each section, ask: would a visual teach this faster or deeper than the
   text alone? If yes, note a figure with a one-line narrative purpose.
3. Group/cut: merge figures that teach the same thing; drop any whose purpose you
   can't state in a sentence.
4. Order them in narrative sequence and assign `fig-01`, `fig-02`, …

## Density guidance

- Seven inline figures is the default floor for a standard-length chapter.
- A dense systems/anatomy chapter may warrant the full 7–10 range or more.
- A short reflective chapter may drop below seven — but only with a recorded
  reason in the chapter plan.
- The sample/template chapter is intentionally figure-rich to set the immersion
  bar. Match that bar; do not treat it as an exception that lets you undershoot.

## Anti-pattern: decoration

A figure that looks nice but teaches nothing fails the test. Every figure's
`narrative_purpose` must be a real teaching reason. If it's "looks cool", cut it.

## Anti-pattern: AI images for charts/diagrams

If a real component can render it, use the component — NOT a generated image.
Charts, plots, and data graphs go through the `Chart` component (Recharts);
exact diagrams that need correct labels/values use a diagram component or
hand-authored SVG. AI image models render numbers, axes, and labels garbled and
imprecise, so reserve generated figures for atmospheric/illustrative scenes
(landscapes, creatures, cutaways, conceptual art). A plot of resistance vs.
temperature is a `Chart`, never a `fig-NN` PNG.

## Recurring subjects

If a creature/place appears in multiple figures, plan `character_refs` /
`consistency_notes` up front so they stay visually consistent (see
`style-bible-usage.md`).
