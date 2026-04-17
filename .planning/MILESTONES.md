# Milestones

## v1.0 MVP (Shipped: 2026-04-17)

**Delivered:** A Tauri v2 + React todo app that builds and installs on Android as a native mobile app, with persistent local storage and mobile-native UX polish — proving the core hypothesis that Tauri v2 can ship a React app as a real Android app.

**Phases completed:** 3 phases, 13 plans, 23 tasks

**Stats:**

- Timeline: 2026-04-15 → 2026-04-17 (3 days)
- Git range: 4dad4f0 → 34fa9b1 (123 commits, 18 feat commits)
- Files: 114 changed, +18,729 / -7
- LOC (tauri-todo): ~1,286 TS/TSX + 17 Rust + Tauri config
- Tests: 14 test files, 71 tests green (Nyquist-compliant across all 3 phases)

**Key accomplishments:**

- Tauri v2 Android toolchain bootstrapped — 4 Rust cross-compilation targets installed, `gen/` gitignored, `apps/tauri-todo` registered as a pnpm workspace package with Vite + React 19 + Tailwind 4 scaffold, Android capabilities wired, `tauri android dev` launches on-device (Phase 1).
- Todo CRUD with persistent storage — `useTodos` hook with discriminated-union state and `@tauri-apps/plugin-store` (autoSave: false, explicit save), four presentational components (TodoApp, TodoInput, TodoList, TodoItem); all four TODO-0x + three PERS-0x requirements verified on-device Pixel 8a including cold-restart persistence (Phase 2).
- Mobile-native UX — 44px touch targets (h-11 / w-11 h-11) on every interactive control, safe-area inset padding on main, zero hover states, raw Tailwind (no `@monorepo-template/ui` coupling), verified on-device (Phase 3).
- Haptic feedback platform — `@tauri-apps/plugin-haptics` 2.3.2 installed on both JS and Rust with mobile-only `target-cfg` guard and three least-privilege capability permissions; delete haptic perceivable on Pixel 8a, add/toggle impact/selection accepted as below-threshold device-dependent behavior per D-13 override (Phase 3).
- Test-first discipline — failing contract tests landed before implementation for every UX-0x must-have (runtime guards, FS-grep lints, 44px measurements, safe-area insets, save-failure haptic gating); 71/71 green at milestone close.
- Audit trail — full milestone audit passed: 19/19 requirements satisfied, 3/3 phases verified, 12/12 integration checks, 5/5 end-to-end flows, all three phases Nyquist-compliant.

**Known gaps / deferred:**

- D-13 override accepted: `impactFeedback("medium")` and `selectionFeedback()` produce no perceivable vibration on Pixel 8a motor (iOS-tuned waveforms below Android threshold). Delete haptic (`notificationFeedback` warning) fires perceivably. Documented, signed off by pvelasco 2026-04-17.
- Post-milestone polish (parked): substitute raw `vibrate(ms)` on Android for impact/selection to improve perceptibility.
- iOS support deferred to v2 (IOS-01..IOS-04 in `milestones/v1.0-REQUIREMENTS.md`).
- Cosmetic drift: SUMMARY.md `requirements-completed` frontmatter empty for Phase 1 and Phase 3 plans (evidence lives in VERIFICATION.md).

**Archived:**

- `.planning/milestones/v1.0-ROADMAP.md`
- `.planning/milestones/v1.0-REQUIREMENTS.md`
- `.planning/milestones/v1.0-MILESTONE-AUDIT.md`

**Tag:** `v1.0`

---
