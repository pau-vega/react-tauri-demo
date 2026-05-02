# Phase 3: Mobile Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 03-mobile-polish
**Areas discussed:** Touch target strategy, Haptic vocabulary, Haptic scope, Polish scope

---

## Area Selection

**Question:** Which gray areas do you want to discuss for Phase 3 Mobile Polish? (UX-02 'no hover' and UX-03 'standalone Tailwind' are already satisfied from Phase 2. The real work is UX-01 touch targets and UX-04 haptics.)

| Option | Description | Selected |
|--------|-------------|----------|
| Touch target strategy | Grow visible controls vs invisible hit area vs hybrid. | ✓ |
| Haptic vocabulary | Which `@tauri-apps/plugin-haptics` API + whether add and delete feel different. | ✓ |
| Haptic scope | Strict to requirements (add/delete only) vs also cover toggle-complete. | ✓ |
| Polish scope beyond reqs | Minimum vs + safe-area insets vs broader visual refresh. | ✓ |

**User's choice:** All four — multiSelect.

---

## Touch Target Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Grow visible controls | Checkbox 24→44px, delete 32→44px, input/Add 40→44px. Biggest visual change, easiest to reason about. | ✓ |
| Keep small visuals, invisible 44px hit area | Visible sizes stay, wrap in pressable 44px container. More compact look. | |
| Hybrid: grow buttons, expand toggle hit area | Buttons grow to 44px; toggle stays 24px inside 44px wrapper. | |

**User's choice:** Grow visible controls (recommended).
**Notes:** All interactive controls become 44px visually — hit area = visible control, no hidden padding tricks.

---

## Haptic Vocabulary

| Option | Description | Selected |
|--------|-------------|----------|
| Different: Medium impact on add, Warning notification on delete | `impactFeedback('medium')` + `notificationFeedback('warning')`. Semantic difference between creation and destruction. Two capabilities. | ✓ |
| Same: Light impact for both | `impactFeedback('light')` for both. One capability. No destructive signal. | |
| Different: Light impact on add, Heavy impact on delete | Both calls use `impactFeedback`, intensity carries meaning. One capability. | |
| Raw vibrate with different durations | `vibrate(10)` / `vibrate(40)`. Works even when semantic APIs are flaky on Android. One capability. | |

**User's choice:** Different — Medium impact on add, Warning notification on delete (recommended).
**Notes:** Users should feel a semantic difference between adding something and destroying something, not just a generic vibration.

---

## Haptic Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Add `selectionFeedback` on toggle | Toggle complete → `selectionFeedback()`. Adds third haptic capability. Consistent feedback on all three primary interactions. | ✓ |
| Stay strict — no haptic on toggle | Add/delete only per UX-04. Toggle silent. Minimal capability surface. | |
| Light impact on toggle | Toggle → `impactFeedback('light')`. Reuses already-allowed impact capability, differentiated by intensity. | |

**User's choice:** Add `selectionFeedback` on toggle (recommended).
**Notes:** Extends beyond UX-04 strict scope so the three primary interactions feel consistent; selectionFeedback is the plugin's semantically-correct call for a binary state change.

---

## Polish Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Minimum: touch + haptics only, visuals untouched | Only the required work. Fastest, lowest risk. | |
| Minimum + safe-area insets | Required work + `env(safe-area-inset-*)` padding so content clears status bar / gesture bar. Completes what Phase 1 `viewport-fit=cover` set up. | ✓ |
| Broader refresh | Safe-area + typography bump, larger rounded corners, press-scale animation, row shadow. | |
| Broader refresh + loading/empty state polish | Option 3 plus spinner and empty-state layout refresh. Largest scope. | |

**User's choice:** Minimum + safe-area insets (recommended).
**Notes:** Safe-area insets are the one high-impact polish item that changes nothing visually except preventing content from hiding behind system UI. Broader refresh deferred.

---

## Claude's Discretion

- Exact Tailwind arbitrary-value expression for safe-area inset fallback padding.
- Location of the haptic wrapper (`use-todos.ts` inline vs `src/lib/haptics.ts` module vs per-component).
- Visual scale of inner `×` and checkmark glyphs after containers grow to 44px.
- Shape of haptics wrapper API (three named functions vs one discriminated-union function).

## Deferred Ideas

- Visual refresh (typography, rounded corners, press-scale, row shadow) — revisit only if testing reveals the app still feels web-y.
- Loading/empty/error state cosmetic polish.
- Dark mode (still deferred from Phase 1 D-27).
- Swipe-to-delete, inline editing, categories — v2 scope.
- iOS install work — v2 scope (capability file stays iOS-ready).
- Haptic on validation failure — not needed, UI prevents invalid submit.
