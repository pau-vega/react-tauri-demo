# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-04-17
**Phases:** 3 | **Plans:** 13 | **Tasks:** 23

### What Was Built

- Tauri v2 + React 19 Android app at `apps/tauri-todo`, installable on-device via `tauri android dev`, fully wired into the pnpm workspace and Turbo task graph (Phase 1).
- Full todo CRUD with `@tauri-apps/plugin-store` persistence — StrictMode-safe discriminated-union state in `useTodos`, four presentational components, cold-restart persistence verified on Pixel 8a (Phase 2).
- Mobile-native UX: 44px touch targets, safe-area insets, zero hover states, standalone Tailwind, `@tauri-apps/plugin-haptics` 2.3.2 with mobile-only target-cfg guard (Phase 3).
- 14 test files / 71 tests green, 19/19 requirements traced through VERIFICATION.md, milestone audit passed.

### What Worked

- **Test-first in Phase 3 (Nyquist).** Wave 0 landed failing contract tests for every UX-0x must-have before any implementation shipped. Plans 02-04 then implemented against a known-red baseline. No late-stage regression surprises during on-device UAT.
- **On-device verification as explicit plan checkpoints** (01-04, 02-03, 03-05). Treating device sign-off as its own plan — not a postscript — caught the D-13 haptic perceptibility issue where it was cheap to accept as an override, not as a defect after ship.
- **Standalone styling decision held.** Raw Tailwind in `apps/tauri-todo` kept the experiment insulated from `@monorepo-template/ui` evolution; re-verified in Phase 3 via FS-grep lint.
- **Discriminated-union state in `useTodos`.** Following the project's TS conventions (no bag-of-optionals) prevented the "loading with data" and "error with data" impossible states that cause subtle UI bugs.
- **Three-source audit before close.** VERIFICATION.md + SUMMARY frontmatter + integration check caught the cosmetic REQUIREMENTS.md traceability drift before milestone close instead of after.

### What Was Inefficient

- **SUMMARY.md `requirements-completed` frontmatter was empty for Phase 1 and Phase 3 plans** (9 of 13 summaries). Not load-bearing (evidence lives in VERIFICATION.md), but the milestone audit had to lean harder on VERIFICATION.md cross-references than necessary. Enforce frontmatter population at plan close in v2.
- **REQUIREMENTS.md traceability table drifted from `Pending` to `Satisfied` only at audit time**, not at the moment each phase closed. Flipping the checkbox should be part of `/gsd-verify-work`, not a one-shot retroactive sweep.
- **D-13 haptic override discovered at on-device UAT, not at plan time.** The `impactFeedback`/`selectionFeedback` iOS-tuning is documented in the plugin docs — could have been surfaced during Phase 3 research rather than as a UAT finding. Cost: minimal (accepted), but a lesson for mobile hardware-dependent features.
- **MILESTONES.md accomplishments auto-extraction pulled broken one-liners** (three "One-liner:" entries from summaries whose bold line was a parenthetical, not a headline). Required manual rewrite at milestone close. Convention: first bold after H1 in SUMMARY.md should always be the headline one-liner.

### Patterns Established

- **Nyquist failing-tests-first wave (Wave 0).** Plan 03-01 pattern: before any implementation, land failing contract tests that encode every must-have requirement. Plans that follow implement against red baselines. Proven high-signal.
- **On-device checkpoint as a standalone plan** (N-last in a mobile phase). Verifies feel/perceptibility/timing that unit tests and simulators cannot cover. Surface device-dependent constraints as overrides, not as defects.
- **Runtime guard + JS wrapper for Tauri plugins.** `isTauriRuntime` predicate + `src/lib/haptics.ts` wrappers decouple component code from plugin availability; survives web preview, tests, and production.
- **`save()` returns boolean; haptics gate on save success.** Fire-and-forget post-persistence pattern that prevents user-perceived "confirmation" for writes that didn't actually land.
- **`target-cfg = ["mobile"]` for platform plugins.** Keeps desktop builds green without stub shims.

### Key Lessons

1. **Device UAT is cheap insurance for hardware-dependent features.** Impact-feedback waveforms, safe-area insets, 44px tap feel, cold-restart persistence — none of these are catchable without a real device in hand. Treat the on-device checkpoint as non-negotiable for mobile phases.
2. **Gate haptics on explicit success signals.** Reading plugin docs carefully matters: "no standards or requirements for vibration support on Android" means `impactFeedback` can silently no-op. Gate on perceptible success in UAT, not on `.success === true` from the plugin.
3. **Requirement traceability should update at plan close, not at milestone close.** Retroactive sweeps mask drift. Bake `[ ] → [x]` flips into `/gsd-verify-work`.
4. **SUMMARY.md headline format is load-bearing.** The milestone archiver extracts the first bold line after H1; if that's a parenthetical or a section header, the accomplishments list breaks. Headline sentence, bold, immediately after H1 — nothing else.
5. **Discriminated unions scale to persistence state.** `useTodos` stayed readable across load/save/error flows precisely because impossible states couldn't be represented. Reuse this shape for next async-IO feature (Auth? Sync?).

### Cost Observations

- **Timeline:** 3 days calendar time (2026-04-15 → 2026-04-17), ~3 working days.
- **Commits:** 123 total (18 feat commits), atomic per-task discipline held via `gsd-tools commit`.
- **Model mix:** unknown (not instrumented this milestone).
- **Sessions:** unknown (not instrumented this milestone).
- **Notable:** Nyquist Wave 0 in Phase 3 appeared expensive upfront (one plan, 71 tests to write before any feature code) but paid back during on-device UAT — zero implementation regressions, only the D-13 hardware-dependent override.

---

## Cross-Milestone Trends

*Add rows here as future milestones ship.*

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | — | 3 | Baseline: Nyquist failing-tests-first in Phase 3, on-device checkpoints as standalone plans |

### Cumulative Quality

| Milestone | Tests | Requirements Passed | Zero-Dep Additions |
|-----------|-------|--------------------|--------------------|
| v1.0 | 71 / 71 | 19 / 19 | 2 (plugin-store, plugin-haptics — both Tauri-official) |

### Top Lessons (Verified Across Milestones)

*Lessons promote here once validated by a second milestone.*
