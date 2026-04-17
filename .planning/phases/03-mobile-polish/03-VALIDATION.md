---
phase: 3
slug: mobile-polish
status: passed
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-17
last_audit: 2026-04-17
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (see `apps/tauri-todo/vitest.config.ts`) |
| **Config file** | `apps/tauri-todo/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @monorepo-template/tauri-todo test -- --run` |
| **Full suite command** | `pnpm --filter @monorepo-template/tauri-todo test -- --run && pnpm --filter @monorepo-template/tauri-todo lint && pnpm --filter @monorepo-template/tauri-todo typecheck` |
| **Estimated runtime** | ~3 seconds (14 files / 71 tests) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter @monorepo-template/tauri-todo test -- --run`
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green + on-device smoke (D-19)
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-00-01 | 00 | 0 | UX-01/04 | — | N/A | unit | `pnpm --filter @monorepo-template/tauri-todo test -- --run src/lint/capabilities.test.ts` | ✅ | ✅ green |
| 3-00-02 | 00 | 0 | UX-01 | — | N/A | unit | `pnpm --filter @monorepo-template/tauri-todo test -- --run src/components/todo-input.test.tsx` | ✅ | ✅ green |
| 3-00-03 | 00 | 0 | UX-01 | — | N/A | unit | `pnpm --filter @monorepo-template/tauri-todo test -- --run src/components/todo-item.test.tsx` | ✅ | ✅ green |
| 3-00-04 | 00 | 0 | UX-01 | — | N/A | unit | `pnpm --filter @monorepo-template/tauri-todo test -- --run src/components/todo-app.test.tsx` | ✅ | ✅ green |
| 3-00-05 | 00 | 0 | UX-02 | — | N/A | unit | `pnpm --filter @monorepo-template/tauri-todo test -- --run src/lint/no-hover.test.ts` | ✅ | ✅ green |
| 3-00-06 | 00 | 0 | UX-03 | — | N/A | unit | `pnpm --filter @monorepo-template/tauri-todo test -- --run src/lint/no-ui-package.test.ts` | ✅ | ✅ green |
| 3-00-07 | 00 | 0 | UX-04 | — | N/A | unit | `pnpm --filter @monorepo-template/tauri-todo test -- --run src/lib/haptics.test.ts` | ✅ | ✅ green |
| 3-00-08 | 00 | 0 | UX-04 | — | Silent failure in web/desktop runtime | unit | `pnpm --filter @monorepo-template/tauri-todo test -- --run src/lib/runtime.test.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `apps/tauri-todo/src/lint/capabilities.test.ts` — asserts `mobile.json` contains `haptics:allow-impact-feedback`, `haptics:allow-notification-feedback`, `haptics:allow-selection-feedback`; asserts `lib.rs` registers the plugin inside a `#[cfg(mobile)]`-gated `.setup()` block; asserts `Cargo.toml` pins `tauri-plugin-haptics = "2.3.2"` under the mobile target cfg
- [x] `apps/tauri-todo/src/lint/no-hover.test.ts` — FS-grep guard: zero `hover:` utilities in non-test source files under `apps/tauri-todo/src`
- [x] `apps/tauri-todo/src/lint/no-ui-package.test.ts` — FS-grep guard: zero `@monorepo-template/ui` imports in `apps/tauri-todo/src`; `package.json` has no such dependency
- [x] `apps/tauri-todo/src/components/todo-input.test.tsx` — asserts rendered input and Add button both carry `h-11` (and not `h-10`)
- [x] `apps/tauri-todo/src/components/todo-item.test.tsx` — asserts toggle (`w-11 h-11`) in both completed/incomplete branches and delete button (`w-11 h-11`); asserts no `w-6`/`h-6`/`w-8`/`h-8`
- [x] `apps/tauri-todo/src/components/todo-app.test.tsx` — asserts `<main>` className contains both `pt-[max(2rem,env(safe-area-inset-top))]` and `pb-[max(2rem,env(safe-area-inset-bottom))]` and no `py-8`
- [x] `apps/tauri-todo/src/lib/haptics.test.ts` — mocks `@tauri-apps/plugin-haptics`; asserts `hapticAdd` → `impactFeedback("medium")`, `hapticToggle` → `selectionFeedback()`, `hapticDelete` → `notificationFeedback("warning")`; asserts off-runtime no-op and swallowed rejections (D-13)
- [x] `apps/tauri-todo/src/lib/runtime.test.ts` — asserts `isTauriRuntime()` returns `false` when `window.__TAURI_INTERNALS__` is absent, `true` when present, and flips back after delete

*Framework already installed; fixtures already live in `apps/tauri-todo/src/test/`. No framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions | On-Device Status |
|----------|-------------|------------|-------------------|------------------|
| Haptic pulse on add (medium impact) | UX-04 | Vibration hardware — no programmatic way to observe on real device | Run `pnpm --filter @monorepo-template/tauri-todo tauri android dev` on physical Android device (per D-19/D-29); add a todo; confirm a single medium pulse fires | ACCEPTED UNDER D-13 — no perceivable pulse on Pixel 8a (plugin waveform tuned for iOS); contract tests confirm `impactFeedback("medium")` IPC call fires |
| Haptic pulse on toggle (selection) | UX-04 | Same | Toggle a todo complete/incomplete on device; confirm a light selection pulse fires on each transition | ACCEPTED UNDER D-13 — no perceivable pulse on Pixel 8a; contract tests confirm `selectionFeedback()` IPC call fires |
| Haptic pulse on delete (warning) | UX-04 | Same | Delete a todo on device; confirm the multi-pulse warning pattern fires | PASS — multi-pulse warning pattern perceivable on Pixel 8a |
| Safe-area padding avoids status/nav bars | UX-01 spirit | Physical device only — emulators don't render system UI identically | Launch on device; confirm title clears status bar and last row clears gesture/nav bar | PASS — confirmed on Pixel 8a UAT |
| 44px touch targets feel comfortable | UX-01 | Physical finger press — not verifiable in unit tests beyond class presence | Launch on device; tap each control (input, add, toggle, delete); none should require precise aim | PASS — confirmed on Pixel 8a UAT |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 20s (measured at ~3s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (on-device UAT signed off 2026-04-17 by pvelasco; D-13 override accepted for add/toggle haptic perceptibility on Pixel 8a — see `03-VERIFICATION.md`)

---

## Validation Audit 2026-04-17

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |
| Wave 0 test files present | 8 / 8 |
| Full suite result | 14 files / 71 tests passed |
| Audit method | State A (existing VALIDATION.md) — cross-referenced against implemented tests after phase verification |

All eight Wave 0 test files exist on disk; the full Vitest run is green at 71/71; VERIFICATION.md records phase status `passed` (4/4 truths, 1 accepted override). No gaps to fill. Frontmatter flipped to `status: passed`, `nyquist_compliant: true`, `wave_0_complete: true` to reflect current reality.
