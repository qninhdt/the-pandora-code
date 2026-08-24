---
date: 2026-08-24
session: reader-offline-pwa-seo-planning
---

# Journal: 2026-08-24 — Reader Continuity, Offline PWA, SEO, and Landing Performance

## Context

The session turned an initial feature brainstorm into an implementation-ready plan for persistent reading state, offline chapter downloads, PWA quality, SEO hardening, and landing-page scroll performance. The existing Next.js application and its dirty worktree were treated as constraints and left untouched.

## What Happened

- Scouted the current reader, metadata, search, chapter-content, image, and routing architecture before selecting implementation boundaries.
- Split delivery into six phases: reader preferences, landing performance, published-content policy, offline engine, product integration, and release QA.
- Red-team review exposed gaps around draft leakage, offline cache consistency, concurrent worker commands, RSC isolation, multi-tab updates, localized launch behavior, offline search, and rollback.
- Incorporated measurable performance gates and failure-injection coverage instead of relying on visual inspection or optimistic cache semantics.
- Validated the plan structure and cross-phase dependencies after consolidating the review findings.
- Changed documentation only; no application code, dependencies, generated assets, or existing worktree changes were modified.

## Reflection

The main planning risk was treating PWA support as a manifest-and-service-worker task. The review showed that dependable chapter downloads require a small transactional system with versioned assets, reconciliation, explicit navigation behavior, and an operational rollback path. Separating the published-content resolver from offline generation also prevents SEO and caching rules from drifting apart.

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Store reading progress and preferences locally, with heading-first restoration and ratio fallback | Stable headings survive layout changes better than raw scroll offsets | More reliable resume behavior across fonts, images, and responsive layouts |
| Download explicit, versioned chapter manifests | Runtime crawling and broad chunk precaching are nondeterministic and too large | Predictable storage estimates, integrity checks, updates, and deletion |
| Use staged Cache Storage writes plus IndexedDB intent metadata and reconciliation | The two browser stores cannot commit atomically | Interrupted downloads recover without being reported as ready |
| Centralize published chapter selection | Draft content currently has several possible exposure paths | Sitemap, search, timeline, OG, and offline catalogs share one policy |
| Keep one root PWA identity and cache both localized landing documents | Avoid duplicate installs while preserving deterministic offline launch | Locale-aware installed experience without separate manifests |
| Optimize landing media through the existing Next.js image path and motion preference | Avoid introducing an unrelated asset-generation pipeline | Smaller scope with measurable frame-time, LCP, CLS, and TBT gates |
| Preserve the dirty worktree as the implementation baseline | Existing changes belong to the user | Future execution records checksums/status and does not stash or revert user work |

## Next Steps

- Execute the six phases in dependency order, with the published-content policy available before offline manifest generation.
- Run browser and device QA for interrupted downloads, quota pressure, worker upgrades, offline search, locale launch, and cross-DPR chapter reopening.
- Capture deployed performance evidence and ship the neutralizing service-worker rollback path with the PWA release.
- AgentWiki publishing was skipped because this task did not authorize external publication.
