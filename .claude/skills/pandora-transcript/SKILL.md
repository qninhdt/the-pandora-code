---
name: pandora-transcript
description: Adapt a finished chapter edition (en/vi mdx) into a speech-ready transcript JSON for chapter audio. Deterministic skeleton in, audio-native text out, validated. Routed to by /pandora - not loaded directly.
triggers:
  - chapter transcript
  - audio transcript
  - transcript generation
  - chapter audio
metadata:
  type: project-skill
---

# Pandora Transcript

Turns a chapter's `{en,vi}.mdx` into `{en,vi}.transcript.json` — the exact text
a TTS voice will read, structured per section so the player can jump/skip.
Routed to by `/pandora` after both mdx editions exist and pass validation.

## What it produces

`content/chapters/{slug}/{locale}.transcript.json` — sections with stable ids
(`sec-00` intro, `sec-01`…) and four block types (`p`, `figure`, `data`,
`note`). The transcript IS the spoken text: pronunciation forms are written
directly ("bốn phẩy ba bảy", "CO hai", "phần trăm").

## Flow (one locale per run; `/pandora` runs it twice)

```
pnpm transcript:skeleton {slug} {locale} --out /tmp/{slug}-{locale}-skeleton.json
read i18n/transcript.prompt.md            # ALL transformation rules live here
adapt the skeleton section by section per that prompt
write content/chapters/{slug}/{locale}.transcript.json
```

Skeletons are temp artifacts — never commit them. The prompt file is the single
source of truth for rules; this SKILL.md only routes and frames.

## Hard Rules

1. **Never drop, merge, or reorder sections.** Ids come from the skeleton;
   EN and VI must share the same ids (the mdx editions already have section
   parity).
2. **Never invent facts.** Figure/data/widget bridge sentences may only use
   strings the skeleton block carries. No new numbers, no new claims.
3. **Follow `i18n/transcript.prompt.md` exactly** — its Speech Rules define the
   pronunciation forms and forbidden symbols the validator enforces.
4. **One locale at a time, from that locale's mdx.** VI transcript comes from
   `vi.mdx`, not from translating the EN transcript.
5. **Regenerable, never hand-patched.** If review finds defects, fix the
   prompt rules (or report a skeleton bug) and regenerate; do not edit
   transcript JSON by hand to pass a check.

## Process

1. Run the skeleton command; confirm section count == `##` headings + 1.
2. Read the transcript prompt in full before adapting.
3. Adapt section by section; run the prompt's self-check (forbidden symbols,
   figure coverage, id sequence) before writing.
4. Validate: `pnpm transcript:validate {slug}` must pass for both locales
   before reporting back to `/pandora`.
5. If validation fails, fix per the error list and re-validate; do not weaken
   the validator.

## References

| Intent                                  | Reference                      |
| --------------------------------------- | ------------------------------ |
| All adaptation + speech rules           | `i18n/transcript.prompt.md`    |
| Skeleton extractor contract             | `scripts/lib/transcript-skeleton.mjs` |
| Validator checks                        | `scripts/validate-transcript.mjs` |
