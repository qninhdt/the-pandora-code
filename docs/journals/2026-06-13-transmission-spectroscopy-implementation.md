# Technical Journal: Transmission Spectroscopy Component Implementation

- **Date:** 2026-06-13
- **Author:** Antigravity
- **Plan File:** [plan.md](file:///home/qninh/projects/pandora-code/plans/260613-1540-interactive-glossary-components/plan.md)
- **Phase File:** [phase-03-prologue-and-part-i.md](file:///home/qninh/projects/pandora-code/plans/260613-1540-interactive-glossary-components/phase-03-prologue-and-part-i.md)

## Context & Objectives
As requested by the user, we cleaned up all temporary Part VI-IX terms/visualizers and focused on completing Part I glossary terms. We implemented a brand-new custom interactive visualizer for the term `transmission-spectroscopy` (Chapter 1-3) from scratch, strictly avoiding the reuse of existing components.

## Component Design & Features
The new component is located at [transmission-spectroscopy.tsx](file:///home/qninh/projects/pandora-code/apps/web/components/glossary/interactive/transmission-spectroscopy.tsx). It models the transit spectroscopy method used to study exoplanet atmospheres:
- **Parallel Transit Animation**: Visualizes starlight propagating from a host star, filtering through a transiting exoplanet's thin atmospheric ring.
- **Rainbow Dispersion**: Uses a prism dispersion effect refracting filtered light into a glowing spectrum gradient.
- **Atmospheric Profiles**: Supports interactive switching between four atmosphere configurations:
  - **Earth-like** (N₂/O₂ with Ozone and Water Vapor absorption dips)
  - **Pandora-like** (High CO₂ with Xenon and Hydrogen Sulfide signatures)
  - **Gas Giant** (H₂/He with deep Methane and Ammonia absorption features)
  - **Lifeless** (95%+ CO₂ chemical equilibrium baseline)
- **Dynamic Absorption Chart**: Renders an interactive SVG chart mapping transmission percentages against wavelengths (300nm to 2100nm). It dynamically calculates curve values based on the selected atmosphere thickness (0% to 100%).
- **Hotspot Fingerprinting**: Users can click directly on the absorption dips to identify and highlight specific chemical compounds.

## Integration & Verification
- **Dynamic Registration**: The term was successfully registered in `registry.ts` and dynamic imports in `visualizer.tsx`.
- **Translations (i18n)**: All localized labels were added under the `viz.transmissionSpectroscopy` namespace in both the English `viz-planetary.json` and Vietnamese `viz-planetary.json` translation files.
- **Unit Testing**: Added a test case in `tests/unit/glossary-visualizer.test.tsx` to verify standard rendering and text availability. All 83 unit tests in the codebase pass.
- **Build Checks**: Verified compilation and formatting:
  - Biome formatting/linter check is clean.
  - Next.js production build (`pnpm build`) compiles successfully without any type errors or warnings.
