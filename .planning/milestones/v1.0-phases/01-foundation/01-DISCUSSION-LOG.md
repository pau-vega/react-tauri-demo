# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-15
**Phase:** 01-foundation
**Areas discussed:** Monorepo integration depth, Initial app content, Android dev workflow, Scaffolding method

---

## Monorepo Integration Depth

| Option | Description | Selected |
|--------|-------------|----------|
| Full sharing | Use shared ESLint, tsconfig, prettier from packages/ | ✓ |
| Minimal sharing | Only share tsconfig base | |
| Fully standalone | No shared configs at all | |

**User's choice:** Full sharing
**Notes:** Same pattern as the showcase app. Keeps conventions consistent, reduces config duplication.

| Option | Description | Selected |
|--------|-------------|----------|
| Full Turbo integration | Add Tauri tasks to turbo.json | ✓ |
| Selective Turbo tasks | Participate in lint/typecheck but NOT dev | |
| No Turbo integration | Run Tauri commands independently | |

**User's choice:** Full Turbo integration

| Option | Description | Selected |
|--------|-------------|----------|
| Use pnpm catalog | Same versions across workspace | ✓ |
| Pin independently | Own dependency versions | |

**User's choice:** Use pnpm catalog

| Option | Description | Selected |
|--------|-------------|----------|
| @monorepo-template/tauri-todo | Follows existing scoping convention | ✓ |
| tauri-todo (unscoped) | Simpler but breaks naming pattern | |

**User's choice:** @monorepo-template/tauri-todo

| Option | Description | Selected |
|--------|-------------|----------|
| Own Vite config | Tauri needs specific settings | ✓ |
| Shared base + overrides | Extract common config to package | |

**User's choice:** Own Vite config

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, use @ alias | Same pattern as showcase | ✓ |
| No path aliases | Relative imports only | |

**User's choice:** Yes, use @ alias

| Option | Description | Selected |
|--------|-------------|----------|
| No, Rust is independent | Cargo handles Rust builds | ✓ |
| Add cargo check to Turbo | Cross-language consistency | |
| You decide | | |

**User's choice:** No, Rust is independent

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, set up Vitest | Ready for Phase 2 testing | ✓ |
| Skip testing setup | Defer to Phase 2 | |
| You decide | | |

**User's choice:** Yes, set up Vitest

| Option | Description | Selected |
|--------|-------------|----------|
| Keep existing hooks as-is | Conventional commits already enforced | ✓ |
| Add Tauri-specific scope | Allow feat(tauri): etc. | |

**User's choice:** Keep existing hooks as-is

| Option | Description | Selected |
|--------|-------------|----------|
| Root .gitignore | Single location for all ignores | ✓ |
| Local .gitignore | Scoped to app directory | |

**User's choice:** Root .gitignore

| Option | Description | Selected |
|--------|-------------|----------|
| apps/tauri-todo/src-tauri/ | Standard Tauri convention | ✓ |
| packages/tauri-backend/ | Separate Rust package | |
| You decide | | |

**User's choice:** apps/tauri-todo/src-tauri/

| Option | Description | Selected |
|--------|-------------|----------|
| README docs only | No .env files | ✓ |
| .env.example template | Devs copy to .env.local | |
| You decide | | |

**User's choice:** README docs only

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, wrap in scripts | Discoverable pnpm scripts | ✓ |
| Run Tauri CLI directly | Fewer scripts to maintain | |

**User's choice:** Yes, wrap in package.json scripts

| Option | Description | Selected |
|--------|-------------|----------|
| No root scripts | Run from app directory or turbo --filter | ✓ |
| Add root convenience scripts | One-command dev from anywhere | |
| You decide | | |

**User's choice:** No root scripts

| Option | Description | Selected |
|--------|-------------|----------|
| Cache JS only, skip Rust | Cargo manages own cache | ✓ |
| Cache everything | Full Tauri build in Turbo cache | |

**User's choice:** Cache JS only, skip Rust

---

## Initial App Content

| Option | Description | Selected |
|--------|-------------|----------|
| Tauri verification screen | Proves JS-Rust bridge works | ✓ |
| Blank app shell | Just a heading | |
| Todo-ready skeleton | Placeholder structure for Phase 2 | |

**User's choice:** Tauri verification screen

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal Tailwind styling | Basic centering, readable text | ✓ |
| No styling at all | Raw HTML defaults | |
| You decide | | |

**User's choice:** Minimal Tailwind styling

| Option | Description | Selected |
|--------|-------------|----------|
| Greet command | Classic Tauri demo | ✓ |
| System info command | Returns device/OS info | |
| You decide | | |

**User's choice:** Greet command

| Option | Description | Selected |
|--------|-------------|----------|
| Test store in Phase 1 | Verify plugin before Phase 2 depends on it | ✓ |
| Defer store test to Phase 2 | Phase 1 only verifies IPC | |
| You decide | | |

**User's choice:** Test store in Phase 1

| Option | Description | Selected |
|--------|-------------|----------|
| Default Tauri icon | Experiment, no custom branding | ✓ |
| Simple custom icon | Todo-themed icon | |

**User's choice:** Default Tauri icon

| Option | Description | Selected |
|--------|-------------|----------|
| System fonts | Native font stack, lighter bundle | ✓ |
| Inter font | Match showcase typography | |

**User's choice:** System fonts

| Option | Description | Selected |
|--------|-------------|----------|
| Tauri Todo | Clear, descriptive | ✓ |
| Todo | Shorter but generic | |

**User's choice:** Tauri Todo

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, show versions | Useful for debugging | ✓ |
| No debug info | Clean interface | |
| You decide | | |

**User's choice:** Yes, show versions

| Option | Description | Selected |
|--------|-------------|----------|
| com.monorepo.tauritodo | Project-relevant prefix | ✓ |
| com.example.tauritodo | Generic example prefix | |
| You decide | | |

**User's choice:** com.monorepo.tauritodo

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, use StrictMode | Catches common React issues | ✓ |
| No StrictMode | Avoids double-render in dev | |

**User's choice:** Yes, use StrictMode

| Option | Description | Selected |
|--------|-------------|----------|
| Light only | Simple white background | ✓ |
| Follow system preference | Respect device dark/light mode | |
| You decide | | |

**User's choice:** Light only

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, mobile viewport | Prevents unexpected zooming | ✓ |
| Default viewport | Whatever Tauri generates | |

**User's choice:** Yes, mobile viewport

| Option | Description | Selected |
|--------|-------------|----------|
| Tauri default | API 24 / Android 7.0 | ✓ |
| API 28+ | Matches NDK 28 requirement | |
| You decide | | |

**User's choice:** Tauri default

---

## Android Dev Workflow

| Option | Description | Selected |
|--------|-------------|----------|
| Physical device | USB debugging, most realistic | ✓ |
| Android emulator | No physical device needed | |
| Both | Configure for either | |

**User's choice:** Physical device

| Option | Description | Selected |
|--------|-------------|----------|
| Verify HMR works | Critical for Phase 2 productivity | ✓ |
| Cold-start only | Just verify build and launch | |
| You decide | | |

**User's choice:** Verify HMR works

| Option | Description | Selected |
|--------|-------------|----------|
| Already installed | Just verify SDK/NDK versions | ✓ |
| Need setup guidance | Include step-by-step setup | |
| You decide | | |

**User's choice:** Already installed

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, include troubleshooting | Short troubleshooting section in README | ✓ |
| Keep README minimal | Just the happy path | |
| You decide | | |

**User's choice:** Yes, include troubleshooting

| Option | Description | Selected |
|--------|-------------|----------|
| Conditional on TAURI_DEV_HOST | Only bind 0.0.0.0 when set | ✓ |
| Always 0.0.0.0 | Simpler but always exposed | |

**User's choice:** Conditional on TAURI_DEV_HOST

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal — add as needed | Only store plugin permissions | ✓ |
| Broad permissions upfront | Grant common permissions now | |
| You decide | | |

**User's choice:** Minimal — add as needed

| Option | Description | Selected |
|--------|-------------|----------|
| Debug only | No release signing config | ✓ |
| Debug + release stub | Placeholder release config | |

**User's choice:** Debug only

| Option | Description | Selected |
|--------|-------------|----------|
| Bare-bones | Only tauri, tauri-build, store plugin | ✓ |
| Add serde for JSON | Useful for typed data exchange | |
| You decide | | |

**User's choice:** Bare-bones

| Option | Description | Selected |
|--------|-------------|----------|
| Single README | Everything in one place | ✓ |
| README + DEVELOPMENT.md | Separate overview from details | |

**User's choice:** Single README

| Option | Description | Selected |
|--------|-------------|----------|
| Commit Gradle wrapper | Same Gradle version for everyone | ✓ |
| Gitignore and regenerate | Lighter repo | |
| You decide | | |

**User's choice:** Commit Gradle wrapper

| Option | Description | Selected |
|--------|-------------|----------|
| USB debugging | Most reliable, always works | ✓ |
| WiFi debugging | Wireless ADB, no cable | |
| You decide | | |

**User's choice:** USB debugging

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, include logcat guide | Essential for WebView debugging | ✓ |
| Skip logcat docs | Developers look it up | |

**User's choice:** Yes, include logcat guide

| Option | Description | Selected |
|--------|-------------|----------|
| Tauri default | Use default target SDK | ✓ |
| Target latest (API 35) | Maximum feature access | |

**User's choice:** Tauri default

| Option | Description | Selected |
|--------|-------------|----------|
| Fixed port (1420) | Predictable for Tauri config | ✓ |
| Let Vite auto-assign | Avoids port conflicts | |

**User's choice:** Fixed port (1420)

---

## Scaffolding Method

| Option | Description | Selected |
|--------|-------------|----------|
| Manual setup in monorepo | Full control over integration | ✓ |
| create-tauri-app then move | Faster start, needs cleanup | |
| create-tauri-app in-place | Riskier, may conflict | |

**User's choice:** Manual setup in monorepo

| Option | Description | Selected |
|--------|-------------|----------|
| Fresh Vite + React setup | Clean start, no baggage | ✓ |
| Copy showcase structure | Clone and strip, faster but messy | |

**User's choice:** Fresh Vite + React setup

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate — part of scaffolding | Android-ready is the goal | ✓ |
| Separate verification step | Incremental desktop-first | |

**User's choice:** Immediate — part of scaffolding

| Option | Description | Selected |
|--------|-------------|----------|
| JSON | Standard, widest support | |
| JSON5 (tauri.conf.json5) | Comments, trailing commas | ✓ |

**User's choice:** JSON5 (user override of recommended JSON)
**Notes:** User preferred JSON5 for better maintainability with comments and trailing commas.

| Option | Description | Selected |
|--------|-------------|----------|
| Install during scaffolding | Verify store in Phase 1 | ✓ |
| Defer to Phase 2 | Keep scaffolding minimal | |

**User's choice:** Install during scaffolding

| Option | Description | Selected |
|--------|-------------|----------|
| No, defer to Phase 3 | Only install what Phase 1 needs | ✓ |
| Yes, install now | All plugins upfront | |

**User's choice:** No, defer to Phase 3

| Option | Description | Selected |
|--------|-------------|----------|
| All in main.rs | Simple, refactor when needed | ✓ |
| Separate commands module | More organized, premature for one command | |
| You decide | | |

**User's choice:** All in main.rs

---

## Claude's Discretion

- Exact Tailwind utility classes for verification screen layout
- Vite plugin configuration details
- Turbo task configuration specifics
- Gradle and Android manifest details
- Rust toolchain version selection

## Deferred Ideas

- iOS support — v2 scope
- Haptics plugin — Phase 3
- Dark mode — Phase 3
- Desktop builds — out of scope
- Custom app icon — not needed for experiment
- Release signing — not needed for experiment
