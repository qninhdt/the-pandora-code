---
name: pandora-translate
description: Translate finished EN chapters of The Pandora Code into native-reading Vietnamese - body + figure captions + callouts in one pass. VI is the default display locale. Routed to by /pandora - not loaded directly.
triggers:
  - translate chapter
  - vietnamese translation
  - vi mdx
  - localize chapter
  - figure caption translation
metadata:
  type: project-skill
---

# Pandora Translate

Turns a finished `en.mdx` into a `vi.mdx` that reads as native Vietnamese - not
as translated English. Routed to by `/pandora` after the EN prose + figures
exist. VI is the book's **default display locale**, so this is not an
afterthought: most readers see the VI first.

## What it produces

`content/chapters/{slug}/vi.mdx` - the full Vietnamese chapter, mirroring the
EN structure:

- Body prose.
- **Every figure caption** and alt/title text.
- **Every callout / component string** that is reader-facing (e.g. "what this
  means", open-questions, classification labels passed as props).

All in **one pass** - body and captions together, never body-now-captions-later.
A chapter is not translated until its captions are too.

## Hard Rules

1. **Translate, don't transliterate.** Never render English word-by-word. If a
   sentence only parses after back-translating to English, rewrite it around the
   concept until it's natural VI.
2. **One pass covers body + captions + callouts.** Don't ship a `vi.mdx` with
   English figure captions left in.
3. **Keep code/component/schema names in English.** Only reader-facing strings
   are translated. MDX component tags, props names, slugs, ids stay as-is.
4. **Mirror structure, not word order.** Same sections, same components, same
   figures - but VI sentence structure, idiom, and rhythm.
5. **Gloss technical/canon terms once.** Established science terms and canonical
   Pandora/Na'vi names may stay in English where that's the natural VI usage;
   gloss on first appearance, then trust the reader. Don't force an awkward VI
   calque when the English term is what VI speakers actually use.
6. **Preserve tier honesty.** The classification framing (canon / inference /
   speculation / real science) must survive translation - don't soften or drop
   the hedges.
7. **No plan-artifact references** introduced in the VI text.

## Process

1. Read the full `en.mdx` (and the figure JSON for caption source text).
2. Translate section by section into natural VI, keeping the MDX structure and
   all component tags intact.
3. Translate every figure caption + reader-facing prop string in the same pass.
4. Run the **post-write naturalness pass** (`references/vi-naturalness-checklist.md`).
5. Write `content/chapters/{slug}/vi.mdx`.

After this, `/pandora` runs glossary check + validate + build, and flips the
chapter `status` to `published` once both mdx exist and pass.

## References

| Intent                                           | Reference                                |
| ------------------------------------------------ | ---------------------------------------- |
| Make VI read as native (failure signals + fixes) | `references/vi-naturalness-checklist.md` |
