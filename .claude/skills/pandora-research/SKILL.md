---
name: pandora-research
description: Generate per-chapter Gemini Deep Research prompt for The Pandora Code, and define how the pasted result is ingested. Dual-payload prompt (Pandora canon + Earth-science literature) with English follow-up raw markdown/LaTeX export instruction. Routed to by /pandora - not loaded directly.
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

Owns the one manual step in the whole pipeline: composing the single Deep Research
prompt for a chapter, providing the English follow-up raw markdown export prompt, and
defining where its result lands. Routed to by `/pandora next` when a chapter has
no research note. Pairs with `pandora-author` (which writes prose only after the
note exists).

## Mission constraint (dual payload)

The Pandora Code is **not a wiki**. Every chapter ships two payloads - a Pandora
payload and a real-world STEM payload. So every DR prompt must cover **both
sides**: Pandora canon AND the Earth-science literature behind the chapter's STEM
concept. A prompt that only asks about Avatar canon is incomplete and must be
rewritten. See `references/deep-research-prompt-template.md`.

## The per-chapter loop

```
/pandora next resolves chapter {slug} with no research/{slug}.md
  → this skill composes the single Deep Research prompt
  → write it to research/{slug}.prompt.md   (tracked in git)
  → print instructions:
      1. Copy the full content of research/{slug}.prompt.md and run it in Gemini Deep Research
      2. When Deep Research completes, send this follow-up prompt in the same Gemini chat:
         "Please provide the complete research report as raw Markdown inside a single codeblock, preserving all LaTeX formulas ($...$, $$...$$) and reference links with full URLs. Do not include any conversational preamble, intro text, or outro."
      3. Copy the raw markdown codeblock and paste into research/{slug}.md
      4. Run `/pandora next` again
  → STOP   ← the only manual step in the pipeline
```

`research/{slug}.md` is git-ignored (raw research stays local);
`research/{slug}.prompt.md` is tracked (the prompts are reproducible + reviewable).
Paths are per-chapter, keyed by slug - NOT a shared dated folder.

## Hard Rules

1. **Single prompt per file.** `research/{slug}.prompt.md` MUST contain ONLY the
   single Deep Research prompt itself (clean and ready to copy entirely). Do NOT
   write multi-step headings or export prompts into `*.prompt.md`.
2. **The user runs the prompts.** This skill never calls Gemini APIs. The user
   pastes the prompt into the Gemini Deep Research UI.
3. **Always supply the English export prompt in user instructions.** Gemini's default
   UI renders formatted rich text. Instruct the user to send the English follow-up
   prompt requesting the entire report in a raw Markdown codeblock with intact
   LaTeX syntax and reference URLs.
4. **Hard error if the note is missing.** Writing a chapter without
   `research/{slug}.md` is forbidden - `/pandora` blocks it. Never substitute
   model memory for the note; never invent canon.
5. **Save the result verbatim.** The user pastes raw output codeblock into
   `research/{slug}.md`. Don't trim or pre-summarize it - the author filters at read time.
6. **The result is a library, not a draft.** DR returns sprawling material, much
   out of scope. The author filters aggressively (`pandora-author/references/
   research-workflow.md`). Force-fitting it into prose is the failure mode this
   whole loop exists to prevent.
7. **Rate sources before claims are imported.** Canon vs community vs scientific
   governs how a claim may be used. See `references/source-credibility-rubric.md`.

## References

| Intent                                      | Reference                                     |
| ------------------------------------------- | --------------------------------------------- |
| Compose a chapter's DR prompt + export step | `references/deep-research-prompt-template.md` |
| Define how the pasted result is structured  | `references/research-notes-format.md`         |
| Tier a source (canon / community / science) | `references/source-credibility-rubric.md`     |

## Anti-patterns

- Embedding multiple steps, meta-instructions, or follow-up prompts inside `research/{slug}.prompt.md`.
- Omitting the English follow-up export prompt from user instructions (causing rich-text copy errors).
- Composing the prompt and the chapter outline in the same response (the prompt
  is the stop; outlining happens after the result is pasted).
- Importing fan-wiki claims as canon without re-tiering.
- Citing Gemini's synthesis paragraph instead of the sources it points to.
