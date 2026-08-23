# Research Notes Format

How the pasted Deep Research result lives in the repo. The guiding principle:
**save it verbatim, filter at read time.**

## Where it goes

`research/{slug}.md` - one file per chapter, keyed by the chapter slug. The user
pastes the full raw Markdown codeblock from Gemini Deep Research (obtained via the
English follow-up export prompt) here. This file is **git-ignored** (`.gitignore`: `research/*.md`)
- raw research stays local. The generated prompt (`research/{slug}.prompt.md`) IS tracked.

## What to paste

The complete raw Markdown output from Gemini's codeblock, unedited. Do NOT trim,
reformat, or pre-summarize it - the author filters aggressively when writing, and
over-trimming now can drop context the author needs.

Ensure the pasted content preserves:
- LaTeX formulas (e.g. `$...$`, `$$...$$`) for physics/math/chemistry equations.
- Full reference URLs and inline citation links.
- Canon and Earth-science sections uncompressed.

## Minimal expected shape

Gemini's output structure varies; that's fine. The note is usable as long as it
contains:
- The canon material (Part A of the prompt) with sources.
- The Earth-science material (Part B) with sources and LaTeX equations where relevant.
- Full reference links and source tiers.

If the pasted result is missing one payload (e.g. all canon, no science), that's
a signal to run a focused follow-up DR for the missing side rather than writing
around the gap.

## How the author uses it

- Reads the whole note once before writing.
- Pulls only what the chapter's core concept needs.
- Re-tiers each pulled claim by its source (see `source-credibility-rubric.md`).
- Cites the underlying source, not Gemini's synthesis paragraph.

See `pandora-author/references/research-workflow.md` for the filtering discipline.

## Presence is mandatory

If `research/{slug}.md` does not exist, the author step hard-errors. The note is
the only sanctioned source of canon - never substitute model memory.
