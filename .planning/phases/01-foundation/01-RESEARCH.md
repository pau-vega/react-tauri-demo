# Phase 1: Foundation - Research

**Researched:** 2026-04-15
**Domain:** Tauri v2 mobile scaffold, Android dev environment, pnpm monorepo integration
**Confidence:** HIGH (primary sources: Context7 / official Tauri v2 docs, live registry checks)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Monorepo Integration
- **D-01:** Full config sharing — use `@monorepo-template/eslint-config`, `@monorepo-template/tsconfig/react-app.json`, and shared prettier config. Same pattern as `apps/showcase`.
- **D-02:** Full Turbo integration — add Tauri-specific tasks to `turbo.json`.
- **D-03:** Use pnpm catalog for shared dependencies (React, TypeScript, Vite, Tailwind).
- **D-04:** Package name: `@monorepo-template/tauri-todo`.
- **D-05:** Own Vite config — `clearScreen: false`, `TAURI_DEV_HOST` binding. No shared base config.
- **D-06:** Use `@` path alias mapping to `src/`.
- **D-07:** Rust code independent of JS tooling — no `cargo check` in Turbo.
- **D-08:** Include Vitest setup from Phase 1.
- **D-09:** Keep existing husky + commitlint hooks as-is.
- **D-10:** Add `gen/` to root `.gitignore`.
- **D-11:** Standard `apps/tauri-todo/src-tauri/` directory placement for Rust code.
- **D-12:** Document env vars in README only — no `.env` files.
- **D-13:** Wrap Tauri CLI commands in `package.json` scripts.
- **D-14:** No root-level convenience scripts.
- **D-15:** Turbo caches JS builds only. Cargo manages its own build cache.

#### Initial App Content
- **D-16:** Tauri verification screen — proves JS-Rust IPC bridge works.
- **D-17:** Greet command — input name, Rust returns "Hello, {name}!".
- **D-18:** Minimal Tailwind styling — basic layout, not polished.
- **D-19:** Test `@tauri-apps/plugin-store` in Phase 1 (write/read verification).
- **D-20:** Default Tauri icon.
- **D-21:** System fonts — `system-ui, -apple-system, sans-serif`.
- **D-22:** App name: "Tauri Todo".
- **D-23:** Display Tauri version, React version, and platform info on verification screen.
- **D-24:** Bundle ID: `com.monorepo.tauritodo`.
- **D-25:** Mobile viewport meta tag.
- **D-26:** React StrictMode enabled.
- **D-27:** Light-only color scheme.
- **D-28:** Tauri default minimum Android SDK version (API 24 / Android 7.0).

#### Android Dev Workflow
- **D-29:** Primary dev target: physical device via USB debugging.
- **D-30:** Verify HMR works on physical device.
- **D-31:** Android Studio already installed. Phase 1 verifies SDK/NDK versions and adds Rust cross-compilation targets.
- **D-32:** README includes troubleshooting section.
- **D-33:** README includes logcat guide.
- **D-34:** Vite host binding conditional on `TAURI_DEV_HOST`.
- **D-35:** Minimal permissions in capabilities file — only store plugin.
- **D-36:** Debug builds only.
- **D-37:** Bare-bones Cargo.toml — only tauri, tauri-build, and store plugin crate.
- **D-38:** Single README.md in `apps/tauri-todo`.
- **D-39:** Commit Gradle wrapper files.
- **D-40:** Tauri default target SDK version.
- **D-41:** Fixed Vite dev server port 1420.

#### Scaffolding Method
- **D-42:** Manual setup in monorepo — create `apps/tauri-todo` from scratch, then `tauri init` + `tauri android init`.
- **D-43:** Fresh Vite + React setup — not copied from showcase.
- **D-44:** Run `tauri android init` immediately after `tauri init`.
- **D-45:** Use JSON5 format for Tauri config (`tauri.conf.json5`).
- **D-46:** Install `@tauri-apps/plugin-store` manually (both JS and Rust). `tauri add` broken in pnpm workspaces.
- **D-47:** Defer haptics plugin to Phase 3.
- **D-48:** All Rust commands in `main.rs` (via lib.rs per skill pattern).

### Claude's Discretion
- Exact Tailwind utility classes for the verification screen layout
- Vite plugin configuration details beyond `@vitejs/plugin-react` and `@tailwindcss/vite`
- Exact Turbo task configuration for Tauri-specific tasks
- Gradle and Android manifest configuration details
- Rust toolchain version selection

### Deferred Ideas (OUT OF SCOPE)
- iOS support (IOS-01 through IOS-04) — v2 scope
- Haptics plugin installation — Phase 3
- Dark mode / system theme — Phase 3
- Desktop builds — explicitly out of scope
- Custom app icon — not needed for experiment
- Release signing configuration — not needed for experiment
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENV-01 | Android SDK and NDK 28+ installed with JAVA_HOME, ANDROID_HOME, NDK_HOME configured | Android SDK prerequisites verified via official Tauri docs; macOS paths documented |
| ENV-02 | Rust mobile cross-compilation targets installed (4 Android targets) | `rustup target add` commands verified; current Rust 1.80.1 confirmed installed without Android targets yet |
| SCAF-01 | Tauri v2 project scaffolded with React + Vite frontend in `apps/tauri-todo` | Manual scaffold steps, JSON5 config requirements, Cargo.toml features documented |
| SCAF-02 | Android mobile target initialized via `tauri android init` | CLI command verified in Tauri v2 docs |
| SCAF-03 | pnpm workspace integration (recognized as workspace package) | `pnpm-workspace.yaml` uses `apps/*` glob — automatically covers new app |
| SCAF-04 | Vite configured with `TAURI_DEV_HOST` for device testing | Exact Vite config pattern verified from official docs (port 1420, HMR port 1421) |
| SCAF-05 | `gen/` directories gitignored | Root `.gitignore` pattern documented; `gen/` not currently present |
| SCAF-06 | Mobile capabilities file created for plugin permissions | Mobile capability schema path and `store:default` permission documented |
</phase_requirements>

---

## Summary

Phase 1 scaffolds a Tauri v2 mobile app (`apps/tauri-todo`) inside the existing pnpm monorepo and proves the full stack — React rendering, Rust IPC, and the store plugin — works on a physical Android device.

The monorepo integration is straightforward: `apps/*` is already in `pnpm-workspace.yaml`, shared tsconfig/ESLint configs are ready to import, and the Vite configuration pattern mirrors `apps/showcase`. The only Tauri-specific divergences are a custom Vite config (required for `TAURI_DEV_HOST` and `clearScreen: false`), a `config-json5` Cargo feature for JSON5 config support, and four Android Rust cross-compilation targets that are not yet installed on this machine.

The primary execution risk is the Android dev environment: Android Studio is not installed on the development machine (checked `/Applications/`, `~/Library/Android/`), meaning ENV-01 (SDK/NDK setup) and ENV-02 (Rust targets) must be completed before `tauri android init` can succeed. The first build will also take 10–30 minutes due to Gradle dependency downloads and Rust cross-compilation.

**Primary recommendation:** Wave 0 of the plan must be Android environment setup (Studio + SDK + NDK + 4 Rust targets). Only after ENV-01 and ENV-02 are satisfied should the JS/Rust scaffolding tasks run.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| UI rendering (verification screen) | Frontend (Vite/React/WebView) | — | HTML/CSS/React in the WebView; Android renders via WebView engine |
| JS-to-Rust IPC (`greet` command) | API / Rust backend | Frontend (invoke call) | Command logic lives in Rust; frontend just calls `invoke()` |
| Plugin-store read/write | API / Rust backend (plugin) | Frontend (JS plugin API) | `tauri_plugin_store` handles disk I/O; JS API is thin wrapper |
| Vite dev server (HMR) | Frontend Server (dev only) | — | Bound to `TAURI_DEV_HOST`; serves to Android WebView over LAN |
| Capabilities / permissions | API / Rust backend (config) | — | `src-tauri/capabilities/*.json` grants what the WebView can call |
| Gradle / Android project | Mobile build system | — | `tauri android init` generates; Tauri CLI drives Gradle |
| Turbo orchestration | Build system | — | Wraps pnpm scripts; does not understand Cargo/Gradle internals |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tauri-apps/cli` | 2.10.1 | CLI for init, dev, build commands | Official Tauri CLI — only option |
| `@tauri-apps/api` | 2.10.1 | Frontend invoke/event/channel APIs | Official Tauri JS API — only option |
| `tauri` (Rust crate) | ^2 | Rust core framework | Required |
| `tauri-build` (Rust crate) | ^2 | Build script for code gen | Required |
| `@tauri-apps/plugin-store` | 2.4.2 | Key-value persistence plugin (JS) | Decision D-19, D-46 |
| `tauri-plugin-store` (Rust crate) | ^2 | Store plugin Rust backend | Decision D-19, D-46 |
| React | 19.2.5 (catalog) | UI library | Monorepo standard via pnpm catalog |
| Vite | 8.0.8 (catalog) | Dev server and bundler | Monorepo standard |
| `@vitejs/plugin-react` | ^6.0.1 (catalog) | React JSX transform | Monorepo standard |
| `@tailwindcss/vite` | ^4.2.2 (catalog) | Tailwind CSS Vite integration | Monorepo standard |
| TypeScript | ^6.0.2 (catalog) | Type safety | Monorepo standard |

**Version verification:** [VERIFIED: pnpm registry view 2026-04-15]
- `@tauri-apps/cli`: 2.10.1
- `@tauri-apps/api`: 2.10.1
- `@tauri-apps/plugin-store`: 2.4.2

Rust crate versions are managed by Cargo and default to `"^2"` in `Cargo.toml` — Cargo resolves the latest 2.x.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | ^4.1.4 (catalog) | Unit testing | D-08 requires Vitest setup in Phase 1 |
| `@vitejs/coverage-v8` | ^4.1.4 (catalog) | Coverage reports | With Vitest |
| `serde` (Rust) | ^1 | JSON serialization for IPC types | Required for any Rust command return type |
| `serde_json` (Rust) | ^1 | JSON value handling in store commands | Required with plugin-store Rust side |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `tauri.conf.json5` | `tauri.conf.json` | JSON5 requires `config-json5` feature in Cargo; JSON works out of the box but no comments or trailing commas |
| Manual plugin install | `tauri add store` | `tauri add` is broken in pnpm workspaces (GitHub issue #12706) — manual install is mandatory |
| `@tauri-apps/plugin-os` | `TAURI_ENV_PLATFORM` | For displaying platform info on the verification screen, `import.meta.env.TAURI_ENV_PLATFORM` is available without installing a plugin |

**Installation:**
```bash
# From apps/tauri-todo — JS dependencies
pnpm add -D @tauri-apps/cli
pnpm add @tauri-apps/api @tauri-apps/plugin-store

# Rust side (from apps/tauri-todo/src-tauri)
cargo add tauri-plugin-store

# Rust cross-compilation targets (machine-level, run once)
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

---

## Architecture Patterns

### System Architecture Diagram

```
Physical Android Device
        │  USB / ADB
        ▼
  Android WebView
        │  HTML/CSS/JS rendered from Vite dev server
        │
        ├──► Vite Dev Server (port 1420, bound to TAURI_DEV_HOST)
        │         │ HMR websocket (port 1421)
        │         └── React app (JSX → JS bundle)
        │
        └──► Tauri IPC Bridge
                  │
                  ▼
           Rust Backend (lib.rs)
                  │
                  ├── greet command → returns "Hello, {name}!"
                  │
                  └── tauri_plugin_store
                            │
                            ▼
                     Android App Data Dir
                     (store.json on disk)
```

Data flows:
1. User taps "Send Greeting" → `invoke('greet', { name })` → Rust → String response → React state update
2. User taps "Test Store" → JS plugin API → Rust store plugin → write/read from disk → status update
3. HMR: code change on host → Vite server pushes update → WebView reloads component

### Recommended Project Structure

```
apps/tauri-todo/
├── src/
│   ├── main.tsx              # React entry point, StrictMode
│   ├── app.tsx               # Verification screen root
│   ├── components/
│   │   └── verification-screen.tsx  # Single verification UI component
│   └── index.css             # Tailwind CSS import
├── src-tauri/
│   ├── src/
│   │   ├── main.rs           # Thin passthrough: calls app_lib::run()
│   │   └── lib.rs            # ALL app logic: builder, commands, plugin registration
│   ├── capabilities/
│   │   └── mobile.json       # Mobile-specific capability (store:default + core:default)
│   ├── icons/                # Default Tauri icons
│   ├── tauri.conf.json5      # Tauri configuration (JSON5 format)
│   ├── Cargo.toml            # Rust deps (tauri, tauri-build, tauri-plugin-store, serde)
│   └── build.rs              # Build script (required)
├── index.html                # HTML shell with viewport meta tag
├── vite.config.ts            # Tauri-specific Vite config
├── tsconfig.json             # Extends @monorepo-template/tsconfig/react-app.json
├── eslint.config.ts          # Imports @monorepo-template/eslint-config
├── package.json              # scripts, @monorepo-template/tauri-todo name
├── vitest.config.ts          # Vitest config (D-08)
└── README.md                 # Setup, dev commands, troubleshooting, logcat guide
```

### Pattern 1: JSON5 Config Requires Cargo Feature

**What:** Using `tauri.conf.json5` requires opt-in features in `Cargo.toml` for both `tauri-build` and `tauri`.
**When to use:** Always when D-45 (JSON5 format) is a locked decision.

```toml
# src-tauri/Cargo.toml
[build-dependencies]
tauri-build = { version = "2", features = ["config-json5"] }

[dependencies]
tauri = { version = "2", features = ["config-json5"] }
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[lib]
name = "app_lib"
crate-type = ["staticlib", "cdylib", "rlib"]
```

[VERIFIED: Context7 / v2.tauri.app/develop/configuration-files]

### Pattern 2: lib.rs Owns All Logic (Mobile Requirement)

**What:** On mobile, Tauri replaces `main()` with `#[cfg_attr(mobile, tauri::mobile_entry_point)]`. All commands and plugin registration live in `lib.rs`.
**When to use:** Any Tauri project targeting Android or iOS.

```rust
// src-tauri/src/main.rs — thin passthrough only
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    app_lib::run();
}
```

```rust
// src-tauri/src/lib.rs — owns all logic
#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

[VERIFIED: Context7 skill SKILL.md + v2.tauri.app]

### Pattern 3: Vite Config for Tauri Mobile

**What:** Conditional `host` and `hmr` based on `TAURI_DEV_HOST` env var.
**When to use:** Any Tauri app that will run on a physical mobile device.

```typescript
// vite.config.ts
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    host: host || false,
    port: 1420,
    strictPort: true,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    target: "safari13",
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

[VERIFIED: Context7 / tauri.app/llms-full.txt]

### Pattern 4: Mobile Capability File

**What:** A separate capability JSON for mobile platforms, referencing the generated mobile schema.
**When to use:** When granting plugin permissions that apply to Android (and later iOS).

```json
// src-tauri/capabilities/mobile.json
{
  "$schema": "../gen/schemas/mobile-schema.json",
  "identifier": "mobile-capability",
  "windows": ["main"],
  "platforms": ["iOS", "android"],
  "permissions": [
    "core:default",
    "store:default"
  ]
}
```

[VERIFIED: Context7 / tauri.app/security/capabilities]

**Note:** The `$schema` path references `gen/schemas/mobile-schema.json` which is generated by `tauri android init`. The schema file will not exist until after `tauri android init` runs — this is expected.

### Pattern 5: Plugin-Store JS API

**What:** Load a named store file, get and set JSON values.
**When to use:** Phase 1 store verification test, Phase 2 todo persistence.

```typescript
// Frontend usage
import { load } from "@tauri-apps/plugin-store"

const store = await load("store.json", { autoSave: false })

// Write
await store.set("test-key", { value: "hello from store" })
await store.save()

// Read
const val = await store.get<{ value: string }>("test-key")
```

[VERIFIED: v2.tauri.app/plugin/store/]

### Pattern 6: Platform Info via TAURI_ENV_*

**What:** `import.meta.env.TAURI_ENV_PLATFORM` is populated by Tauri at build/dev time. No plugin install required.
**When to use:** Displaying platform info on the verification screen (D-23).

```typescript
// In React component
const platform = import.meta.env.TAURI_ENV_PLATFORM ?? "web"
// Returns "android" | "ios" | "macos" | "windows" | "linux" | undefined
```

Note: This value will be `undefined` when running in plain web browser (not through Tauri).

[ASSUMED — based on Tauri v2 documentation patterns; `TAURI_ENV_*` env vars are documented as exposed via `envPrefix`]

### Anti-Patterns to Avoid

- **Using `tauri add` in pnpm workspace:** `tauri add store` is broken in pnpm workspaces (GitHub issue #12706). It will fail silently or corrupt package.json. Always install manually: `pnpm add @tauri-apps/plugin-store` + `cargo add tauri-plugin-store`.
- **Putting logic in `main.rs`:** Mobile builds replace `main()`. Any command or plugin registration in `main.rs` is silently dropped on mobile. All logic must live in `lib.rs::run()`.
- **Missing capability for installed plugin:** Installing `tauri-plugin-store` without adding `store:default` to a capability file causes silent permission failures at runtime — no error thrown, the JS call just never resolves.
- **Referencing `gen/schemas/` before `tauri android init`:** The `$schema` in capability files references generated paths. The schema doesn't exist until after `tauri android init` — IDE validation will show errors before init, which is normal.
- **Using `hover:` Tailwind variants:** The UI spec (01-UI-SPEC.md) prohibits hover states — mobile-only design. Use `active:` instead.
- **Hardcoding `0.0.0.0` as Vite host:** Only bind to `0.0.0.0` (or the `TAURI_DEV_HOST` value) when that env var is set. Without it, binding to `0.0.0.0` in plain web dev breaks localhost development.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Key-value persistence on Android | Custom file I/O in Rust | `tauri-plugin-store` | Plugin handles app data dir resolution, serialization, cross-platform differences |
| IPC error serialization | Custom error JSON format | `thiserror` + `impl serde::Serialize for AppError` | Standard pattern; Result<T, E> propagates cleanly across IPC boundary |
| JSON serialization in Rust commands | Manual string building | `serde` + `serde_json` | Required by Tauri's IPC serialization contract |
| Capability grants | Inline allowlist in `tauri.conf.json` | Separate `capabilities/*.json` files | Tauri v2 removed the v1 allowlist; capabilities system is the only way |

**Key insight:** Tauri v2's permission system denies everything by default. Any plugin call that seems to "not work" is almost certainly a missing capability, not a code error.

---

## Runtime State Inventory

Not applicable — this is a greenfield phase. No existing runtime state to migrate.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Android Studio | ENV-01 (SDK/NDK install UI) | No | — | Manual SDK command-line tools install (complex) |
| Android SDK (ANDROID_HOME) | ENV-01, `tauri android init` | No | — | None — blocks execution |
| Android NDK (NDK_HOME) | ENV-01, Rust cross-compilation | No | — | None — blocks execution |
| JAVA_HOME | ENV-01, Gradle builds | Not configured | — | None — blocks Gradle |
| Rust / rustup | ENV-02, Cargo builds | Yes (rustup 1.28.2, Rust 1.80.1) | 1.80.1 | — |
| Android Rust targets (4 targets) | ENV-02, `tauri android dev` | No — none installed | — | `rustup target add` (simple, fast) |
| pnpm | SCAF-01 | Yes (via workspace) | 10.x | — |
| Node.js 24+ | SCAF-01 | Inferred from monorepo | 24+ | — |
| USB-connected Android device or emulator | SCAF-02, D-29 | Unknown at research time | — | Android emulator via Android Studio |

**Missing dependencies with no fallback:**
- Android Studio / Android SDK — ENV-01 requires this before any Android work. No workaround.
- Android NDK — Required for Rust cross-compilation. Part of Android Studio SDK Manager install.
- JAVA_HOME — Required for Gradle (Android build system). Provided by Android Studio's bundled JBR.

**Missing dependencies with fallback:**
- Android Rust targets — Missing but trivially added: `rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android` (~2 minutes once SDK is present).
- Physical Android device — Can use Android emulator if no device is available.

**Planning implication:** Wave 0 of the plan MUST be Android environment verification and setup (Studio + SDK + NDK + Rust targets). All subsequent waves depend on this completing successfully.

---

## Common Pitfalls

### Pitfall 1: `tauri add` Broken in pnpm Workspaces

**What goes wrong:** Running `pnpm tauri add store` in a pnpm workspace context fails or produces incorrect results — it may corrupt `package.json`, install in the wrong scope, or silently no-op.
**Why it happens:** GitHub issue #12706 — `tauri add` doesn't correctly resolve pnpm workspace context.
**How to avoid:** Always install plugins manually:
  1. `pnpm add @tauri-apps/plugin-store` (from `apps/tauri-todo`)
  2. `cargo add tauri-plugin-store` (from `apps/tauri-todo/src-tauri`)
  3. Manually register in `lib.rs` and add capability permission
**Warning signs:** After running `tauri add`, check `package.json` and `Cargo.toml` manually — don't trust that the command succeeded.

### Pitfall 2: JSON5 Config Without Cargo Feature

**What goes wrong:** Creating `tauri.conf.json5` without adding `features = ["config-json5"]` to both `tauri` and `tauri-build` in `Cargo.toml` causes a cryptic build error about unrecognized config file format.
**Why it happens:** JSON5 parsing is an opt-in feature gate in the Tauri crates.
**How to avoid:** When using JSON5 config, always add the feature to both crates:
  ```toml
  tauri-build = { version = "2", features = ["config-json5"] }
  tauri = { version = "2", features = ["config-json5"] }
  ```
**Warning signs:** Cargo build fails with "expected tauri.conf.json" or similar error about configuration file not found.

### Pitfall 3: Logic in `main.rs` Dropped on Mobile

**What goes wrong:** Tauri commands registered in `main.rs` work on desktop but are silently absent on Android.
**Why it happens:** Mobile replaces `main()` with a native entry point. The `main.rs` file is not called.
**How to avoid:** All `Builder::default()`, `.plugin()`, `.invoke_handler()` calls must be inside `lib.rs::run()` with the `#[cfg_attr(mobile, tauri::mobile_entry_point)]` attribute.
**Warning signs:** `invoke()` calls return "command not found" on device but work fine in web browser.

### Pitfall 4: Missing Capability Causes Silent Failure

**What goes wrong:** `store.get()` or `store.set()` calls appear to resolve but return `undefined` or silently fail.
**Why it happens:** Tauri v2 denies all plugin calls that aren't in a capability file. The error is not thrown to JS — it fails at the IPC permission layer.
**How to avoid:** Add `"store:default"` to a capability file targeting `"windows": ["main"]`. For mobile use `platforms: ["iOS", "android"]` and reference `mobile-schema.json`.
**Warning signs:** Plugin JS calls never throw but also never produce results. Check `adb logcat | grep tauri` for permission denial messages.

### Pitfall 5: `gen/` Directory Committed to Git

**What goes wrong:** `tauri android init` generates `src-tauri/gen/` with Android Studio project files. If not gitignored, this adds thousands of auto-generated Gradle files to the repo.
**Why it happens:** The directory is created locally but not automatically gitignored by Tauri's default template.
**How to avoid:** Add `gen/` to the root `.gitignore` before running `tauri android init` (D-10).
**Warning signs:** `git status` shows a flood of untracked files under `src-tauri/gen/` after `tauri android init`.

### Pitfall 6: First Android Build Appears Hung

**What goes wrong:** Running `tauri android dev` for the first time appears to hang at Gradle sync or Rust compilation with no progress visible.
**Why it happens:** First build downloads Gradle wrapper, all Android dependencies, and compiles Rust for 4 targets (aarch64, armv7, i686, x86_64). Total time: 10–30 minutes.
**How to avoid:** Let it run. Do not cancel. Subsequent builds use Cargo and Gradle caches and are much faster.
**Warning signs:** Terminal appears idle but CPU usage is high — compilation is progressing.

### Pitfall 7: HMR Not Working on Physical Device

**What goes wrong:** Code changes don't hot-reload on the device; full page refresh required or no update at all.
**Why it happens:** HMR websocket connects to the dev machine's IP (via `TAURI_DEV_HOST`). If `TAURI_DEV_HOST` is not set, Vite binds HMR to `localhost`, which is not reachable from the Android device.
**How to avoid:** Tauri sets `TAURI_DEV_HOST` automatically when running `tauri android dev`. Verify the Vite config correctly uses `host: host || false` and `hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined`.
**Warning signs:** First load works but code changes don't reflect without `R`efresh key.

---

## Code Examples

### greet Command — Full Implementation

```rust
// src-tauri/src/lib.rs
// Source: tauri-v2 skill SKILL.md + Context7

#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Verification Screen — React Component Skeleton

```typescript
// src/components/verification-screen.tsx
// UI-SPEC: text-xl font-semibold heading, bg-gray-100 cards, blue-700 buttons

import { invoke } from "@tauri-apps/api/core"
import { load } from "@tauri-apps/plugin-store"
import { useState } from "react"

// Platform from Tauri env (available when running in Tauri context)
// Falls back to "web" in plain browser
const platform = import.meta.env.TAURI_ENV_PLATFORM ?? "web"

export function VerificationScreen() {
  const [name, setName] = useState("")
  const [greeting, setGreeting] = useState("— awaiting response —")
  const [storeStatus, setStoreStatus] = useState("— not tested —")
  const [ipcLoading, setIpcLoading] = useState(false)
  const [storeLoading, setStoreLoading] = useState(false)

  const sendGreeting = async () => {
    setIpcLoading(true)
    try {
      const result = await invoke<string>("greet", { name })
      setGreeting(result)
    } catch (e) {
      setGreeting(`IPC error: ${e}. Check logcat.`)
    } finally {
      setIpcLoading(false)
    }
  }

  const testStore = async () => {
    setStoreLoading(true)
    try {
      const store = await load("store.json", { autoSave: false })
      await store.set("test-key", { value: "phase-1-check" })
      await store.save()
      const val = await store.get<{ value: string }>("test-key")
      setStoreStatus(`Write OK / Read OK — ${val?.value}`)
    } catch (e) {
      setStoreStatus(`Store error: ${e}. Check capabilities.`)
    } finally {
      setStoreLoading(false)
    }
  }

  // JSX follows UI-SPEC layout...
  return (
    <main className="min-h-screen bg-white px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-900">Tauri Todo — Verification</h1>

        {/* IPC Section */}
        <section className="bg-gray-100 border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
          <span className="text-sm text-gray-500">IPC Bridge</span>
          <div className="flex gap-2">
            <input
              className="flex-1 h-10 px-3 bg-white border border-gray-200 rounded-md text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              className="h-10 px-4 bg-blue-700 text-white text-sm font-normal rounded-md active:opacity-90 shrink-0 disabled:opacity-50"
              disabled={ipcLoading}
              onClick={sendGreeting}
            >
              {ipcLoading ? "Sending..." : "Send Greeting"}
            </button>
          </div>
          <p className="text-base text-gray-900">{greeting}</p>
        </section>

        {/* Store Section */}
        <section className="bg-gray-100 border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
          <span className="text-sm text-gray-500">Store Plugin</span>
          <button
            className="h-10 px-4 bg-blue-700 text-white text-sm font-normal rounded-md active:opacity-90 disabled:opacity-50 self-start"
            disabled={storeLoading}
            onClick={testStore}
          >
            {storeLoading ? "Testing..." : "Test Store"}
          </button>
          <p className="text-base text-gray-900">{storeStatus}</p>
        </section>

        {/* Environment Info */}
        <section className="bg-gray-100 border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
          <span className="text-sm text-gray-500">Environment</span>
          <p className="text-base text-gray-900">React: {React.version}</p>
          <p className="text-base text-gray-900">Platform: {platform}</p>
        </section>
      </div>
    </main>
  )
}
```

Note: Displaying the Tauri version (D-23) requires either `@tauri-apps/plugin-app` or a Rust command that returns `tauri::VERSION`. The simplest approach is a Rust command:

```rust
#[tauri::command]
fn get_tauri_version() -> &'static str {
    tauri::VERSION
}
```

[ASSUMED — `tauri::VERSION` constant is documented in Tauri API; verify against actual Tauri v2 crate docs]

### tauri.conf.json5 — Minimal Mobile Config

```json5
// src-tauri/tauri.conf.json5
// Source: Context7 / v2.tauri.app/develop/configuration-files
{
  productName: "Tauri Todo",
  version: "0.1.0",
  identifier: "com.monorepo.tauritodo",
  build: {
    beforeDevCommand: "pnpm dev",
    beforeBuildCommand: "pnpm build",
    devUrl: "http://localhost:1420",
    frontendDist: "../dist",
  },
  app: {
    windows: [
      {
        label: "main",
        title: "Tauri Todo",
      },
    ],
    security: {
      capabilities: ["mobile-capability"],
    },
  },
  bundle: {
    active: true,
    icon: ["icons/icon.icns", "icons/icon.ico", "icons/icon.png"],
    android: {
      // Default minSdkVersion is 24 (Android 7.0) — D-28
    },
  },
}
```

### package.json Scripts

```json
{
  "name": "@monorepo-template/tauri-todo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint . --fix",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit",
    "clean": "rimraf dist",
    "test": "vitest run",
    "test:watch": "vitest",
    "android:dev": "tauri android dev",
    "android:build": "tauri android build --apk"
  }
}
```

### Turbo Tasks for Tauri App

The existing `turbo.json` tasks apply automatically to all workspace packages. No new task definitions are needed for standard tasks (`build`, `dev`, `lint`, `typecheck`, `test`, `clean`).

For Tauri-specific tasks, consider whether they fit Turbo's caching model:
- `android:dev` — persistent, no cache (same as `dev`)
- `android:build` — Cargo manages its own cache; Turbo should not cache Tauri-specific build outputs

```json
// Addition to turbo.json tasks — Tauri-specific
{
  "android:dev": {
    "persistent": true,
    "cache": false
  },
  "android:build": {
    "cache": false
  }
}
```

[ASSUMED — Turbo task naming for Tauri commands; verify that Turbo resolves `:` in task names correctly]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tauri.conf.json` allowlist | `capabilities/*.json` permission files | Tauri v2.0 | All plugin calls require explicit capability grants |
| `main.rs` owns app logic | `lib.rs` owns logic, `main.rs` is thin passthrough | Tauri v2.0 (mobile) | Mobile builds require lib.rs pattern |
| `@tauri-apps/api/tauri` import | `@tauri-apps/api/core` import | Tauri v2.0 | v1 `tauri` namespace removed |
| `TAURI_ENV_PLATFORM` for mobile detection in Vite | `TAURI_DEV_HOST` for server binding | Tauri v2 beta → stable | Simpler — set host directly, no regex needed |
| `tauri add <plugin>` in pnpm workspaces | Manual install (cargo add + pnpm add) | Known bug (issue #12706) | Permanent workaround required |

**Deprecated/outdated:**
- `app.get_window()` (v1): Use `app.get_webview_window()` in v2
- `allowlist` in `tauri.conf.json` (v1): Replaced by capabilities system
- `@tauri-apps/api/tauri` (v1): Import from `@tauri-apps/api/core` in v2

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `import.meta.env.TAURI_ENV_PLATFORM` returns platform string at runtime in the WebView | Code Examples, Pattern 6 | Verification screen would show "web" on device instead of "android"; D-23 not fulfilled |
| A2 | `tauri::VERSION` constant is accessible in Tauri v2 Rust crate for displaying version in greet command | Code Examples | Would need `@tauri-apps/plugin-app` instead or hardcoded version string |
| A3 | Turbo handles task names with `:` (e.g., `android:dev`) correctly in `turbo.json` | Code Examples (Turbo tasks) | Tasks may need renamed (e.g., `androidDev`) if Turbo doesn't support `:` in names |
| A4 | The default `tauri android init` generates `gen/` inside `src-tauri/` (not at workspace root) | Project Structure | Gitignore pattern `gen/` at root may need to be `apps/tauri-todo/src-tauri/gen/` |

**If table not empty:** A1 and A2 should be verified when implementation begins by running the app and inspecting the output. A3 can be verified by checking Turbo docs or testing with `turbo run android:dev`. A4 is low-risk — adding both patterns to `.gitignore` is safe.

---

## Open Questions (RESOLVED)

1. **Android Studio installation state on dev machine**
   - What we know: No Android SDK found at `~/Library/Android/sdk/` (macOS default path)
   - What's unclear: Whether Android Studio is installed in a non-default location, or whether it needs to be installed fresh
   - RESOLVED: Plan 01-01 Task 1 includes a human checkpoint for SDK/NDK setup verification and installation

2. **pnpm catalog additions needed for Tauri packages**
   - What we know: `@tauri-apps/cli`, `@tauri-apps/api`, `@tauri-apps/plugin-store` are not in the pnpm catalog
   - What's unclear: Whether these should be added to the workspace catalog (for future Tauri apps) or kept as direct dependencies in `apps/tauri-todo/package.json` only
   - RESOLVED: Plan 01-02 Task 1 keeps them as direct dependencies in `apps/tauri-todo/package.json` — Tauri-specific, no other workspace package needs them

3. **Turbo caching for `android:build`**
   - What we know: Turbo can cache outputs; Cargo has its own cache in `target/`
   - What's unclear: Whether Turbo caching `android:build` would interfere with Cargo's build cache
   - RESOLVED: Plan 01-03 Task 2 sets `"cache": false` for `android:build` in Turbo to let Cargo manage its own caching

---

## Validation Architecture

`nyquist_validation` is `false` in `.planning/config.json` — this section is skipped per configuration.

---

## Security Domain

`security_enforcement` is not explicitly configured — treated as enabled. However, this phase has minimal security surface:

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in Phase 1 |
| V3 Session Management | No | No sessions |
| V4 Access Control | Yes (partial) | Tauri capabilities system — `store:default` only, `core:default` only |
| V5 Input Validation | Minimal | `greet` command accepts any string — appropriate for demo; no injection risk in Rust format! |
| V6 Cryptography | No | Store data is not encrypted (acceptable for local todo data) |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized plugin access | Elevation of Privilege | Capabilities file with minimal permissions (D-35) |
| XSS via IPC | Tampering | Tauri's default CSP; input passed to Rust format! is safe |
| Overly broad capability grants | Elevation of Privilege | Only `core:default` + `store:default` — no fs, shell, http |

---

## Sources

### Primary (HIGH confidence)
- Context7 `/llmstxt/tauri_app_llms-full_txt` — Android prerequisites, Vite config, tauri.conf JSON5, plugin store registration, capabilities, mobile entry point pattern
- `v2.tauri.app/plugin/store/` — Store plugin JS/TS API (`load`, `get`, `set`, `save`)
- `v2.tauri.app/start/prerequisites/` — Android SDK/NDK requirements
- `.agents/skills/tauri-v2/SKILL.md` — lib.rs pattern, capability anti-patterns, command registration
- `.agents/skills/tauri-v2/references/plugin-reference.md` — `store:default` permission string
- `.agents/skills/tauri-v2/references/capabilities-reference.md` — mobile-only capability pattern

### Secondary (MEDIUM confidence)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Locked decisions D-01 through D-48
- `.planning/phases/01-foundation/01-UI-SPEC.md` — Visual contract (Tailwind classes, colors, layout)
- `github.com/tauri-apps/tauri/issues/12706` — Confirmed `tauri add` broken in pnpm workspaces (referenced in CONTEXT.md D-46)

### Tertiary (LOW confidence)
- None — all claims verified via primary or secondary sources, or flagged as [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified against pnpm registry 2026-04-15
- Architecture: HIGH — Vite config and lib.rs patterns verified via Context7 official docs
- Pitfalls: HIGH — `tauri add` bug is documented in CONTEXT.md; JSON5 feature gate verified in Context7; capability model verified in skill reference
- Environment availability: HIGH — shell probes confirmed no Android SDK/targets on this machine

**Research date:** 2026-04-15
**Valid until:** 2026-05-15 (stable Tauri ecosystem; 30-day window appropriate)
