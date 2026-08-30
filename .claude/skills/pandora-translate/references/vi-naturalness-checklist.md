# Vietnamese Naturalness Checklist

VI is the default display locale - most readers see this first. The translation
must read as if written in Vietnamese, not converted from English. Run this pass
on every `vi.mdx` before writing it.

## The post-write pass (mandatory)

1. Read each paragraph aloud as Vietnamese.
2. Flag any sentence that only parses after back-translating to English - rewrite
   it around the concept until it's natural.
3. Remove English words that have a natural VI equivalent; gloss the ones that
   genuinely stay (established science terms, canonical Pandora/Na'vi names).
4. Check the failure signals below.
5. Confirm every figure caption + callout string is translated (no English left).

## Failure signals (rewrite if present)

- **"của" cascades** - chains of "X của Y của Z". Restructure the possession.
- **Indefinite "một" overuse** - English "a/an" rendered as "một" everywhere; VI
  often drops it. Use only where number/indefiniteness is meant.
- **Literal English connectives** - calqued "tuy nhiên/hơn nữa/do đó" stacked the
  way English stacks "however/moreover/therefore". Use natural VI flow.
- **Copied adjective–noun order** - English modifier order forced onto VI. VI
  generally places modifiers after the noun.
- **Calqued idioms** - English idioms translated literally. Replace with a VI
  idiom or drop the figure of speech.
- **Mid-sentence code-switching** - dropping into English where a VI term exists.
  Only keep English for true technical/proper terms, glossed once.
- **Passive overuse** - English passive voice carried over; VI prefers active or
  agentless constructions.

## Technical & canon terms

- Established science terms VI speakers use in English (e.g. some unit names,
  acronyms) may stay English - gloss on first use.
- Canonical Pandora/Na'vi names stay as canon spells them.
- Don't force an awkward VI calque when the English term is the natural usage;
  but don't leave English where a clean VI word exists.

## Register

- Match Bardabez's voice in VI: curious, precise, unhurried, quietly warm. The VI
  should feel authored, not machine-rendered.
- Keep the classification hedges (canon/inference/speculation/real-science) -
  honesty about tiers must survive translation intact.
