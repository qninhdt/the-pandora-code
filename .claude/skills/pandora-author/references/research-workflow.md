# Research Workflow — filtering Deep Research output

The research note (`research/{slug}.md`) is a **library, not a draft**. Gemini
Deep Research returns large, sprawling reports, much of it out of scope for the
triggering chapter. Force-fitting all of it into prose is the single biggest
failure mode this pipeline exists to prevent.

## The discipline

1. **Read the whole note once** before writing a word — know what's there.
2. **Extract only what this chapter needs.** Pull the canon facts and the
   science the chapter's one core concept requires. Leave the rest in the library.
3. **Re-tier as you pull.** A claim's tier in the chapter is set by *its source*,
   not by how confidently the note states it. Wiki/community → inference at best.
   Cite the underlying source, not Gemini's synthesis paragraph.
4. **Note the gaps.** Where the note (and canon) is silent, that's material for
   an "open questions" beat — not a prompt to invent.

## Signs you're info-dumping (stop and cut)

- A paragraph that lists facts without a through-line.
- Three named concepts in one section, none fully landed.
- Sentences that exist because the research mentioned them, not because the
  chapter needs them.
- The reader could not say, after the section, what the one point was.

## If the note is thin or off-target

Don't paper over it with invention. Options:
- Write the chapter narrower, around what the note actually supports.
- Flag to the user (via `/pandora`) that a focused follow-up Deep Research pass
  would help, and which specific question to ask.

## If the note is missing entirely

Hard stop. The orchestrator handles this — it will not let the author run without
`research/{slug}.md`. Never substitute memory for the note.
