# Roadmap: React Tauri Todo App

## Overview

Three phases to prove Tauri v2 can deliver a native Android app. Phase 1 gets the environment and scaffold in place so Tauri can compile at all. Phase 2 builds the todo app with persistent storage — the full feature set running on Android. Phase 3 applies mobile-native UX polish so the app feels at home on a phone, not like a web app in a shell.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Dev environment configured and Tauri project scaffolded in the monorepo
- [ ] **Phase 2: Todo App** - Working todo app with add/complete/delete and persistent storage on Android
- [ ] **Phase 3: Mobile Polish** - Native mobile UX with proper touch targets, Tailwind styling, and haptic feedback

## Phase Details

### Phase 1: Foundation
**Goal**: The dev environment is ready and Tauri v2 compiles and runs on Android
**Depends on**: Nothing (first phase)
**Requirements**: ENV-01, ENV-02, SCAF-01, SCAF-02, SCAF-03, SCAF-04, SCAF-05, SCAF-06
**Success Criteria** (what must be TRUE):
  1. `tauri android dev` launches the app on a connected Android device or emulator without error
  2. The Tauri project lives at `apps/tauri-todo` and is recognized as a pnpm workspace package
  3. `gen/` directories are gitignored and do not appear in `git status`
  4. Vite dev server is accessible from the Android device via `TAURI_DEV_HOST`
  5. Mobile capabilities file exists and grants plugin permissions for Android
**Plans:** 5 plans

Plans:
- [x] 01-01-PLAN.md — Environment setup: Android SDK/NDK verification, Rust targets, gitignore
- [x] 01-02-PLAN.md — Frontend scaffold: React/Vite/TS config files, HTML entry point, workspace integration
- [x] 01-03-PLAN.md — Rust backend: Cargo/Tauri config, greet command, store plugin, icons, Turbo tasks
- [x] 01-04-PLAN.md — Android init, capabilities, verification screen, device test
- [x] 01-05-PLAN.md — Gap closure: Tauri runtime guard, StoreOptions fix, root android scripts
**UI hint**: yes

### Phase 2: Todo App
**Goal**: Users can manage todos that survive app restarts on Android
**Depends on**: Phase 1
**Requirements**: TODO-01, TODO-02, TODO-03, TODO-04, PERS-01, PERS-02, PERS-03
**Success Criteria** (what must be TRUE):
  1. User can type a todo and tap a button to add it to the list
  2. User can tap a todo to toggle it between complete and incomplete
  3. User can tap a delete control to remove a todo permanently
  4. An empty state message appears when no todos exist
  5. Todos added in one session are still present after closing and reopening the app
**Plans:** 3 plans

Plans:
- [x] 02-01-PLAN.md — useTodos hook with store CRUD and Rust greet command removal
- [x] 02-02-PLAN.md — Todo components (TodoApp, TodoInput, TodoList, TodoItem) and app.tsx wiring
- [x] 02-03-PLAN.md — Android device verification checkpoint

### Phase 3: Mobile Polish
**Goal**: The app feels native on Android with proper touch targets and haptic feedback
**Depends on**: Phase 2
**Requirements**: UX-01, UX-02, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. All interactive controls meet the 44px minimum touch target size
  2. The app has no hover-state CSS — every interaction works by touch only
  3. Tailwind CSS styles are applied standalone with no dependency on @monorepo-template/ui
  4. Adding a todo and deleting a todo each trigger a haptic pulse on the device
**Plans:** 5 plans

Plans:
- [x] 03-01-PLAN.md — Wave 0 test scaffolds (runtime/haptics/lint/component tests; Nyquist failing-tests-first)
- [x] 03-02-PLAN.md — Haptics plugin install (JS 2.3.2 + Cargo target-cfg + lib.rs setup + capability grants)
- [ ] 03-03-PLAN.md — 44px touch targets (h-11 on input/button, w-11 h-11 on toggle/delete) + safe-area inset padding on main
- [ ] 03-04-PLAN.md — Haptic wiring in useTodos (save() returns boolean, fire-and-forget on success)
- [ ] 03-05-PLAN.md — On-device Android verification checkpoint (haptics, safe-area, 44px feel)
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 5/5 | Complete | - |
| 2. Todo App | 0/3 | Planned | - |
| 3. Mobile Polish | 0/5 | Planned | - |
