---
date: 2026-08-24
session: reader-offline-pwa-seo-implementation
status: implementation-handoff
plan: plans/260824-2108-reader-continuity-offline-pwa-seo-and-landing-performance/plan.md
---

# Journal: 2026-08-24 — Reader Continuity, Offline PWA, SEO, and Landing Performance Implementation

## Context

This journal records the implementation pass for the approved reader-continuity,
offline-download, PWA, technical-SEO, reading-time, and landing-performance plan.
The existing dirty worktree was preserved as the baseline; unrelated chapter,
visualizer, research, and generated-content changes were not reverted or bulk
formatted.

## What Happened

### Reader continuity and local state

- Added versioned local storage for reading locations, completion state, heading
  bookmarks, and reading preferences in `apps/web/lib/engagement/`.
- The chapter reader restores by heading when the target exists and falls back to
  an article-relative ratio when content or layout has changed.
- Continue-reading UI, progress, bookmarks, text size, line spacing, column width,
  and motion settings are localized for English and Vietnamese.
- The reader keeps the existing no-account boundary: state remains local to the
  browser and is not synchronized to a backend.

### Locale-specific reading-time estimation

- Replaced the shared `reading_time_min` metadata value with derived
  `LocalizedChapter.readingTimeMin` from visible localized MDX.
- English uses 220 words per minute; Vietnamese uses 260 whitespace syllable
  tokens per minute. Passive figures add 0.2 minutes and interactive blocks add
  0.5 minutes, with visual allowance capped at 25% of the prose baseline.
- Localized editorial overrides remain possible only with an explicit reason.
  Diagnostics include counted units, base/visual minutes, component counts, and a
  source fingerprint for auditability.
- Added parity diagnostics and `audit:reading-time`; chapter hero, cards, rows,
  totals, and structured data now consume the same derived value.

### Offline chapters and PWA

- Added a versioned offline protocol in `apps/web/lib/offline/` and the Serwist
  worker in [`apps/web/app/sw.ts`](../../apps/web/app/sw.ts).
- A selected chapter downloads its localized document, discovered core assets,
  figures, fonts, and search index into a staged cache. IndexedDB intent records
  support rollback, cancellation, update/delete races, crash recovery, and next-
  activation reconciliation before a cache is reported as ready.
- Worker responses validate same-origin/public assets, MIME, size, digest, cache
  headers, and an explicit path allowlist. RSC requests remain network-only so a
  cached route cannot masquerade as another route's payload.
- Added the localized offline library at `/:locale/offline`, hard offline chapter
  navigation, retry/cancel/update/delete controls, quota estimates, offline
  search-index fallback, bilingual offline fallback HTML, and install/update UI.
- Added the root manifest at [`apps/web/app/manifest.ts`](../../apps/web/app/manifest.ts)
  and regenerated sharp 192px, 512px, maskable, and Apple touch icons under
  `apps/web/public/icons/`. The manifest keeps one PWA identity while preserving
  the stored locale or offline locale chooser at launch.

### SEO and publication policy

- Centralized public chapter resolution around published-only routes and reused it
  for metadata, sitemap, feed, search, topic/timeline surfaces, Open Graph, and
  offline manifests. Draft chapters therefore remain out of public discovery
  surfaces.
- Added canonical URLs, reciprocal `en`/`vi` alternate links, Open Graph/Twitter
  metadata, robots rules, visible breadcrumbs, and JSON-LD for articles,
  breadcrumbs, profiles, and the website.
- Added public sitemap generation in [`apps/web/app/sitemap.ts`](../../apps/web/app/sitemap.ts).
  This implementation makes no ranking guarantee; deployed URL and validator
  checks remain release work.

### Landing performance

- Replaced the two large landing backgrounds with stripped WebP assets:
  `apps/web/public/images/pages/descent-deep.webp` and
  `apps/web/public/images/pages/cta-horizon.webp`.
- Parallax now mounts scroll subscriptions only after capability, reduced-motion,
  viewport, hardware-concurrency, and device-memory checks. Chapter hero imagery
  uses `next/image` with full-viewport sizing and priority loading.

## Verification Snapshot

| Area | Result |
|---|---|
| Unit suite | `pnpm --filter web test`: 36 files, 146 tests passed |
| Type checks | Web application and scripts type checks passed |
| Content validation | Passed; warnings remain for missing localized files listed below |
| Reading-time audit | Passed for all discovered published locale files; overrides and parity diagnostics emitted |
| Service worker bundle | Direct production `esbuild` compilation passed |
| Production build | Standard Turbopack build passed; 1,218 static pages generated with no `MISSING_MESSAGE` logs |
| Focused formatting/lint | Biome passed for the changed implementation file set |
| Whole-repository lint | Not clean: 311 existing diagnostics remain outside this focused change set |

## Remaining QA and Release Limitations

- Playwright production E2E has not been added or run for download interruption,
  quota failure, worker update, hard offline navigation, locale separation, or
  reader restoration.
- Lighthouse and scripted landing scroll traces have not been run; LCP, CLS, TBT,
  INP proxy, and frame-time budgets therefore have no measured release evidence.
- iOS Safari, macOS Safari, Android Chrome, install-icon, storage-eviction, and
  interrupted-download checks still require real devices.
- Deployed canonical, sitemap, robots, Rich Results, and Schema Markup Validator
  checks have not been run against a public HTTPS origin.
- Content validation warns that the current WIP chapters
  `4-3-the-biological-zeppelin`, `4-4-how-the-wind-traders-navigate-a-planet`,
  and `4-5-the-aerial-arms-race` do not yet have `vi.mdx`; their localized parity
  and Vietnamese offline/SEO coverage are incomplete.
- The standard Turbopack production build now passes after completing the
  visualization message catalogs: 1,218 static pages were generated and the
  build emitted no `MISSING_MESSAGE` logs. This confirms the build gate only;
  it does not replace browser, device, or deployed-origin validation above.

## Decisions and Next Steps

- Keep chapter downloads explicit and user-selected; do not precache the whole
  book or promise arbitrary lazy simulation chunks offline.
- Keep local reader state browser-scoped; accounts, backend sync, analytics-based
  pace calibration, notes, and highlights remain out of scope.
- Before release, add the missing Vietnamese chapter files or explicitly defer
  those chapters, run the planned Playwright/Lighthouse/device/deployed checks,
  and audit generated diffs against the protected dirty baseline.
- No evergreen documentation file existed under `docs/`; this timestamped journal
  is the implementation record for the plan and its release caveats.
