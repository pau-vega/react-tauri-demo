# React Tauri Todo App

## What This Is

A simple todo list app built with React and Tauri v2, targeting Android and iOS as native mobile apps. Lives in `apps/tauri-todo` within the monorepo. The purpose is to explore how Tauri works for mobile development — a self-contained experiment with no backend dependencies.

## Core Value

Prove that Tauri v2 can build and install a React app as a native mobile app on Android and iOS.

## Requirements

### Validated

- [x] Tauri v2 project scaffolded with React frontend in `apps/tauri-todo` — Validated in Phase 1: Foundation
- [x] Integrates with monorepo tooling (pnpm workspace, Turbo, shared tsconfig) — Validated in Phase 1: Foundation
- [x] App configured for Android and iOS mobile targets (no desktop) — Validated in Phase 1: Foundation (Android verified on device)

### Active

- [ ] User can add a todo item
- [ ] User can mark a todo as complete
- [ ] User can delete a todo
- [ ] Todos persist across app restarts via @tauri-apps/plugin-store
- [ ] App builds and installs on Android
- [ ] App builds and installs on iOS
- [ ] Standalone styling (no dependency on @monorepo-template/ui)

### Out of Scope

- Desktop builds (macOS/Windows/Linux) — mobile-only experiment
- Backend or API integration — local-only persistence
- User authentication — no users, just a local todo list
- @monorepo-template/ui components — keeping this self-contained
- Complex todo features (due dates, categories, priorities) — keep it simple

## Context

- This is an exploratory project to evaluate Tauri v2 for mobile development
- The monorepo already has a showcase Vite+React app in `apps/showcase` — this follows similar patterns but adds Tauri
- Tauri v2 has native mobile support (Android/iOS) — this is the key feature being tested
- The monorepo uses pnpm workspaces, Turbo, TypeScript 5.9.3, and shared configs
- Tauri docs at https://v2.tauri.app/es/
- Must use latest stable Tauri v2 versions

## Constraints

- **Monorepo**: Must work within pnpm workspace and Turbo task orchestration
- **TypeScript**: Must use project TypeScript setup (shared tsconfig)
- **Tauri v2**: Must use latest stable Tauri v2 (not v1)
- **Mobile only**: Configure only Android and iOS targets
- **No backend**: All data stays on-device via Tauri Store plugin

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tauri v2 over Capacitor/React Native | Want to test Tauri's Rust-based approach to mobile | — Pending |
| @tauri-apps/plugin-store for persistence | Native key-value storage, no web API reliance | — Pending |
| Standalone styling | Keep experiment isolated from UI package | — Pending |
| Mobile only | Core question is whether Tauri mobile works | — Pending |

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
*Last updated: 2026-04-16 after Phase 1 (Foundation) completion*
