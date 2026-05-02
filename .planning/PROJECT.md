# React Tauri Todo App

## What This Is

A Tauri v2 + React todo app running natively on Android, built inside the monorepo at `apps/tauri-todo`. Full CRUD, persistent local storage via `@tauri-apps/plugin-store`, 44px touch targets, safe-area insets, haptic feedback — no backend, no auth, no cloud. The experiment that proved Tauri v2 can ship a React app as a real Android app.

## Core Value

Prove that Tauri v2 can build and install a React app as a native mobile app on Android and iOS.

## Current State

**Shipped: v1.0 MVP** (2026-04-17) — Android-only, full todo CRUD with persistence and mobile-native UX. 71/71 tests green, 19/19 requirements satisfied, on-device verified on Pixel 8a. Tag: `v1.0`. Details: `.planning/MILESTONES.md`.

## Next Milestone Goals

Open question — likely v2 candidates: iOS parity (IOS-01..IOS-04), enhanced todo features (swipe-to-delete, inline edit, categories), or a deeper platform integration. Run `/gsd-new-milestone` to decide.

## Requirements

### Validated

- [x] Tauri v2 project scaffolded with React frontend in `apps/tauri-todo` — Validated in Phase 1: Foundation
- [x] Integrates with monorepo tooling (pnpm workspace, Turbo, shared tsconfig) — Validated in Phase 1: Foundation
- [x] App configured for Android and iOS mobile targets (no desktop) — Validated in Phase 1: Foundation (Android verified on device)
- [x] User can add a todo item — Validated in Phase 2: Todo App (TODO-01, device-verified)
- [x] User can mark a todo as complete — Validated in Phase 2: Todo App (TODO-02, device-verified)
- [x] User can delete a todo — Validated in Phase 2: Todo App (TODO-03, device-verified)
- [x] Todos persist across app restarts via @tauri-apps/plugin-store — Validated in Phase 2: Todo App (PERS-02, device-verified on cold restart)
- [x] Standalone styling (no dependency on @monorepo-template/ui) — Validated in Phase 2: Todo App (raw Tailwind, zero UI-package imports)
- [x] Mobile-native styling with 44px minimum touch targets (UX-01) — Validated in Phase 3: Mobile Polish (h-11 on input + Add; w-11 h-11 on toggle + delete; device-verified on Pixel 8a)
- [x] No hover states, mobile-only design (UX-02) — Validated in Phase 3: Mobile Polish (FS-grep lint + device-verified)
- [x] Standalone Tailwind styling re-verified (UX-03) — Validated in Phase 3: Mobile Polish (FS-grep lint)
- [x] Haptic feedback on add/delete via @tauri-apps/plugin-haptics (UX-04) — Validated in Phase 3: Mobile Polish (plugin installed, IPC contract verified, delete haptic device-perceivable on Pixel 8a; add/toggle below motor threshold per D-13)

### Validated (v1.0)

- ✓ App builds and installs on Android — v1.0 (dev build verified on Pixel 8a across all three phases)

### Active

- [ ] App builds and installs on iOS — deferred to v2 (IOS-01..IOS-04 in `milestones/v1.0-REQUIREMENTS.md`)

### Out of Scope

- Desktop builds (macOS/Windows/Linux) — mobile-only experiment
- Backend or API integration — local-only persistence
- User authentication — no users, just a local todo list
- @monorepo-template/ui components — keeping this self-contained
- Complex todo features (due dates, categories, priorities) — keep it simple

## Context

- Shipped v1.0 in 3 days (2026-04-15 → 2026-04-17): ~1,286 LOC TS/TSX + 17 LOC Rust in `apps/tauri-todo`, 123 commits, 71 tests green
- Tech stack: Tauri v2, React 19, Vite, Tailwind CSS 4, `@tauri-apps/plugin-store` (persistence), `@tauri-apps/plugin-haptics` 2.3.2 (mobile-only target-cfg)
- Android-only build; iOS infrastructure exists but not initialized — deferred to v2
- Known device caveat: `impactFeedback`/`selectionFeedback` waveforms are iOS-tuned and produce no perceivable vibration on Pixel 8a (D-13 override accepted); `notificationFeedback` (delete) fires perceivably. Post-v1 polish: try raw `vibrate(ms)` on Android
- The monorepo's showcase app (`apps/showcase`) pattern informed but is not coupled to `tauri-todo` — per the standalone-styling decision
- Tauri docs: https://v2.tauri.app/es/

## Constraints

- **Monorepo**: Must work within pnpm workspace and Turbo task orchestration
- **TypeScript**: Must use project TypeScript setup (shared tsconfig)
- **Tauri v2**: Must use latest stable Tauri v2 (not v1)
- **Mobile only**: Configure only Android and iOS targets
- **No backend**: All data stays on-device via Tauri Store plugin

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tauri v2 over Capacitor/React Native | Want to test Tauri's Rust-based approach to mobile | Validated — Phase 1+2 on Android |
| @tauri-apps/plugin-store for persistence | Native key-value storage, no web API reliance | Validated — PERS-02 passed on-device restart |
| Standalone styling | Keep experiment isolated from UI package | Validated — raw Tailwind in Phase 2, zero UI imports |
| Mobile only | Core question is whether Tauri mobile works | Validated — Android working; iOS deferred to v2 |
| 44px touch target floor on every interactive control | Apple HIG / Material Design minimum; makes thumb-tapping reliable on small screens | Validated — Phase 3 UX-01, device-verified on Pixel 8a |
| Accept device-dependent Android haptic behavior (D-13) | Plugin docs: "no standards or requirements for vibration support on Android"; impactFeedback/selectionFeedback waveforms are iOS-tuned | Validated — Phase 3 on-device UAT; delete haptic fires; add/toggle below motor threshold on Pixel 8a (accepted, not blocking) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-17 after v1.0 milestone*
