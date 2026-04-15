# Requirements: React Tauri Todo App

**Defined:** 2026-04-15
**Core Value:** Prove that Tauri v2 can build and install a React app as a native mobile app on Android and iOS

## v1 Requirements

### Environment Setup

- [ ] **ENV-01**: Android SDK and NDK 28+ installed with JAVA_HOME, ANDROID_HOME, NDK_HOME configured
- [ ] **ENV-02**: Rust mobile cross-compilation targets installed (aarch64-linux-android, armv7-linux-androideabi, i686-linux-android, x86_64-linux-android)

### Scaffold

- [ ] **SCAF-01**: Tauri v2 project scaffolded with React + Vite frontend in `apps/tauri-todo`
- [ ] **SCAF-02**: Android mobile target initialized via `tauri android init`
- [ ] **SCAF-03**: pnpm workspace integration (recognized as workspace package)
- [ ] **SCAF-04**: Vite configured with `TAURI_DEV_HOST` for device testing
- [ ] **SCAF-05**: `gen/` directories gitignored
- [ ] **SCAF-06**: Mobile capabilities file created for plugin permissions

### Todo CRUD

- [ ] **TODO-01**: User can add a new todo item
- [ ] **TODO-02**: User can mark a todo as complete/incomplete
- [ ] **TODO-03**: User can delete a todo
- [ ] **TODO-04**: Empty state shown when no todos exist

### Persistence

- [ ] **PERS-01**: @tauri-apps/plugin-store installed and registered (JS + Rust)
- [ ] **PERS-02**: Todos persist across app restarts
- [ ] **PERS-03**: Store capability granted for mobile platform

### Mobile UX

- [ ] **UX-01**: Mobile-native styling with 44px minimum touch targets
- [ ] **UX-02**: No hover states (mobile-only design)
- [ ] **UX-03**: Standalone Tailwind CSS styling
- [ ] **UX-04**: Haptic feedback on add/delete actions via @tauri-apps/plugin-haptics

## v2 Requirements

### iOS Support

- **IOS-01**: iOS mobile target initialized via `tauri ios init`
- **IOS-02**: Xcode and CocoaPods configured for iOS builds
- **IOS-03**: App builds and installs on iOS device/simulator
- **IOS-04**: Node binary visible to Xcode build phases (Homebrew Node or .xcode.env.local)

### Enhanced Features

- **ENH-01**: Swipe-to-delete gesture for todo items
- **ENH-02**: Inline todo editing
- **ENH-03**: Todo categories or tags

## Out of Scope

| Feature | Reason |
|---------|--------|
| Desktop builds (macOS/Windows/Linux) | Mobile-only experiment |
| Backend or API integration | Local-only persistence, no server needed |
| User authentication | No users, just a local todo list |
| @monorepo-template/ui components | Keeping experiment self-contained |
| Cloud sync | Out of scope for local-only experiment |
| Notifications | Requires permission UX flow, overkill for todo experiment |
| Due dates / priorities | Keep todo features simple |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENV-01 | Phase 1 | Pending |
| ENV-02 | Phase 1 | Pending |
| SCAF-01 | Phase 1 | Pending |
| SCAF-02 | Phase 1 | Pending |
| SCAF-03 | Phase 1 | Pending |
| SCAF-04 | Phase 1 | Pending |
| SCAF-05 | Phase 1 | Pending |
| SCAF-06 | Phase 1 | Pending |
| TODO-01 | Phase 2 | Pending |
| TODO-02 | Phase 2 | Pending |
| TODO-03 | Phase 2 | Pending |
| TODO-04 | Phase 2 | Pending |
| PERS-01 | Phase 2 | Pending |
| PERS-02 | Phase 2 | Pending |
| PERS-03 | Phase 2 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 3 | Pending |
| UX-03 | Phase 3 | Pending |
| UX-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-15*
*Last updated: 2026-04-15 after initial definition*
