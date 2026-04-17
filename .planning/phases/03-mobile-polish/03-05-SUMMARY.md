---
phase: 03-mobile-polish
plan: 05
subsystem: testing
tags: [on-device, android, pixel-8a, haptics, safe-area, touch-target, uat]

requires:
  - phase: 03-mobile-polish
    provides: "Plans 02 (plugin install), 03 (44px + safe-area classes), 04 (runtime/haptics wrappers + save-failure gating) — all landed and automated tests green"

provides:
  - "On-device sign-off for Phase 3 polish on a Google Pixel 8a"
  - "Documented device-specific haptic perceptibility observation feeding the D-13 disposition"
  - "Confirmation that safe-area insets clear Android status bar and gesture bar on Pixel 8a"

affects: [future-mobile-phases, v2-ios-scope]

tech-stack:
  added: []
  patterns: []

key-files:
  created: []
  modified: []

key-decisions:
  - "Sign off per D-13 (accept device-dependent haptic support) even though impactFeedback(\"medium\") and selectionFeedback() produced no perceivable vibration on Pixel 8a — the plugin calls succeed and the automated contract tests verify correct invocation; phase is functionally complete"
  - "Do NOT substitute plugin calls with raw vibrate(ms) on DEFAULT_AMPLITUDE in this phase — would force a gap-closure (03.1) and break Plan 01 contract tests; parked as a future improvement if haptic feel becomes a prioritized requirement"

patterns-established:
  - "When on-device UAT reveals device-dependent behavior anticipated by a phase decision, sign off with a caveat rather than gap-closing when the code is correct per contract"

requirements-completed:
  - UX-01
  - UX-04

duration: ~10min
completed: 2026-04-17
---

# Phase 3 Plan 05: On-Device Android Verification Summary

**Signed off on Google Pixel 8a — delete haptic fires perceivably, safe-area insets clear status/gesture bars, 44px touch targets feel comfortable, zero hover on-device. Add + toggle haptic plugin calls succeed silently (below perceptibility threshold on this motor for single-pulse amp-30/amp-50 short waveforms) — accepted per D-13's device-dependent haptic disposition.**

## Performance

- **Duration:** ~10 min (on-device build + 9-step UAT)
- **Completed:** 2026-04-17
- **Device:** Google Pixel 8a (Android, physical hardware, USB)

## Verification Step Results

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | Haptic — add (medium impact) | FAIL-as-anticipated | `impactFeedback("medium")` reached plugin and invoke resolved; no perceivable vibration. Root-caused to plugin's iOS-tuned waveform (43ms @ amplitude 50/255, single pulse) falling below Pixel 8a's perceptibility threshold for short low-amplitude single-pulse effects. Accepted per D-13. |
| 2 | Haptic — toggle (selection) | FAIL-as-anticipated | `selectionFeedback()` reached plugin; no perceivable vibration. Plugin pattern is 50ms @ amplitude 30/255 — even weaker than impact. Accepted per D-13. |
| 3 | Haptic — delete (warning) | PASS | `notificationFeedback("warning")` produces a clearly perceivable multi-pulse (40ms@40 + 120ms pause + 60ms@60). Red flash on × glyph fires simultaneously per UI-SPEC. |
| 4 | Haptic no-op on empty input | PASS | Add button disabled when input empty; repeated taps produce no haptic (trim guard in addTodo prevents save() from being called). |
| 5 | Safe-area top clearance | PASS | "Tauri Todo" title clears Pixel 8a status bar with visible margin; camera punch-hole has no overlap. |
| 6 | Safe-area bottom clearance | PASS | Last row of a long list clears the Android gesture navigation bar; no home-indicator-zone overlap. |
| 7 | Touch target feel | PASS | Input / Add / toggle / delete all tap comfortably with a typical thumb; no precision-aim required. 44px floor validated. |
| 8 | No-hover verification | PASS | Dragging a finger across controls produces zero visual change. Only `active:` press feedback visible on tap. |
| 9 | Cold-restart + persistence | PASS | App survives full-close + relaunch; todos persist (PERS-02 from Phase 2 still holds); haptics plugin initializes correctly on cold boot (delete still fires on first action after relaunch). |

## Root-Cause Analysis (steps 1 + 2)

Investigation into the Tauri haptics plugin Android source (`tauri-plugin-haptics-2.3.2/android/src/main/java/patterns/`) confirmed the three feedback types map to fixed `VibrationEffect.createWaveform(...)` patterns:

| Feedback | Waveform | Why delete stands out |
|----------|----------|----------------------|
| `impactFeedback("medium")` | timings=`[0,43]` amplitudes=`[0,50]` — single 43ms pulse at amp 50/255 | Short + low-amplitude single pulse — many commodity Android motors silently drop this below perceptibility |
| `selectionFeedback()` | timings=`[0,50]` amplitudes=`[0,30]` — single 50ms pulse at amp 30/255 | Even lower amplitude; designed as the subtlest of the three on iPhone's Taptic Engine |
| `notificationFeedback("warning")` | timings=`[0,40,120,60]` amplitudes=`[0,40,0,60]` — 40ms@40 + pause + 60ms@60 | Multi-pulse with a 60-amplitude peak — perceivable on virtually any vibrator motor |

The plugin's iOS-first pattern design is documented (D-13: "no standards or requirements for vibration support on Android"). Our code invokes the correct plugin functions with the correct arguments; Plan 01's contract tests (`src/lib/haptics.test.ts`) verify this and pass green.

## Unexpected Observations

- The Pixel 8a is generally considered to have a high-quality LRA vibration motor, so the add/toggle imperceptibility is a stronger-than-expected signal about the plugin's iOS-tuned waveform design. If future phases prioritize perceivable add/toggle haptics on Android, the recommended path is a gap-closure phase that replaces the plugin's semantic calls with `vibrate(durationMs)` on `VibrationEffect.DEFAULT_AMPLITUDE` — the system's best-effort amplitude — while keeping our `hapticAdd` / `hapticToggle` / `hapticDelete` wrapper names.

## Failures Requiring Follow-Up

None blocking Phase 3 completion. D-13 explicitly covers this case.

**Parked as optional future improvement (seed for post-v1 work):** replace iOS-semantic plugin calls with raw `vibrate(ms)` + `DEFAULT_AMPLITUDE` if Android haptic feel becomes a prioritized requirement. Would require a small phase revising Plan 01 contract tests + Plan 04 wrappers.

## Phase 3 Sign-Off

- All automated tests green (49/49 in `apps/tauri-todo`), typecheck clean, lint clean.
- Plans 02, 03, 04 code review completeness verified on-device for steps 3–9.
- Haptic perceivability limitation on steps 1–2 accepted per D-13.
- User response: `approved`.

---
*Phase: 03-mobile-polish*
*Completed: 2026-04-17*
