---
phase: 03-mobile-polish
plan: 02
subsystem: infra
tags: [tauri-v2, haptics, rust, cargo, capabilities, mobile]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: manual plugin install playbook (D-46), capabilities/mobile.json baseline (core:default + store:default), physical device workflow (D-29)
  - phase: 03-01
    provides: capabilities.test.ts lint assertions that flip green once this plan lands
provides:
  - "@tauri-apps/plugin-haptics JS package pinned at 2.3.2 in apps/tauri-todo/package.json"
  - "tauri-plugin-haptics Rust crate 2.3.2 under mobile-only [target.'cfg(...)'.dependencies] in Cargo.toml"
  - "haptics plugin registered inside .setup(|app| { #[cfg(mobile)] ... }) in lib.rs"
  - "three least-privilege haptic permissions in capabilities/mobile.json"
affects:
  - "03-03 (touch targets / safe-area — no direct dependency but wave sibling)"
  - "03-04 (haptics JS wiring — imports @tauri-apps/plugin-haptics and calls the IPC exposed here)"
  - "03-05 (Android device verification — validates the full haptics call stack end-to-end)"

# Tech tracking
tech-stack:
  added:
    - "@tauri-apps/plugin-haptics 2.3.2 (JS)"
    - "tauri-plugin-haptics 2.3.2 (Rust crate, mobile-only via target-cfg)"
  patterns:
    - "Mobile-only Tauri plugin install: JS via pnpm add (no tauri add — pnpm workspace bug D-46), Rust via manual Cargo.toml target-cfg section, registration inside .setup() + #[cfg(mobile)] — NOT at Builder root"
    - "Least-privilege capabilities: three explicit haptics:allow-* strings instead of haptics:default"

key-files:
  created: []
  modified:
    - "apps/tauri-todo/package.json"
    - "apps/tauri-todo/src-tauri/Cargo.toml"
    - "apps/tauri-todo/src-tauri/src/lib.rs"
    - "apps/tauri-todo/src-tauri/capabilities/mobile.json"

key-decisions:
  - "haptics crate goes under [target.'cfg(any(target_os = \"android\", target_os = \"ios\"))'.dependencies] NOT [dependencies] — mobile-only crate; Builder-root registration fails desktop builds (Pitfall 1)"
  - "haptics plugin registered inside .setup(|app| { #[cfg(mobile)] ... }) with ? error propagation, not at Builder::default() root chain"
  - "three explicit capability grants: haptics:allow-impact-feedback, haptics:allow-notification-feedback, haptics:allow-selection-feedback — haptics:default and haptics:allow-vibrate explicitly excluded (least-privilege per T-03-03)"
  - "exact version pin 2.3.2 on both JS and Rust sides (no caret) matching crates.io max_version"

patterns-established:
  - "Mobile-only plugin pattern: target-cfg Cargo section + .setup()/#[cfg(mobile)] guard (contrast: cross-platform store plugin stays at Builder root)"
  - "Capability least-privilege: enumerate individual allow-* strings; never use broad :default grants"

requirements-completed:
  - UX-04

# Metrics
duration: 10min
completed: 2026-04-17
---

# Phase 03 Plan 02: Haptics Plugin Install Summary

**@tauri-apps/plugin-haptics 2.3.2 installed on both JS and Rust sides with mobile-only target-cfg guard and three least-privilege capability permissions — platform surface ready for Plan 04 to wire haptic calls in React**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-04-17T09:40:00Z
- **Completed:** 2026-04-17T09:50:00Z
- **Tasks:** 4
- **Files modified:** 4

## Accomplishments

- JS package `@tauri-apps/plugin-haptics` installed at exact version 2.3.2, pinned without caret in package.json, lockfile updated
- Rust crate `tauri-plugin-haptics = "2.3.2"` added under `[target.'cfg(any(target_os = "android", target_os = "ios"))'.dependencies]` — never links on desktop hosts
- `lib.rs` updated with `.setup(|app| { #[cfg(mobile)] app.handle().plugin(tauri_plugin_haptics::init())?; Ok(()) })` — store plugin preserved at Builder root
- `capabilities/mobile.json` extended with three exact haptic permission strings; zero broad grants; iOS preserved in platforms

## Task Commits

Each task was committed atomically:

1. **Task 1: Install JS package** — `bcb9ce8` (feat)
2. **Task 2: Cargo.toml mobile target-cfg** — `6742478` (feat)
3. **Task 3: lib.rs .setup() registration** — `3b529e0` (feat)
4. **Task 4: capabilities/mobile.json permissions** — `b912f43` (feat)

## Files Created/Modified

- `apps/tauri-todo/package.json` — added `"@tauri-apps/plugin-haptics": "2.3.2"` to dependencies (exact pin, no caret)
- `apps/tauri-todo/src-tauri/Cargo.toml` — appended `[target.'cfg(any(target_os = "android", target_os = "ios"))'.dependencies]` section with `tauri-plugin-haptics = "2.3.2"`
- `apps/tauri-todo/src-tauri/src/lib.rs` — added `.setup()` block with `#[cfg(mobile)]` guard for haptics init; store plugin stays at root
- `apps/tauri-todo/src-tauri/capabilities/mobile.json` — added three `haptics:allow-*` permission strings to existing core:default + store:default

## Decisions Made

**Mobile-only .setup() registration vs Builder root:** The haptics crate only compiles for Android/iOS targets. Using `.plugin(tauri_plugin_haptics::init())` at the `Builder::default()` root — like the store plugin — would fail on macOS/Linux/Windows host builds because the crate doesn't exist for those targets. Solution: `[target.'cfg(...)'.dependencies]` in Cargo.toml + `#[cfg(mobile)]` inside `.setup()` so the Rust compiler excludes both the dependency and the registration on non-mobile targets.

**Capability strings granted vs considered-and-rejected:**
- Granted: `haptics:allow-impact-feedback`, `haptics:allow-notification-feedback`, `haptics:allow-selection-feedback` — the three specific calls Plan 04 will make
- Rejected: `haptics:default` — overly broad, violates T-03-03 threat mitigation
- Rejected: `haptics:allow-vibrate` — we never call `vibrate()`; granting unused permissions is unnecessary attack surface

**Exact version pin 2.3.2:** Both JS package and Rust crate pinned at 2.3.2 without caret. Matches crates.io `max_version` as of 2026-04-17. Exact pin ensures JS and Rust sides stay version-aligned across lockfile refreshes.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

**Test suite includes RED tests from Plan 01 (Wave 0):** Running the full Vitest suite shows 2 failing test suites (`src/lib/haptics.test.ts` and `src/lib/runtime.test.ts`). These are pre-written RED tests from Plan 01 that import `@/lib/haptics` and `@/lib/runtime` — implementation files that don't exist yet and belong to Plans 03/04 (Wave 1). The 28 tests that do run all pass, including all 3 assertions in `capabilities.test.ts` (which is the test this plan was responsible for flipping from red to green). No regressions from this plan's changes.

**Plan 01 capabilities.test.ts now passes (3/3):** All three assertions — capabilities/mobile.json grants, lib.rs .setup() + #[cfg(mobile)] pattern, Cargo.toml target-cfg section — flip from red to green after this plan's work.

## User Setup Required

None — no external service configuration required. @tauri-apps/plugin-haptics is a first-party Tauri plugin with no accounts, API keys, or external services.

## Next Phase Readiness

- Platform surface fully installed: JS package resolves from node_modules, Rust crate declared for mobile targets, plugin registered in lib.rs, capabilities grant the three required permissions
- Plan 04 (haptics JS wiring) can now `import { impactFeedback, notificationFeedback, selectionFeedback } from "@tauri-apps/plugin-haptics"` and call them — the IPC path is open
- Plan 03 (touch targets, safe-area) is independent of this plan — no blockers
- Plan 05 (Android device build) will validate the full haptics call stack end-to-end on physical hardware

---
*Phase: 03-mobile-polish*
*Completed: 2026-04-17*
