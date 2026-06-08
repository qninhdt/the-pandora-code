# STYLE BIBLE — The Pandora Code

> Single source of truth for the visual language of every generated figure.
> This block is prepended verbatim to every image prompt. The same hex palette
> is the canonical UI palette (mirrored in `apps/web/lib/design-tokens.ts` and
> `apps/web/app/globals.css`) so figures and interface read as one world.
>
> Do not fork the palette. Change it here, then mirror it in the design tokens.

## Medium

Original speculative-biology painterly illustration. Hand-painted naturalist
plate energy — think a xenobiologist's field illustration of a real alien moon.

NOT a film still. NOT a photograph. NOT a 3D render or game cinematic. NOT
vector/flat-design. NOT concept-art splash with lens flares. Painterly, textured,
observed-from-life confidence.

## Palette (fixed hex — canonical)

Cool Pandora base (dominant, ~80% of every frame):

- Void indigo (deepest shadow / background): `#070912`
- Deep teal-indigo (mid shadow): `#0e1320`
- Ocean teal (core mid-tone): `#143b46`
- Pandora cyan (primary bioluminescent key): `#36c5d9`
- Living teal (secondary glow / flora): `#2bd4a8`

Controlled warm accent (sparingly, ~10–15%, for focus and life):

- Biolum magenta (rare creatures / spores / signal): `#ff5da8`
- Ember amber (warm interior light / unobtanium heat): `#ffb454`

Neutrals:

- Mist (highlight on haze): `#e8ecf5`
- Stone (desaturated structure): `#8a93a8`

Rule: cool dominates, warm accents are deliberate and scarce. A frame where warm
competes with cool for area is off-model. Warm marks the subject the eye should
find first.

## Lighting

- Bioluminescent key light: the brightest light sources are alive (glowing flora,
  fauna, spores, fungal networks), not the sun. Light emanates from within the
  scene's organisms.
- Deep ambient shadow: rich, never muddy — shadows carry indigo and teal, not
  black.
- Volumetric haze: atmospheric depth, god-rays through canopy/spore-fog, layered
  distance. Haze is part of the identity.
- High dynamic range between the glow and the dark; bloom kept subtle (painterly,
  not neon UI glow).

## Composition

- Confident focal hierarchy: one clear subject, supporting depth layers.
- Naturalist framing — the scene observed, not staged for drama.
- Generous negative space of haze and shadow; let the bioluminescence breathe.

## Global exclusions (negative — applies to every figure)

- NO text, letters, numbers, captions, labels, watermarks, or signatures in the image.
- NO Avatar (film) branding, logos, title treatments, or poster framing.
- NO UI chrome, frames, borders, or HUD elements.
- NO photographic or 3D-render look; no lens flares, no CGI plastic sheen.
- NO modern Earth objects unless the chapter explicitly calls for human/RDA tech.

## Consistency mechanism

- One approved **style anchor** image (a Pandora establishing shot) is fed as a
  reference to later figures so palette, light, and medium stay locked.
- One **character sheet** per recurring creature is fed as a reference so the
  same creature reads as the same creature across figures.
- The seed / response id of each figure is persisted in its JSON so a figure can
  be regenerated reproducibly.
