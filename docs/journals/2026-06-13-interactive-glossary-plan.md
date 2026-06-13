# Technical Journal: Interactive Glossary Components Planning
**Date:** 2026-06-13
**Author:** Antigravity

## Summary
Designed a comprehensive, multi-phase implementation plan (`plans/260613-1540-interactive-glossary-components/`) to build custom, highly interactive, and visually engaging React components ("MAY ĐO") for all 257 glossary terms across the 23 chapters of *The Pandora Code*. These components will replace or supplement static cover images on the glossary detail pages (`/[locale]/glossary/[term]`), enhancing reader engagement and education.

## Key Decisions
1. **Directory Isolation**: To avoid conflicts with article components (under `apps/web/components/content`), all new visualizers will reside in `apps/web/components/glossary/interactive/`.
2. **Dynamic Importing & Code-Splitting**: A central registry (`registry.ts`) will lazy-load components using Next.js `dynamic()` with `ssr: false` to keep bundle sizes small and prevent client-server hydration mismatches.
3. **i18n Localization**: Bilingual strings (EN/VI) will be stored in standard message JSON files under `apps/web/messages/` and loaded using the `useTranslations` hook, matching current project patterns.
4. **Custom Controls**: Control overlays (sliders, resets, buttons) will be built inline inside each component to support diverse interactive mechanisms, rather than forcing a rigid unified frame overlay.
5. **Resource Performance**: Visualizers will utilize custom hooks with Intersection Observer and Page Visibility APIs to suspend active animation/canvas render loops when scrolled out of view or when the browser tab is hidden.
6. **Abstract Concepts**: Non-tangible terms (e.g. Occam's Razor, Falsifiability) will receive animated logic flow/schematic diagrams using CSS transitions and Framer Motion, keeping them premium and engaging (no simple flashcard or quiz fallbacks).

## Next Steps
- Execute Phase 2 (Architecture Setup) to establish the directory structure, dynamic imports, and custom frame wrapper.
- Sequentially implement the components starting with Prologue and Part I (59 terms).
