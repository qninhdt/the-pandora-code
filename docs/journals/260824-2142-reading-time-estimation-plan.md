---
date: 2026-08-24
session: reading-time-estimation-plan
---

# Journal: 2026-08-24 — Reading Time Estimation Plan

## Context

Audit found `reading_time_min` is hand-entered and shared across locales.

## What Happened

- Updated the plan to derive locale-specific `readingTimeMin` from visible MDX.
- No application code changed.
- AgentWiki publication was skipped because the user did not authorize external publication.

## Reflection

Locale-specific derivation addresses the mismatch created by one manual value serving different localized content.

## Decisions Made

| Decision | Rationale | Impact |
|----------|-----------|--------|
| Count visible MDX by locale | Reading volume differs by locale | Derive `readingTimeMin` separately for EN and VI |
| Use 220 words/min for EN and 260 syllable tokens/min for VI | Apply locale-appropriate counting units | Establish deterministic baseline rates |
| Add bounded figure and interaction allowances | Non-text elements require reader time | Prevent unbounded media penalties |
| Permit a localized override only with a required reason | Preserve an explicit exception path | Keep manual adjustments auditable |
| Add locale-parity thresholds | Surface suspicious translation-length divergence | Flag likely incomplete or mismatched localized content |

## Next Steps

- Implement and validate the planned estimator and parity checks.
