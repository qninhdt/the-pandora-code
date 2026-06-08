# Deep Research Prompt Template

The shape of a per-chapter Gemini Deep Research prompt. Written to
`research/{slug}.prompt.md`. The prompt MUST cover both payloads — Pandora canon
and Earth-science literature — or it's incomplete.

## Structure

```
# Deep Research — {Chapter Title} ({slug})

## Goal
One paragraph: what this chapter teaches (the Pandora reading + the real STEM
concept). State both payloads explicitly so the research covers both.

## Part A — Pandora canon
What official Avatar material establishes about {topic}. Ask specifically for:
- direct canonical facts (films, official companion material) with sources
- where canon is silent / contradictory (note the gaps)
- distinguish official canon from fan-wiki/community claims

## Part B — Earth-science literature
The real science behind the chapter's concept ({the STEM topic}). Ask for:
- the core principle(s), explained from primary/credible sources
- key experiments, mechanisms, numbers a non-specialist can grasp
- where the science is settled vs open
- analogies that connect the Earth science back to the Pandora phenomenon

## Output requirements
- Cite sources inline; prefer primary/credible sources over summaries.
- Separate canon from inference from community claim.
- Flag anything uncertain. Breadth is fine — the author will filter.
```

## Guidance

- **Be specific to this chapter.** Generic prompts return generic libraries. Name
  the exact Pandora phenomenon and the exact Earth-science concept.
- **Ask for both sides every time.** The single most common defect is a prompt
  that only asks about Avatar. Always include Part B.
- **Invite breadth, expect filtering.** The author filters aggressively, so it's
  fine for the prompt to pull more than the chapter will use — but it must pull
  the *right* areas.
- **Ask for source tiers.** Request that canon, community, and scientific sources
  be distinguished, so re-tiering at write time is easier.

## After composing

Write the full prompt to `research/{slug}.prompt.md` (tracked). Then print the
paste instructions and STOP — this is the pipeline's only manual step.
