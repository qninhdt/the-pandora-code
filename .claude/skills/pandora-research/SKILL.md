---
name: pandora-research
description: Generate per-chapter Gemini Deep Research prompts for The Pandora Code, and define how the pasted result is ingested. Dual-payload prompts (Pandora canon + Earth-science literature). Routed to by /pandora — not loaded directly.
triggers:
  - deep research
  - research prompt
  - DR prompt
  - chapter research
  - research notes
metadata:
  type: project-skill
---

# Pandora Research

Owns the one manual step in the whole pipeline: composing the Deep Research
prompt for a chapter and defining where its result lands. Routed to by
`/pandora next` when a chapter has no research note. Pairs with `pandora-author`
(which writes prose only after the note exists).

## Mission constraint (dual payload)

The Pandora Code is **not a wiki**. Every chapter ships two payloads — a Pandora
payload and a real-world STEM payload. So every DR prompt must cover **both
sides**: Pandora canon AND the Earth-science literature behind the chapter's STEM
concept. A prompt that only asks about Avatar canon is incomplete and must be
rewritten. See `references/deep-research-prompt-template.md`.

## The per-chapter loop

```
/pandora next resolves chapter {slug} with no research/{slug}.md
  → this skill composes ONE Deep Research prompt
  → write it to research/{slug}.prompt.md   (tracked in git)
  → print: open the prompt → run in Gemini Deep Research →
            paste the FULL result into research/{slug}.md → run `/pandora next` again
  → STOP   ← the only manual step in the pipeline
```

`research/{slug}.md` is git-ignored (raw research stays local);
`research/{slug}.prompt.md` is tracked (the prompt is reproducible + reviewable).
Paths are per-chapter, keyed by slug — NOT a shared dated folder.

## Hard Rules

1. **One prompt per chapter, per round.** Long and specific; never split across
   messages. Write it to `research/{slug}.prompt.md`, don't just print it.
2. **The user runs the prompt.** This skill never calls Gemini APIs. The user
   pastes the prompt into the Gemini Deep Research UI.
3. **Hard error if the note is missing.** Writing a chapter without
   `research/{slug}.md` is forbidden — `/pandora` blocks it. Never substitute
   model memory for the note; never invent canon.
4. **Save the result verbatim.** The user pastes raw output into
   `research/{slug}.md`. Don't reformat it — the author filters at read time.
5. **The result is a library, not a draft.** DR returns sprawling material, much
   out of scope. The author filters aggressively (`pandora-author/references/
   research-workflow.md`). Force-fitting it into prose is the failure mode this
   whole loop exists to prevent.
6. **Rate sources before claims are imported.** Canon vs community vs scientific
   governs how a claim may be used. See `references/source-credibility-rubric.md`.

## References

| Intent | Reference |
|---|---|
| Compose a chapter's DR prompt | `references/deep-research-prompt-template.md` |
| Define how the pasted result is structured | `references/research-notes-format.md` |
| Tier a source (canon / community / science) | `references/source-credibility-rubric.md` |

## Anti-patterns

- Composing the prompt and the chapter outline in the same response (the prompt
  is the stop; outlining happens after the result is pasted).
- Importing fan-wiki claims as canon without re-tiering.
- Citing Gemini's synthesis paragraph instead of the sources it points to.
