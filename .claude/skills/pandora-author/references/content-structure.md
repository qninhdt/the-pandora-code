# Content Structure

How to lay out a chapter. A guide, not a rigid template - let the material shape
the order. Target 5–7k EN words.

## The arc

1. **Cold open (observation).** Drop the reader in front of a concrete Pandoran
   thing they can see. No definitions, no thesis. Earn curiosity first.
2. **The question.** Turn the observation into a "how can that be?" - the hinge
   that makes the science feel necessary, not bolted on.
3. **The reading.** Work through the Pandoran phenomenon, letting the real
   science emerge as the natural explanation. One concept carries the chapter;
   supporting ideas serve it.
4. **The Earth turn.** Make the STEM payload explicit: this is the real
   principle, here's where it shows up on Earth. The reader should feel they've
   learned something transferable.
5. **Honest edges.** What's canon, what's inference, what the films never say.
   Use the classification components.
6. **Close.** A short landing that returns to the opening image, now understood.

## Components (palette, not checklist)

Reach for the registered content components only where they earn their place:
- A hero figure to anchor the cold open (often the chapter's `fig-00-cover` -
  the same representative image shown on the landing book-map plate).
- Inline figures / diagrams where a visual teaches faster than prose.
- A "what this means" beat for the Earth turn.
- Classification badges / confidence meter for the honest-edges section.
- "Open questions" for genuine canon gaps.
- `<GlossaryTerm slug="…">` on first use of a defined term.

Build a bespoke component if the chapter needs a visualization the library lacks
(see the orchestrator's component-palette reference). Never add a component just
to use it.

## Pacing rules

- Sections should breathe - alternate dense explanation with lighter scene.
- No section should read as a self-contained textbook entry.
- If you're three concepts deep, cut to one and go deeper.
- Figures punctuate; they don't decorate. Each has a narrative purpose.

## Frontmatter / meta

Author `meta.yaml` alongside the MDX (see SKILL.md for the field list). `part`
and `order` mirror the chapter's slot in `outline.ts`. List every defined term
the chapter uses in `glossary_terms`, and every figure in `figures[]`.
