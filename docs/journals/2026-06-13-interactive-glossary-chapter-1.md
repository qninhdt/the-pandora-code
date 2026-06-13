# Technical Journal: Interactive Glossary Components - Chapter 1 Implementation

- **Date:** 2026-06-13
- **Author:** Antigravity
- **Plan File:** [plan.md](file:///home/qninh/projects/pandora-code/plans/260613-1540-interactive-glossary-components/plan.md)
- **Phase File:** [phase-03-chapter-1-implementation.md](file:///home/qninh/projects/pandora-code/plans/260613-1540-interactive-glossary-components/phase-03-chapter-1-implementation.md)

## Context & Objectives
Having established the Phase 2 dynamic registry and core wrapper layout, Phase 3 implements the bespoke interactive visualizations ("MAY ĐO") for the glossary terms in Chapter 1 ("Where is Pandora" and related astrophysics/exoplanet detection topics).

The objective was to move away from static images, providing the reader with a gamified, scientifically accurate representation of orbital mechanics, stellar physics, and detection methodologies.

## Implementation Details

### 1. Tailor-Made (MAY ĐO) Components
We implemented 7 new interactive React components in `apps/web/components/glossary/interactive/`, conforming to the dark, bioluminescent, Speculative Biology visual style:
- **`habitable-zone`**: Animates a central star shifting color/size from Red Dwarf (3,000K) to Blue Giant (10,000K). The green temperate band dynamically expands and shifts, showing a fixed planet freezing, boiling, or sustaining liquid water.
- **`exomoon`**: A 4-source energy balance puzzle (starlight, planetshine, gas giant IR, tidal heating) where the reader uses sliders to achieve a stable temperate climate indicator on a moon orbiting Polyphemus.
- **`tidal-heating`**: Simulates Keplerian motion speed variations along an elliptical orbit. The closer the moon sweeps to the gas giant (periapsis), the more intense the gravitational flexing stretch (egg shape distortion) and core heating.
- **`roche-limit`**: A radius slider simulation where dragging a moon closer than its critical Roche Limit warps its physical shape, eventually shattering it into a detailed ring of orbiting particles.
- **`radial-velocity`**: Animates a host star wobbling around a barycenter due to planetary gravity. Propagating light waves dynamically shift blue-cyan when approaching the detector and red-magenta when receding, plotting a real-time velocity curve.
- **`direct-imaging`**: Demonstrates the function of a coronagraph. Toggling a central mask block slides a shield over the star's blinding glare, rendering a faint bioluminescent planet visible under optimal exposure conditions.
- **`transit-timing-variation`**: Simulates a primary transiting gas giant dragging across a star. Toggling an outer companion planet creates gravitational perturbations (TTV), shifting transit midpoints early or late in a sinusoidal wave.

### 2. Localization & Architecture Integration
- **Bilingual dictionaries**: Localized EN & VI strings for each term were added under the `viz` namespace inside `apps/web/messages/en/viz-planetary.json` and `apps/web/messages/vi/viz-planetary.json`.
- **Dynamic Registry**: Registered all visualizer IDs in `registry.ts` and dynamic loaders in `visualizer.tsx` with `ssr: false` to ensure bundle code splitting and protect against React hydration mismatches.

### 3. Verification & Validation
- **Typescript Compilation:** Verified 100% clean typechecking across the web workspace.
- **Linter & Formatting:** Conformed all newly added React code to Biome's formatting guidelines.
- **Unit Testing:** Created a new unit test suite in `tests/unit/glossary-visualizer.test.tsx` to verify component mounting and bilingual text rendering. Running `vitest` confirmed all 59 tests in the repository pass.

## Next Steps
With Chapter 1 visualizers completed, next phases will address:
1. Phase 4: Part II (Chapters 2-1 to 2-9) targeting xenobiology and biomechanics glossary visualizations.
2. E2E rendering checks inside headless browsers.
