# Technology Stack

**Project:** React + Tauri v2 Mobile Todo App (`apps/tauri-todo`)
**Researched:** 2026-04-15
**Overall confidence:** HIGH (all versions verified from crates.io, npm registry, and official Tauri docs)

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tauri | 2.10.3 (Rust crate) | Mobile app shell | Only production-ready Rust-based mobile framework with React support; replaces Capacitor/React Native with a Rust backend; native WebView on device, no bundled browser |
| @tauri-apps/cli | 2.10.1 | Build tooling, mobile dev runner | Official CLI — handles `tauri android dev`, `tauri ios dev`, and APK/IPA bundling |
| @tauri-apps/api | 2.10.1 | JS/TS frontend bridge | Core API for invoking Rust commands, events, path utilities, and core IPC from React |
| tauri-build | 2.5.6 (Rust crate) | Rust build dependency | Required in `[build-dependencies]`; generates Tauri metadata at compile time |

**Versioning rule (critical):** `tauri` Rust crate minor version must match `@tauri-apps/cli` minor version. Run `cargo update` in `src-tauri/` to pull latest compatible patch versions.

### Persistence

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| tauri-plugin-store | 2.4.2 (Rust crate) | On-device key-value persistence | Official Tauri plugin; supports Android AND iOS (confirmed from GitHub README v2 branch); persists JSON to app data dir; survives app restarts; zero external dependencies |
| @tauri-apps/plugin-store | 2.4.2 | JS bindings for store plugin | Typed TypeScript API over the Rust plugin; `Store.load()` + `store.set()` / `store.get()` pattern |

**Critical note:** The `@tauri-apps/plugin-store` npm page previously showed no mobile support row, but the GitHub source `plugins-workspace` v2 branch README confirms both Android and iOS are supported (checkmarks in platform table). Confirmed version 2.4.2 on both npm and crates.io.

**Minimum Rust version for plugin-store:** 1.77.2

### Frontend

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | 19.2.5 (from monorepo catalog) | UI rendering | Already in monorepo catalog; Vite + React is Tauri's primary recommended SPA stack |
| Vite | 8.0.8 (from monorepo catalog) | Dev server and bundler | Already in monorepo catalog; Tauri's `beforeDevCommand` and `devUrl` are designed around Vite's dev server on port 5173 |
| TypeScript | 6.0.2 (from monorepo catalog) | Type safety | Monorepo is already on TS6; no conflict |
| @vitejs/plugin-react | 6.0.1 (from monorepo catalog) | Vite React transform | Standard plugin for React SPA in Vite |
| Tailwind CSS | 4.2.2 (from monorepo catalog) | Styling | Already in monorepo catalog; keeps the app standalone from `@monorepo-template/ui` while maintaining visual consistency |
| @tailwindcss/vite | 4.2.2 (from monorepo catalog) | Vite plugin for Tailwind | Already in monorepo catalog |

**Styling decision:** Use Tailwind directly (not `@monorepo-template/ui`) per project requirement for self-contained experiment. This means no Base UI, no CVA dependency — plain Tailwind utility classes are sufficient for a todo app.

### Monorepo Integration

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| pnpm workspaces | 10.29.3 | Package management | Already established in monorepo |
| Turbo | 2.9.6 | Task orchestration | `turbo.json` already has `dev` (persistent), `build`, `typecheck` tasks that Tauri fits into |
| @monorepo-template/tsconfig | workspace:* | Shared TypeScript config | Inherit `tsconfig.base.json` with `esnext` target and `bundler` module resolution — compatible with Vite+Tauri |
| @monorepo-template/eslint-config | workspace:* | Shared ESLint/Prettier | Consistent formatting with rest of monorepo |

---

## Mobile SDK Requirements

### Android

| Requirement | Value | Notes |
|------------|-------|-------|
| Android Studio | Latest stable | Required for SDK manager and emulator; also provides the JDK (bundled JBR) |
| JAVA_HOME | Android Studio's bundled JBR | Set to `/Applications/Android Studio.app/Contents/jbr/Contents/Home` on macOS |
| Android SDK Platform | API 35 (latest) | Install via SDK Manager |
| Android SDK Platform-Tools | Latest | ADB, fastboot |
| NDK (Side by side) | 28+ recommended | NDK 28+ auto-handles 16KB memory page alignment required by new Google Play submissions; older NDK requires manual `.cargo/config.toml` flag |
| Android SDK Build-Tools | Latest | |
| Android SDK Command-line Tools | Latest | Required for `tauri android init` |
| ANDROID_HOME | `$HOME/Library/Android/sdk` (macOS) | Must be set as env var |
| NDK_HOME | `$ANDROID_HOME/ndk/<version>` | Must be set as env var |
| Min SDK version | 24 (Android 7.0) | Tauri default; configurable in `tauri.conf.json` via `bundle.android.minSdkVersion` |

**Rust targets for Android:**
```bash
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

**16KB page alignment** (required for Google Play submission with NDK < 28):
```toml
# .cargo/config.toml
[target.aarch64-linux-android]
rustflags = ["-C", "link-arg=-Wl,-z,max-page-size=16384"]
```

### iOS (macOS host only)

| Requirement | Value | Notes |
|------------|-------|-------|
| Xcode | Latest stable (not Command Line Tools) | Full Xcode required — not CLT alone; download from Mac App Store or developer.apple.com |
| CocoaPods | Latest (via Homebrew) | Required for iOS dependency management; `brew install cocoapods` |
| Homebrew | Latest | Package manager for CocoaPods and other tools |
| iOS deployment target | 14.0 | Tauri default in `tauri.conf.json` (`bundle.iOS.minimumSystemVersion`) |
| Apple Developer account | Free (device testing) / Paid (App Store) | Free account sufficient for device testing via Xcode |

**Rust targets for iOS:**
```bash
rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim
```

### Rust Toolchain

| Requirement | Value | Notes |
|------------|-------|-------|
| Rust | Latest stable | Install via rustup; `rustup default stable` |
| Rust edition | 2021 | Standard for new Tauri projects |
| MSRV | 1.77.2 | Minimum required by tauri-plugin-store; Tauri itself targets latest stable |

---

## Installation Commands

```bash
# Inside apps/tauri-todo directory after scaffolding

# Tauri CLI (dev dependency)
pnpm add -D @tauri-apps/cli@latest

# Core Tauri JS bridge
pnpm add @tauri-apps/api@latest

# Store plugin (JS bindings)
pnpm add @tauri-apps/plugin-store@latest

# React + Vite frontend (use catalog versions from monorepo)
pnpm add react react-dom
pnpm add -D vite @vitejs/plugin-react typescript tailwindcss @tailwindcss/vite
```

```toml
# src-tauri/Cargo.toml

[build-dependencies]
tauri-build = { version = "2", features = [] }

[dependencies]
tauri = { version = "2", features = [] }
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

```bash
# Add Rust mobile targets (one-time setup per machine)
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim
```

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Mobile Framework | Tauri v2 | React Native | Project explicitly tests Tauri — not an alternative |
| Mobile Framework | Tauri v2 | Capacitor | Same reason; also Capacitor wraps Cordova ecosystem |
| Persistence | tauri-plugin-store | localStorage / IndexedDB | WebView storage is not guaranteed to persist on mobile; OS may clear it; plugin-store uses native app data dir which is protected |
| Persistence | tauri-plugin-store | tauri-plugin-sql (SQLite) | Overkill for a simple todo list; SQLite requires schema migration tooling; plugin-store JSON store is sufficient |
| Persistence | tauri-plugin-store | Stronghold plugin | Stronghold is for secrets/keys with encryption overhead; todo data does not need cryptographic protection |
| Styling | Tailwind CSS (direct) | @monorepo-template/ui | Project requirement: self-contained experiment; importing the UI package couples the app to the monorepo component library |
| Styling | Tailwind CSS | CSS Modules | Tailwind is already in monorepo catalog; no additional setup |
| Build Tool | Vite | Webpack / Rspack | Tauri documentation recommends Vite for SPAs; already in monorepo catalog |
| State (in-memory) | React useState | Zustand / Redux | Todo list is trivially simple; useState + useReducer is sufficient; no external store needed |

---

## Tauri Mobile Architecture Notes

- Tauri mobile does NOT bundle Chromium. It uses the device's native WebView (WKWebView on iOS, Android System WebView on Android). This means WebView version varies per device.
- The `src-tauri/` directory lives inside `apps/tauri-todo/` (not at the repo root).
- `tauri.conf.json` `build.devUrl` must point to Vite's dev server: `http://localhost:5173`
- For mobile dev on physical devices, `--host` flag or `TAURI_DEV_HOST` env var is needed so the mobile device can reach the Vite server on the local network.
- iOS dev requires macOS host — cannot build iOS from Linux/Windows.
- Android dev works from macOS, Linux, and Windows.

---

## Monorepo Integration Pattern

The recommended pnpm filter pattern for running Tauri commands from the monorepo root:

```bash
# From monorepo root
pnpm --filter tauri-todo tauri android dev
pnpm --filter tauri-todo tauri ios dev
pnpm --filter tauri-todo tauri android build
pnpm --filter tauri-todo tauri ios build
```

Turbo does NOT directly orchestrate `tauri android dev` / `tauri ios dev` — these are long-lived processes handled directly via pnpm filter. Turbo handles `build`, `typecheck`, `lint` for the frontend portion only.

---

## Sources

- Tauri v2 Release page (verified): https://v2.tauri.app/release/ — tauri@2.10.3, @tauri-apps/cli@2.10.1, @tauri-apps/api@2.10.1 (HIGH confidence)
- crates.io API (verified): tauri@2.10.3, tauri-build@2.5.6, tauri-plugin-store@2.4.2 (HIGH confidence)
- npm registry via pnpm (verified): @tauri-apps/plugin-store@2.4.2, @tauri-apps/api@2.10.1, @tauri-apps/cli@2.10.1 (HIGH confidence)
- tauri-plugin-store GitHub README v2 branch (verified): Android + iOS supported — https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/store (HIGH confidence)
- Tauri prerequisites docs: https://v2.tauri.app/start/prerequisites/ (HIGH confidence)
- Tauri default config (bundle.android.minSdkVersion: 24, bundle.iOS.minimumSystemVersion: "14.0") from Context7 llms-full.txt (HIGH confidence)
- NDK 28+ for 16KB page alignment: https://v2.tauri.app/develop/plugins/develop-mobile/ (HIGH confidence)
- Tauri Google Play distribution: https://v2.tauri.app/distribute/google-play/ (HIGH confidence)
