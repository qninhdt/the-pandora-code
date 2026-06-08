# Classification Rubric

How to assign the chapter's `classification` percentages in `meta.yaml`. The four
values (`canon_pct`, `inference_pct`, `speculation_pct`, `real_science_pct`) MUST
sum to 100 (enforced by the schema).

## What each measures

Estimate the share of the chapter's *substantive claims* (not word count) that
sit in each tier:

- **canon_pct** - claims directly established by official Avatar material.
- **inference_pct** - claims the author derives from canon by reasoning, flagged
  as inference.
- **speculation_pct** - plausible extensions explicitly marked speculative.
- **real_science_pct** - verifiable Earth-science content.

## How to estimate

1. After drafting, list the chapter's major claims (roughly 10–25 of them).
2. Tag each with one tier (use the dominant tier if a sentence blends).
3. Convert counts to rough percentages; round so they sum to 100.

This is an honest estimate, not a measurement - but it should track reality. A
chapter that's mostly Earth science with a Pandoran frame will be
`real_science_pct`-heavy; a chapter reading deep into Na'vi biology with little
hard canon will lean `inference`/`speculation`.

## Sanity checks

- If `canon_pct` is high, the research note must actually contain that much
  cited canon. High canon with a thin note is a red flag - recheck tiers.
- A chapter with `speculation_pct` > ~40 should make its speculative nature
  obvious to the reader in the prose, not just the metadata.
- `real_science_pct` near 0 usually means the STEM payload is too thin - revisit
  `stem-mission.md`.

## Where it shows up

These percentages drive the reader-facing classification meters/badges, so they
set reader expectations. Keep them honest - the book's credibility depends on it.
