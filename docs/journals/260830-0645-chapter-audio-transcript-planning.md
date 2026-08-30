# Chapter Audio Transcript — Brainstorm + Plan

Date: 2026-08-30

## Context

User wants per-chapter audio (EN+VI, section jump/skip, auto TTS). First deliverable:
transcript format + pipeline. Built on tvoiceai TTS CLI from earlier this session
(`scripts/tvoiceai-tts.mjs`, account ~2.9k tokens, 1 token/char).

## Decisions (user-confirmed)

- Audio-native transcript (rewritten for the ear), NOT verbatim reading.
- VI transcript from `vi.mdx` directly; parallel EN/VI pipelines.
- Hybrid: deterministic skeleton script + agent adapt (never agent-parses-MDX).
- `content/chapters/<slug>/{en,vi}.transcript.json`; transcript IS the spoken
  text (agent writes pronunciation forms directly — user rejected script-side
  normalizer).
- Section ids = ordinals `sec-NN` (locale-independent via existing section parity).
- GlossaryTerm unwrap-only; data components → 1-2 sentence summaries; all
  editorial notes kept; ConfidenceMeter → 1 sentence; widgets → bridge sentences.

## Key insight

`scripts/audit-section-parity.mjs` already solves MDX section-splitting + 3 JSX
shapes; `reading-time.ts` already solves MDX noise stripping. Skeleton script
ports both instead of reinventing. Word-ratio band 1.15–1.95 doubles as
transcript EN↔VI parity validation.

## Artifacts

- Brainstorm report: `plans/reports/brainstorm-260830-0632-chapter-audio-transcript.md`
- Plan (6 phases): `plans/260830-0632-chapter-audio-transcript/`
- Out of scope (follow-ups): TTS per-section synthesis, web player, backfill 45 chapters.

## Cost flag

Full-corpus TTS ≈ millions of tvoiceai tokens. Pilot 1 chapter first, then
budget decision.

## Implementation outcome (same day, cook run)

- 6/6 phases completed. Gates: smoke 47 chapters × 2 locales (min speakable
  coverage 94.7%), validator selftest 12/12, pilot validates 0 err/0 warn,
  tsc clean, tester 6/6 gates PASS, code-review SHIP-after-M1 → M1 fixed
  (propObjects line-end anchor; 8 lost compact-array objects restored corpus
  -wide) + L1–L3 polish.
- Pilot where-is-pandora: 2 agent runs (EN 42 blocks, VI 45 blocks, ~9.8k VI
  words), all 3 widgets dropped with no dangling refs, 5 prompt ambiguities
  calibrated into i18n/transcript.prompt.md (figure tag no-leading-zero both
  locales, chart trend rule, unpronounceable stats, fraction forms, p 1:1).
- TTS spot-check finding: tvoiceai ElevenLabs-clone VI voice nondeterministically
  repeats a phrase on long single-job inputs (~433 chars → 29.7s glitched vs
  24.4s clean rerun). Mitigation locked for the future chapter-TTS command:
  synthesize per block/sentence (short jobs), concat PCM with 0.35s gaps,
  duration-heuristic flag + per-block retry, parallel job pool (~3–4) since
  the API is job-based.
- Account budget after spot checks: ~132 tokens left — top-up required before
  any real synthesis.
