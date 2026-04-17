---
phase: 3
slug: mobile-polish
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (see `apps/tauri-todo/vitest.config.ts`) |
| **Config file** | `apps/tauri-todo/vitest.config.ts` |
| **Quick run command** | `pnpm --filter tauri-todo test -- --run` |
| **Full suite command** | `pnpm --filter tauri-todo test -- --run && pnpm --filter tauri-todo lint && pnpm --filter tauri-todo typecheck` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm --filter tauri-todo test -- --run`
- **After every plan wave:** Run full suite command
- **Before `/gsd-verify-work`:** Full suite must be green + on-device smoke (D-19)
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-00-01 | 00 | 0 | UX-01/04 | — | N/A | unit | `pnpm --filter tauri-todo test -- --run src/lint/capabilities.test.ts` | ❌ W0 | ⬜ pending |
| 3-00-02 | 00 | 0 | UX-01 | — | N/A | unit | `pnpm --filter tauri-todo test -- --run src/components/todo-input.test.tsx` | ❌ W0 | ⬜ pending |
| 3-00-03 | 00 | 0 | UX-01 | — | N/A | unit | `pnpm --filter tauri-todo test -- --run src/components/todo-item.test.tsx` | ❌ W0 | ⬜ pending |
| 3-00-04 | 00 | 0 | UX-01 | — | N/A | unit | `pnpm --filter tauri-todo test -- --run src/components/todo-app.test.tsx` | ❌ W0 | ⬜ pending |
| 3-00-05 | 00 | 0 | UX-02 | — | N/A | unit | `pnpm --filter tauri-todo test -- --run src/lint/no-hover.test.ts` | ❌ W0 | ⬜ pending |
| 3-00-06 | 00 | 0 | UX-03 | — | N/A | unit | `pnpm --filter tauri-todo test -- --run src/lint/no-ui-package.test.ts` | ❌ W0 | ⬜ pending |
| 3-00-07 | 00 | 0 | UX-04 | — | N/A | unit | `pnpm --filter tauri-todo test -- --run src/lib/haptics.test.ts` | ❌ W0 | ⬜ pending |
| 3-00-08 | 00 | 0 | UX-04 | — | Silent failure in web/desktop runtime | unit | `pnpm --filter tauri-todo test -- --run src/lib/runtime.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `apps/tauri-todo/src/lint/capabilities.test.ts` — assert `mobile.json` contains `haptics:allow-impact-feedback`, `haptics:allow-notification-feedback`, `haptics:allow-selection-feedback`
- [ ] `apps/tauri-todo/src/lint/no-hover.test.ts` — grep guard: no `hover:` class in `apps/tauri-todo/src/**/*.tsx`
- [ ] `apps/tauri-todo/src/lint/no-ui-package.test.ts` — grep guard: no `@monorepo-template/ui` import in `apps/tauri-todo/src/**/*`
- [ ] `apps/tauri-todo/src/components/todo-input.test.tsx` — assert rendered input and Add button have `h-11` class
- [ ] `apps/tauri-todo/src/components/todo-item.test.tsx` — assert toggle (`w-11 h-11`) and delete (`w-11 h-11`) classes
- [ ] `apps/tauri-todo/src/components/todo-app.test.tsx` — assert `<main>` className contains safe-area padding token (`env(safe-area-inset-top)`)
- [ ] `apps/tauri-todo/src/lib/haptics.test.ts` — mock `@tauri-apps/plugin-haptics`, assert `hapticAdd` → `impactFeedback('medium')`, `hapticToggle` → `selectionFeedback()`, `hapticDelete` → `notificationFeedback('warning')`, and rejections are swallowed
- [ ] `apps/tauri-todo/src/lib/runtime.test.ts` — assert `isTauriRuntime()` returns `false` when `window.__TAURI_INTERNALS__` absent, `true` when present

*Framework already installed; fixtures already live in `apps/tauri-todo/src/test/`. No framework install needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Haptic pulse on add (medium impact) | UX-04 | Vibration hardware — no programmatic way to observe on real device | Run `pnpm --filter tauri-todo tauri android dev` on physical Android device (per D-19/D-29); add a todo; confirm a single medium pulse fires |
| Haptic pulse on toggle (selection) | UX-04 | Same | Toggle a todo complete/incomplete on device; confirm a light selection pulse fires on each transition |
| Haptic pulse on delete (warning) | UX-04 | Same | Delete a todo on device; confirm the multi-pulse warning pattern fires |
| Safe-area padding avoids status/nav bars | UX-01 spirit | Physical device only — emulators don't render system UI identically | Launch on device; confirm title clears status bar and last row clears gesture/nav bar |
| 44px touch targets feel comfortable | UX-01 | Physical finger press — not verifiable in unit tests beyond class presence | Launch on device; tap each control (input, add, toggle, delete); none should require precise aim |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
