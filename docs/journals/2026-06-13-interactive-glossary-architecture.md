# Technical Journal: Interactive Glossary Components Architecture
**Date:** 2026-06-13
**Author:** Antigravity

## Summary
Successfully implemented and verified **Phase 2: Architecture & Infrastructure** for the Interactive Glossary Components feature. Established a robust dynamic loading pattern for client-side visualizers, created the common layout frame, integrated the visualizers into the glossary term detail page, and built an automated stub generation script.

## Key Changes & Implementations
1. **Shared Layout Frame** ([frame.tsx](file:///home/qninh/projects/pandora-code/apps/web/components/glossary/interactive/shared/frame.tsx)):
   - Developed `GlossaryFrame` featuring frosted glass styling matching the Codex theme.
   - Built a dynamic mounting guard (`isMounted` state) that displays a loading skeleton, preventing React server-client hydration mismatches.
   - Provided unified helper buttons (optional Reset and Play/Pause controls) and an Info overlay drawer for detailed conceptual descriptions.
   - Added standard touch gesture prevention (`touch-action: none` wrapper) to ensure smooth dragging on mobile without triggering page scrolls.

2. **Static-Safe Lazy Loading Architecture**:
   - Split the dynamic registry into a static ID registry ([registry.ts](file:///home/qninh/projects/pandora-code/apps/web/components/glossary/interactive/registry.ts)) and a Client Component dynamic loader wrapper ([visualizer.tsx](file:///home/qninh/projects/pandora-code/apps/web/components/glossary/interactive/visualizer.tsx)).
   - This prevents build-time compilation warnings in Next.js Server Components by keeping `next/dynamic` isolated within the Client boundary.
   - Updated the glossary term detail page ([page.tsx](file:///home/qninh/projects/pandora-code/apps/web/app/[locale]/glossary/[term]/page.tsx)) to check `GLOSSARY_VISUALIZATION_IDS` and dynamically mount the component, falling back to static cover images when unregistered.

3. **Automation Stub Generator** ([generate-glossary-stubs.ts](file:///home/qninh/projects/pandora-code/apps/web/scripts/generate-glossary-stubs.ts)):
   - Authored a Node script to generate bespoke boilerplate files using `GlossaryFrame` for new terms and automatically append them to `registry.ts` and `visualizer.tsx` simultaneously.

4. **Initial verified components**:
   - [alpha-centauri.tsx](file:///home/qninh/projects/pandora-code/apps/web/components/glossary/interactive/alpha-centauri.tsx): A fully-interactive 2D flat SVG orrery showing the three suns (A, B, Proxima) and the gas giant Polyphemus. Includes HUD details, Speed, and Zoom controls.
   - [habitable-zone.tsx](file:///home/qninh/projects/pandora-code/apps/web/components/glossary/interactive/habitable-zone.tsx) (Stub)
   - [exomoon.tsx](file:///home/qninh/projects/pandora-code/apps/web/components/glossary/interactive/exomoon.tsx) (Stub)

## Verification Results
- **Production Compilation**: `pnpm build` ran to completion with zero errors or warnings.
- **Linting & Code Quality**: Biome lint checks successfully passed across all modified/created files.
- **Unit Testing**: Verified all 17 test suites (50 unit tests) passed successfully.

## Next Steps
- Execute Phase 3: Implement Prologue and Part I custom visualizations (starting with star temperature habitable zone and orrery physics details).
