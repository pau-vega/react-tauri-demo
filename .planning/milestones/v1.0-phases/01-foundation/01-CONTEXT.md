# Phase 1: Foundation - Context

**Gathered:** 2026-04-15
**Status:** Ready for planning

<domain>
## Phase Boundary

Dev environment configured and Tauri v2 project scaffolded in the monorepo. The app compiles and runs on a physical Android device, proving the full stack works: React frontend, Rust backend, JS-Rust IPC bridge, and plugin system. No todo features — just verification that the foundation is solid.

</domain>

<decisions>
## Implementation Decisions

### Monorepo Integration
- **D-01:** Full config sharing — use `@monorepo-template/eslint-config`, `@monorepo-template/tsconfig/react-app.json`, and shared prettier config. Same pattern as `apps/showcase`.
- **D-02:** Full Turbo integration — add Tauri-specific tasks to `turbo.json`. `pnpm dev`, `pnpm lint`, `pnpm typecheck` include the Tauri app.
- **D-03:** Use pnpm catalog for shared dependencies (React, TypeScript, Vite, Tailwind). Same versions as the rest of the monorepo.
- **D-04:** Package name: `@monorepo-template/tauri-todo`. Follows existing scoping convention.
- **D-05:** Own Vite config — Tauri needs specific settings (`clearScreen: false`, `TAURI_DEV_HOST` binding). No shared base config.
- **D-06:** Use `@` path alias mapping to `src/`. Same pattern as `apps/showcase`.
- **D-07:** Rust code is independent of JS tooling — no `cargo check` in Turbo, no Rust linting from ESLint. Cargo manages its own builds.
- **D-08:** Include Vitest setup from Phase 1. Ready for Phase 2 unit testing.
- **D-09:** Keep existing husky + commitlint hooks as-is. Conventional commits apply to Tauri work.
- **D-10:** Add `gen/` to root `.gitignore`. Single location for all ignores.
- **D-11:** Standard `apps/tauri-todo/src-tauri/` directory placement for Rust code.
- **D-12:** Document env vars (JAVA_HOME, ANDROID_HOME, NDK_HOME, TAURI_DEV_HOST) in README only — no `.env` files.
- **D-13:** Wrap Tauri CLI commands in `package.json` scripts (e.g., `"android:dev": "tauri android dev"`).
- **D-14:** No root-level convenience scripts. Run from app directory or use `turbo --filter`.
- **D-15:** Turbo caches JS builds only. Cargo manages its own build cache in `target/`.

### Initial App Content
- **D-16:** Tauri verification screen — a simple UI that proves the JS-Rust IPC bridge works.
- **D-17:** Greet command — input a name, Rust returns "Hello, {name}!". Classic Tauri demo for bidirectional IPC verification.
- **D-18:** Minimal Tailwind styling — basic layout centering, readable text, styled button. Not polished, just not raw HTML.
- **D-19:** Test `@tauri-apps/plugin-store` in Phase 1 — simple write/read to verify the plugin is registered correctly on Android before Phase 2 depends on it.
- **D-20:** Default Tauri icon. No custom branding for an experiment.
- **D-21:** System fonts — use device's native font stack. No Inter font dependency.
- **D-22:** App name: "Tauri Todo". Shown under the icon on the Android home screen.
- **D-23:** Display Tauri version, React version, and platform info on the verification screen for debugging.
- **D-24:** Bundle ID: `com.monorepo.tauritodo`.
- **D-25:** Mobile viewport meta tag — `width=device-width, initial-scale=1, viewport-fit=cover`.
- **D-26:** React StrictMode enabled. Same pattern as the showcase app.
- **D-27:** Light-only color scheme. Dark mode is Phase 3 territory if at all.
- **D-28:** Tauri default minimum Android SDK version (API 24 / Android 7.0).

### Android Dev Workflow
- **D-29:** Primary dev target: physical device via USB debugging.
- **D-30:** Verify HMR (hot module replacement) works on the physical device. Critical for Phase 2 productivity.
- **D-31:** Android Studio already installed. Phase 1 verifies SDK/NDK versions and adds Rust cross-compilation targets.
- **D-32:** README includes troubleshooting section for common issues (device not detected, Gradle sync, first-build timeout, pnpm workspace quirks).
- **D-33:** README includes logcat guide for debugging Tauri/WebView issues on device.
- **D-34:** Vite host binding conditional on `TAURI_DEV_HOST` — only bind to `0.0.0.0` when set, default to localhost for web dev.
- **D-35:** Minimal permissions in capabilities file — only what the store plugin requires. Add more per-phase.
- **D-36:** Debug builds only. No release signing configuration.
- **D-37:** Bare-bones Cargo.toml — only tauri, tauri-build, and store plugin crate. Add more as needed.
- **D-38:** Single README.md in `apps/tauri-todo` covering setup, dev commands, troubleshooting, and logcat.
- **D-39:** Commit Gradle wrapper files (gradlew, gradle/wrapper/) to git. Standard Android practice.
- **D-40:** Tauri default target SDK version.
- **D-41:** Fixed Vite dev server port (1420). Predictable for Tauri devUrl configuration.

### Scaffolding Method
- **D-42:** Manual setup in monorepo — create `apps/tauri-todo` from scratch, set up Vite + React, then `tauri init` + `tauri android init`. No `create-tauri-app`.
- **D-43:** Fresh Vite + React setup — not copied from the showcase app. Clean start following Tauri's recommended patterns.
- **D-44:** Run `tauri android init` immediately after `tauri init`. No intermediate desktop verification step.
- **D-45:** Use JSON5 format for Tauri config (`tauri.conf.json5`). Supports comments and trailing commas.
- **D-46:** Install `@tauri-apps/plugin-store` during scaffolding (both JS and Rust sides). Manual install due to pnpm workspace `tauri add` bug.
- **D-47:** Defer haptics plugin to Phase 3. Only install what Phase 1 needs.
- **D-48:** All Rust commands in `main.rs`. No separate modules until complexity warrants it.

### Claude's Discretion
- Exact Tailwind utility classes for the verification screen layout
- Vite plugin configuration details beyond `@vitejs/plugin-react` and `@tailwindcss/vite`
- Exact Turbo task configuration for Tauri-specific tasks
- Gradle and Android manifest configuration details
- Rust toolchain version selection

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Tauri v2 Documentation
- Tauri v2 docs at `https://v2.tauri.app/` — Official Tauri v2 documentation (project context references Spanish locale `https://v2.tauri.app/es/`)
- `https://v2.tauri.app/start/create-project/` — Project creation guide
- `https://v2.tauri.app/develop/` — Development workflow including mobile
- `https://v2.tauri.app/develop/configuration-files/` — Configuration file formats (JSON5 supported)

### Project Requirements
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: ENV-01, ENV-02, SCAF-01 through SCAF-06
- `.planning/PROJECT.md` — Project constraints, key decisions, known issues (pnpm `tauri add` bug)
- `.planning/ROADMAP.md` — Phase 1 success criteria (5 items)

### Monorepo Patterns
- `pnpm-workspace.yaml` — Workspace definition, pnpm catalog versions
- `turbo.json` — Existing Turbo task configuration to extend
- `packages/tsconfig/` — Shared TypeScript configs to reference
- `packages/eslint-config/` — Shared ESLint config to import

### Known Issues
- `https://github.com/tauri-apps/tauri/issues/12706` — `tauri add` broken in pnpm workspaces; all plugin installs must be manual

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `pnpm-workspace.yaml` with `apps/*` glob — new app at `apps/tauri-todo` is automatically recognized as a workspace package
- `packages/tsconfig/react-app.json` — ready-made TypeScript config for React apps
- `packages/eslint-config/eslint.config.ts` — shared linting with React rules already configured
- `.prettierrc` — formatting rules (no semicolons, 120 char width) apply workspace-wide
- `pnpm catalog` in `pnpm-workspace.yaml` — pinned versions for React, Vite, TypeScript, Tailwind, Vitest

### Established Patterns
- `apps/showcase/` serves as the reference for how an app integrates with the monorepo (tsconfig extends, ESLint imports, path aliases)
- Named exports only, kebab-case files, PascalCase components, camelCase functions
- `@vitejs/plugin-react` for Vite React support
- `@tailwindcss/vite` for Tailwind integration

### Integration Points
- `turbo.json` tasks — new app needs to participate in build, dev, lint, typecheck, test, clean
- Root `.gitignore` — needs `gen/` entry for Tauri-generated files
- `pnpm-lock.yaml` — will be updated when Tauri dependencies are added

</code_context>

<specifics>
## Specific Ideas

- Verification screen should prove the full stack works: React rendering, Tailwind styling, JS-Rust IPC (greet command), and plugin system (store read/write)
- Display version info (Tauri, React, platform) on the verification screen for debugging confidence
- JSON5 config format chosen over JSON for better maintainability (comments, trailing commas)
- README should be a one-stop shop: setup, dev commands, troubleshooting, logcat guide

</specifics>

<deferred>
## Deferred Ideas

- iOS support — v2 scope (IOS-01 through IOS-04)
- Haptics plugin installation — Phase 3
- Dark mode / system theme — Phase 3 territory
- Desktop builds — explicitly out of scope
- Custom app icon — not needed for an experiment
- Release signing configuration — not needed for an experiment

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-04-15*
