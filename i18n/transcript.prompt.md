# Pandora Chapter Transcript Contract

Open and read `.claude/skills/pandora-transcript/SKILL.md` in the current task
before adapting any chapter. That step is mandatory; a run that only reads the
skeleton and this contract is incomplete. The skill owns editorial decisions
and the solo-narrator podcast standard. This file owns the Pandora repository's
input mapping, JSON schema, speech normalization, and machine-validation
contract.

## Inputs and output

- Source edition: `content/chapters/<slug>/<locale>.mdx`.
- Metadata: `content/chapters/<slug>/meta.yaml`.
- Deterministic input: the skeleton emitted by
  `scripts/gen-transcript-skeleton.mjs`.
- Output: `content/chapters/<slug>/<locale>.transcript.json`.
- Supported locales: `en` and `vi`.

Build one locale at a time from its own MDX. Treat the skeleton as a structural
inventory, not narration ready for direct copying.

## Mandatory editorial transformation and no-summarization rule

The transcript is a full-length, unabridged spoken rendition of the chapter for a solo-narrator podcast.

### Absolute invariant: Never summarize or condense (Tuyệt đối không tóm tắt)
- **Full explanatory depth:** Every single paragraph, explanation, numerical calculation, proof, and nuance in the MDX source MUST be fully narrated.
- **Word count parity:** The transcript word count must match the source chapter volume (~1.0x in English, ~1.2x to 1.5x in Vietnamese due to spoken syllable expansion). Never condense multiple paragraphs into a brief 1-2 sentence summary.
- **Full coverage:** Do not drop arguments, analogies, caveats, or transitions. The podcast listener receives the full depth of the chapter, not an executive summary.

### What spoken adaptation means:
1. Recompose sentence structure for smooth speech: split sentences longer than 45 words into natural breath units.
2. Fully expand all numbers, decimals, ranges, formulas, and units into natural spoken words (e.g. `bốn phẩy ba bảy`, `four point three seven`, `twenty-six-hour`).
3. Remove all Markdown formatting, JSX tags, em-dashes, and visual layout references (`above`, `below`, `[Figure 1]`).
4. Ensure conversational transitions sound natural when spoken aloud by a single host.

Do not chase novel wording at the expense of scientific precision. Do not add host banter, fictional reactions, unsupported analogies, hype, or generic podcast filler.

## Structural invariants

1. Emit exactly one transcript section for every skeleton section, preserving
   its `id`, order, and source boundary.
2. Keep `sec-00` as the introduction. Keep later ids sequential.
3. Preserve every skeleton figure as a `figure` block with the same `figNo`.
4. Keep each output section non-empty after optional widget omission.
5. Preserve `chapter`, `locale`, source filename, and source SHA verbatim from
   the skeleton.
6. Use only `p`, `figure`, `data`, and `note` output block types.
7. Emit valid JSON. Every spoken `text` value must be one string without
   Markdown, JSX, HTML, line breaks, stage directions, or production notes.

Do not preserve paragraph boundaries mechanically. Merge adjacent prose blocks
or split dense prose into multiple `p` blocks when the skill's fidelity ledger
and audio arc remain intact.

## Block mapping

### Prose

- Use prose as the factual and narrative spine.
- Rebuild the delivery around the section's meaning inventory and audio arc.
- Preserve material content without preserving ordinary source sentence
  construction or one output block per source paragraph.
- Remove formatting syntax only as part of the rewrite; cleanup by itself is
  never a completed prose adaptation.
- Resolve references that depend on screen position, typography, or nearby
  visual layout.
- Integrate a lone subheading into the surrounding narration when useful. Do
  not invent content to justify it.
- Use locale-natural spoken syntax, explicit logical connections, varied breath
  length, and transitions earned by the argument.

### Figures

- Retain the source `figNo` in metadata.
- Narrate the observation, spatial relationship, process, or contrast needed by
  an audio-only listener.
- Draw only from the figure caption, labels, label notes, alt text, and the
  surrounding section's source-backed explanation.
- Prefer the caption; use labels and notes only when they add material meaning.
- Do not speak a figure number or prefix text with a figure tag.
- Do not mention source paths, asset tiers, coordinates, colors without
  semantic importance, or page position.

### Notes

- Map `callout`, `whatthismeans`, and `scientificnote` to `note` blocks with the
  same `kind`. Integrate the title as a natural lead only when it aids context.
- Keep quotation wording faithful after speech cleanup and preserve its
  attribution. Never turn paraphrase into quotation.
- For `openquestions`, preserve every question. Compress answers only when all
  qualifications and the key conclusion survive.
- For `confidence`, preserve every nonzero classification and its percentage.
  Keep the distinction among canon, inference, speculation, and real science.
- Do not introduce a repetitive verbal label before every note.

### Data

- Map comparisons to a spoken contrast that preserves both sides and their
  relationship.
- Map stat grids and data comparisons to the few values required to understand
  the pattern or scale. Preserve any additional value that carries a distinct
  material claim.
- Map timelines to chronological narration while preserving event order and
  uncertainty.
- Map charts to axes, variables, trend, threshold, or comparison. Do not read
  data points sequentially.
- Derive interpretation only from strings inside the data block and the
  surrounding source prose that explains the same data.

### Widgets

- Emit one audio-native block only when the interaction contains an insight not
  already available in the surrounding narration.
- State what changing the input demonstrates, not how to operate the control.
- Omit redundant widgets and repair any neighboring sentence that depended on
  clicking, dragging, hovering, or seeing the interface.

## Titles

- Set the top-level `title` from the skeleton's `expectedTitle`, preserving its
  wording after speech normalization. The TTS pipeline speaks this title first.
- Set the `sec-00` section title to `null`.
- Set every later section title from the matching heading after speech cleanup.
- Treat section titles as player navigation metadata. The TTS pipeline does not
  automatically speak them. Orient the first block when the transition would
  otherwise be unclear, but do not recite headings mechanically.

## Speech normalization

Write the pronunciation form directly into every spoken field.

- Convert decimals digit by digit after the decimal separator.
- Express numeric ranges with locale-appropriate words rather than punctuation.
- Express fractions, exponents, inequalities, multiplication, approximation,
  percentages, and temperatures in words.
- Expand a unit or ambiguous abbreviation on first meaningful use. Keep later
  forms short only when TTS pronunciation is reliable.
- Render chemical formulas in the form a natural narrator would say in the
  active locale. Preserve scientific identity.
- Keep ordinary integers and years as digits only when the configured TTS reads
  them reliably and unambiguously.
- Preserve established English proper nouns and technical terms inside
  Vietnamese narration. Do not invent phonetic spellings.
- Replace em dashes with commas, colons, or sentence boundaries.
- Use plain quotation marks and normal punctuation.

The validator rejects these raw forms in spoken text:

- Markdown markers and links;
- JSX or HTML tags;
- subscript and superscript digits;
- percent, approximation, arrow, inequality, degree, multiplication, em-dash,
  and mathematical minus symbols;
- decimal and numeric-range forms that remain unspoken.

## JSON contract

The root object must contain:

- `chapter`: source slug;
- `locale`: `en` or `vi`;
- `title`: spoken chapter title;
- `source.file`: locale MDX filename;
- `source.sha256`: skeleton source hash;
- `sections`: ordered transcript sections.

Each section must contain:

- `id`: stable `sec-NN` id;
- `title`: `null` for `sec-00`, otherwise the cleaned heading;
- `blocks`: one or more audio-native blocks.

Each block must contain:

- `type` and `text`;
- `figNo` when `type` is `figure`;
- `kind` when `type` is `note`.

Do not add fields for speakers, sound effects, pauses, emotions, or production
cues. Prosody belongs in the wording and punctuation.

## Required checks

Before writing:

1. Compare the fidelity ledger against every completed section.
2. Confirm all source figures retain matching `figNo` metadata.
3. Confirm no output depends on page position or interaction.
4. Scan spoken fields for forbidden notation and formatting.
5. Compare every section to its source and reject sentence-for-sentence,
   paragraph-for-paragraph, or cleanup-only adaptation outside the allowed
   exact-wording exceptions.
6. Read separated sections aloud once for continuity, breath, pronunciation,
   repetitive transitions, and synthetic podcast filler.

After writing:

1. Run the transcript validator for the active locale.
2. Run pair validation after both locales exist.
3. Fix source adaptation defects without weakening validation.
4. Regenerate when source SHA changes.
