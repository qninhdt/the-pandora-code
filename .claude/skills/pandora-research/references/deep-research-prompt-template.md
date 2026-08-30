# Deep Research Prompt Template

The structure and rules for per-chapter Gemini Deep Research prompt files, written to
`research/{slug}.prompt.md`.

## Key Rule

`research/{slug}.prompt.md` contains **ONLY the single Deep Research prompt itself**.
It is designed so the user can open the file, select all / copy the entire content,
and paste it directly into Gemini Deep Research. Do NOT include multi-step wrappers,
Step 1/Step 2 headings, or follow-up export prompts inside `*.prompt.md`.

The follow-up export prompt is provided to the user in the CLI output when `/pandora`
stops for manual research.

---

## Template for `research/{slug}.prompt.md`

```markdown
# Deep Research - {Chapter Title} ({slug})

## Goal

This chapter teaches **two payloads at once**:

- **Pandora payload:** {what official Avatar material and narrative beats establish about this topic, the specific question or mystery being investigated, and the world-building significance}.
- **STEM payload:** {the real-world Earth science principle: physics, chemistry, biology, geology, planetology, etc. Explain the exact mechanisms, quantitative relationships, and what verifiable concepts the reader carries away}.

Research must cover BOTH sides thoroughly and keep them separable. Breadth is welcome - the author will filter aggressively.

## Part A - Pandora canon

What official Avatar material establishes about {topic}. Be specific and cite sources; distinguish official canon (films, official books, Pandorapedia) from fan-wiki / community claims:

1. {Specific canonical fact / mechanism 1}
2. {Specific canonical fact / mechanism 2}
3. {Where canon is silent or contradictory — list known gaps}

## Part B - Earth-science literature ({STEM topic})

The real science, explained from credible/primary sources, at a level a curious non-specialist can follow:

1. {Core governing mechanism / physical principles}
2. {Governing formulas / quantitative parameters / scaling laws using LaTeX math notation}
3. {Key empirical experiments, observations, real-world Earth or Solar System analogues}
4. {Where the science is settled vs active open questions}
5. {Effective analogies connecting the Earth science back to the Pandoran phenomenon}

## Output requirements

- Cite sources inline; prefer primary/credible science sources and official Avatar material over summaries or fan wikis.
- Keep Part A (canon) and Part B (science) clearly separated.
- Mark each canon claim as official vs community inference.
- Include equations with LaTeX notation (`$...$`, `$$...$$`) and quantitative figures where helpful.
- Flag uncertainties and common pop-sci misconceptions.
```

---

## English Follow-up Raw Markdown Export Prompt

When `/pandora` prints instructions and stops for the user, it provides this English follow-up prompt to be pasted into the same Gemini chat once Deep Research finishes:

> "Please provide the complete research report as raw Markdown inside a single codeblock, preserving all LaTeX formulas ($...$, $$...$$) and reference links with full URLs. Do not include any conversational preamble, intro text, or outro."

This guarantees Gemini exports the entire report into a clean Markdown codeblock with equations and URLs intact, ready to be saved into `research/{slug}.md`.

## After Composing

1. Write the clean Deep Research prompt to `research/{slug}.prompt.md` (tracked in git).
2. Print the instructions (including the English follow-up export prompt) and STOP.
