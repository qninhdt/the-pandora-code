# Anti-Patterns

The failure modes that make a chapter bad. Each undoes part of the mission.

## Wiki-summary
Recapping Avatar plot or cataloguing Pandora facts as the content. The chapter
becomes a fan-wiki entry with nicer prose. **Fix:** every Pandoran fact must be
in service of a reading or a science point, never an end in itself.

## Info-dump
Cramming the research note into the prose. Lists of facts, stacked concepts, no
through-line. **Fix:** see `research-workflow.md` — pull only what the chapter's
one core concept needs.

## Lecture mode
The science arrives as textbook prose — definitions, equations without scene,
"as we all know". The reader feels assigned homework. **Fix:** plain language
before the formal term; arrive at the concept through a Pandoran image.

## Concept stacking
Name-checking five concepts to seem thorough. None land. **Fix:** one concept per
chapter, taught well. Cut the rest.

## Voice drift
A chapter that doesn't sound like Bardabez — too jokey, too dry, too breathless,
or slipping into encyclopedia-voice. **Fix:** reread against `voice-guide.md`;
the opener and the close are where drift shows most.

## Canon invention
Asserting a Pandora fact not in the research note as though it were established.
**Fix:** if it's not in the note and not real Earth science, mark it inference/
speculation or cut it. See `canon-policy.md`.

## Tier inflation
Treating wiki/community claims as canon, or speculation as inference, because
it's convenient. **Fix:** a claim's tier is set by its source; never upgrade.

## Decoration figures
Figures that look nice but teach nothing. **Fix:** every figure has a narrative
purpose; if you can't state it, cut the figure.

## Dangling glossary terms
Using `<GlossaryTerm slug="…">` for a term that has no definition file. **Fix:**
the orchestrator's `check-glossary` will fail the build — define the term in
`content/glossary/`, don't remove the reference.

## Plan-artifact references
Mentioning phase numbers, finding codes, or audit labels in prose, frontmatter,
comments, or component names. **Fix:** describe the thing itself; those labels
rot and mean nothing to a reader.
