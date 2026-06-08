# Error Messages

Exact, copy-pasteable messages `/pandora` prints on the failure paths. Keep them
literal so the user always gets a path + a next command, never a vague error.

## Missing research (the hard stop / hard error)

`/pandora next` resolved a chapter with no `research/{slug}.md`:

```
[pandora] Chapter "{slug}" has no research note yet.

  1. Open the generated prompt:   research/{slug}.prompt.md
  2. Run it in Gemini Deep Research.
  3. Paste the full result into:  research/{slug}.md
  4. Run `/pandora next` again.

Stopping here — this is the only manual step. I will not invent Pandora canon.
```

`/pandora write {slug}` with no research note (no prompt branch — straight error):

```
[pandora] Cannot write "{slug}": research/{slug}.md is missing.
Run `/pandora next` to generate the Deep Research prompt first.
Refusing to draft without canon.
```

## Plan mode unavailable

Cannot auto-enable plan mode before writing:

```
[pandora] I need plan mode ON before reading the research note and drafting.
Enable plan mode, then run `/pandora next` (or `/pandora write {slug}`) again.
```

## Glossary check failed

`pnpm check-glossary {slug}` exited non-zero:

```
[pandora] Glossary sync failed — the chapter references undefined terms.
Add a definition file for each at content/glossary/{id}.yaml (do NOT remove the
reference), then re-run. The check output above lists every missing term + where
it is used.
```

## Image generation failed

`gen-images` failed (e.g. missing key, proxy error):

```
[pandora] Image generation failed for "{slug}". The prose + figure JSON are
written; only PNGs are missing. Fix the cause (often OPENAI_API_KEY in .env),
then re-run `pnpm gen-images --chapter {slug}` or `/pandora figure <id>`.
```

## Validate / build failed

```
[pandora] {pnpm validate:content | pnpm build} failed. The chapter is written
but not shippable yet. See the output above; fix and re-run the failing command.
Do not mark the chapter published until both are green.
```

## Unknown slug

```
[pandora] "{slug}" is not in the outline (apps/web/lib/content/outline.ts).
Did you mean: {closest matches}? Run `/pandora status` to see all slugs.
```
