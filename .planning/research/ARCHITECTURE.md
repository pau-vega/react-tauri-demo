# Architecture Patterns

**Domain:** Tauri v2 mobile app (React/Vite frontend + Rust core) in a pnpm monorepo
**Researched:** 2026-04-15
**Confidence:** HIGH (Context7 + official Tauri v2 docs + verified community examples)

---

## Recommended Architecture

A Tauri v2 mobile app is a **two-runtime system**: a web frontend (React/Vite running in a native WebView) communicates with a Rust core over a typed IPC bridge. On mobile, the Rust core compiles to a shared library loaded by native shells (Android AAR / iOS xcframework). The frontend and the Rust core are two separate compilation units that happen to live in the same directory.

```
apps/tauri-todo/
├── src/                     # React/Vite frontend
│   ├── main.tsx             # Vite entry point
│   ├── app.tsx
│   └── components/
├── src-tauri/               # Rust project (Cargo)
│   ├── Cargo.toml
│   ├── build.rs             # tauri_build::build()
│   ├── tauri.conf.json      # Tauri config: devUrl, frontendDist, app ID
│   ├── capabilities/        # Security: what JS can call
│   │   └── default.json
│   ├── icons/               # App icons (all sizes)
│   └── src/
│       ├── lib.rs           # Mobile + desktop entry point (shared)
│       └── main.rs          # Desktop-only thin wrapper → calls lib::run()
├── gen/                     # GENERATED — do not hand-edit
│   ├── android/             # Android Studio project (Gradle + Kotlin)
│   │   └── app/src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/{pkg}/  # Generated Java/Kotlin glue
│   │       └── tauri.properties
│   └── apple/               # Xcode project (Swift Package Manager)
│       └── PrivacyInfo.xcprivacy
├── package.json             # Frontend deps + tauri CLI scripts
├── vite.config.ts           # Vite config with TAURI_DEV_HOST support
└── tsconfig.json            # Extends shared tsconfig
```

The `gen/` directory is created by `pnpm tauri android init` and `pnpm tauri ios init`. It is re-generatable and is committed to source control for CI reproducibility, but never manually edited.

---

## Component Boundaries

| Component | Responsibility | Technology | Communicates With |
|-----------|---------------|------------|-------------------|
| **React Frontend** | All UI rendering, user interactions, state management | React 19 + Vite + TypeScript | Rust Core via IPC invoke |
| **Rust Core** (`lib.rs`) | Business logic, command handlers, plugin wiring | Rust + Tauri 2.x | Frontend (IPC), native OS, plugin-store |
| **plugin-store** | Persist todos to device storage as JSON | @tauri-apps/plugin-store (Rust + JS) | Rust Core (registration), Frontend (JS API) |
| **Android Shell** (`gen/android`) | Native Android app wrapper, WebView host | Kotlin + Gradle | Rust Core (compiled as `.so` library) |
| **iOS Shell** (`gen/apple`) | Native iOS app wrapper, WebView host | Swift + SPM | Rust Core (compiled as `.a` library) |
| **Tauri Capabilities** | Security sandbox: allowlist of what JS can invoke | JSON capability files | Frontend (enforced at runtime) |

### Boundary rule
The React frontend never touches the filesystem or device storage directly. All persistence goes through the Tauri IPC bridge to `plugin-store`. The Rust core never directly renders UI — it responds to `invoke` calls and emits events.

---

## Data Flow

### Read path (app startup)

```
App mounts
  → React calls: const store = await load('todos.json')
  → @tauri-apps/plugin-store (JS) sends IPC message over WebView bridge
  → Tauri runtime routes to plugin-store Rust handler
  → plugin-store reads JSON file from device's AppLocalData directory
  → Returns deserialized JSON to JS
  → React sets todos state
  → UI renders list
```

### Write path (add/complete/delete todo)

```
User action (add / toggle / delete)
  → React updates local state immediately (optimistic)
  → React calls: await store.set('todos', updatedTodos)
  → IPC bridge → plugin-store Rust handler writes to in-memory store
  → With autoSave (100ms debounce): persists to disk automatically
  → OR: await store.save() called on explicit action
```

### IPC mechanism

- **JS → Rust**: `invoke('command_name', { arg: value })` — resolves a Promise
- **Rust → JS**: `app.emit('event-name', payload)` — subscription-based
- **plugin-store**: operates purely via `invoke` on the JS side; no custom Rust commands needed for this app — the plugin handles everything

---

## Mobile Build Architecture

### Why `lib.rs` not `main.rs`

On mobile, Tauri compiles the Rust project as a **shared library** (not an executable). The Android and iOS shells load this library at runtime. The mobile entry point is the function annotated with `#[cfg_attr(mobile, tauri::mobile_entry_point)]` in `lib.rs`. The `main.rs` file is only used for desktop and simply calls `app_lib::run()`.

```rust
// src-tauri/src/lib.rs
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
```

### Mobile dev server binding

When developing on a physical device, the Vite dev server must bind to a public IP (not `localhost`). Tauri sets `TAURI_DEV_HOST` automatically. The `vite.config.ts` must consume it:

```typescript
const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  clearScreen: false,
  server: {
    host: host || false,
    port: 1420,
    strictPort: true,
    hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
    watch: { ignored: ['**/src-tauri/**'] },
  },
})
```

---

## Monorepo Integration

### Directory placement

```
apps/
├── showcase/          # Existing Vite+React app
└── tauri-todo/        # New Tauri app (same pattern, adds src-tauri/)
packages/
├── ui/
├── tsconfig/
└── eslint-config/
pnpm-workspace.yaml    # Already covers apps/*
turbo.json             # Needs Tauri task entries
```

The Tauri app is a standard pnpm workspace member. `pnpm-workspace.yaml` already covers `apps/*` so no change needed.

### tauri.conf.json build section

```json
{
  "build": {
    "beforeDevCommand": "pnpm dev",
    "beforeBuildCommand": "pnpm build",
    "devUrl": "http://localhost:1420",
    "frontendDist": "../dist"
  }
}
```

`beforeDevCommand` runs the Vite dev server; Tauri's CLI waits for it to be ready before launching the WebView. This means `pnpm tauri android dev` is self-contained — no separate terminal needed.

### Turbo task wiring

Turbo does not understand Rust/Cargo builds, so Tauri's mobile commands (`tauri android dev`, `tauri ios dev`, `tauri android build`) are invoked directly, not through Turbo. Add them as convenience scripts in the root `package.json`:

```json
{
  "scripts": {
    "tauri": "pnpm --filter tauri-todo tauri"
  }
}
```

Then: `pnpm tauri android dev`, `pnpm tauri ios dev`, `pnpm tauri android build`.

Turbo's `dev` and `build` tasks should **exclude** the Tauri app or mark it as `cache: false` for the dev task, since Tauri manages its own build pipeline via Cargo.

### Shared TypeScript config

The `apps/tauri-todo/tsconfig.json` should extend the shared base:

```json
{
  "extends": "@monorepo-template/tsconfig/base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

The `src-tauri/` directory is excluded from TypeScript — it is a separate Rust project with its own toolchain.

### Rust Cargo workspace

The monorepo does NOT need a root `Cargo.toml` workspace. `apps/tauri-todo/src-tauri/Cargo.toml` is a standalone Cargo project. A root-level `Cargo.toml` with `members = ["apps/tauri-todo/src-tauri"]` can be added for IDE support (e.g., rust-analyzer) but is optional.

---

## Build Order

The following ordering ensures each dependency is ready before its consumer is built:

1. **Install system prerequisites** — Android Studio, NDK, Xcode, CocoaPods, `rustup` targets
   - This is environment setup, not a repo task
   - Must be done once per dev machine before any Tauri commands work

2. **Install JS dependencies** — `pnpm install` at repo root
   - Installs `@tauri-apps/api`, `@tauri-apps/plugin-store`, etc.
   - Turbo-aware: done once, workspace-wide

3. **Scaffold Tauri project** — `pnpm create tauri-app` inside `apps/`
   - Creates `apps/tauri-todo/` with `src-tauri/` and frontend scaffold
   - One-time scaffolding step

4. **Initialize mobile targets**
   - `pnpm tauri android init` → creates `gen/android/`
   - `pnpm tauri ios init` → creates `gen/apple/` (macOS only)
   - Re-runnable if package name changes: `rm -r src-tauri/gen && re-init`

5. **Add plugin-store**
   - `pnpm tauri add store` (inside `apps/tauri-todo/`)
   - Adds Cargo dep + JS dep + capability entry

6. **Build frontend + Rust together**
   - `pnpm tauri android dev` — Tauri orchestrates: runs Vite dev server, compiles Rust for Android targets, launches emulator/device
   - First build takes 10-30 minutes (Cargo downloads + cross-compile)
   - Subsequent builds: incremental, ~1-2 minutes

---

## Scalability Considerations

| Concern | This App | If App Grows |
|---------|----------|--------------|
| State management | React `useState` + plugin-store | Add Zustand or Jotai for complex state |
| Custom Rust commands | None needed (plugin-store handles it) | Add `#[tauri::command]` functions in `lib.rs` |
| Shared UI | Intentionally standalone | Import from `@monorepo-template/ui` later |
| Multiple Rust targets | Not needed | Add via `rustup target add` |
| CI Android build | Requires Linux + Android SDK | Use `ubuntu-latest` GitHub Actions runner |
| CI iOS build | Requires macOS + Xcode | Use `macos-latest` GitHub Actions runner |

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Editing gen/ files manually
**What:** Modifying `gen/android/` or `gen/apple/` directly to add features
**Why bad:** Re-running `tauri android init` regenerates and overwrites changes
**Instead:** Use Tauri plugin system or `tauri.conf.json` to inject config before generation

### Anti-Pattern 2: Using localhost in mobile dev
**What:** Not configuring `TAURI_DEV_HOST` in `vite.config.ts`
**Why bad:** Physical devices cannot reach `localhost` on the dev machine; WebView shows blank screen
**Instead:** Always read `process.env.TAURI_DEV_HOST` and bind Vite to that host

### Anti-Pattern 3: Bypassing IPC for storage
**What:** Using `localStorage`, `IndexedDB`, or `document.cookie` for persistence
**Why bad:** WebView storage can be cleared by the OS; no cross-restart persistence guarantee on mobile
**Instead:** Use `@tauri-apps/plugin-store` which writes to `AppLocalData` (platform-native path)

### Anti-Pattern 4: Putting Rust business logic in main.rs
**What:** Writing command handlers or plugin setup in `main.rs` instead of `lib.rs`
**Why bad:** `main.rs` is the desktop-only entry point; mobile builds only run `lib.rs`
**Instead:** All logic goes in `lib.rs`; `main.rs` is a one-line wrapper

### Anti-Pattern 5: Running tauri dev through Turbo
**What:** Adding `tauri android dev` as a Turbo task with caching
**Why bad:** Turbo's caching model is file-hash based and doesn't understand Cargo's incremental compilation; causes phantom cache hits
**Instead:** Run `pnpm tauri android dev` directly, outside Turbo's task graph

---

## Sources

- [Tauri v2 Project Structure](https://v2.tauri.app/start/project-structure/) — HIGH confidence (official docs)
- [Tauri v2 Develop: Mobile](https://v2.tauri.app/develop/) — HIGH confidence (official docs, Context7 verified)
- [Tauri v2 Prerequisites](https://v2.tauri.app/start/prerequisites/) — HIGH confidence (official docs)
- [Tauri plugin-store](https://v2.tauri.app/plugin/store/) — HIGH confidence (official docs)
- [Tauri CLI Reference: android init / ios init](https://v2.tauri.app/reference/cli/) — HIGH confidence (official docs, Context7 verified)
- [Tauri v2 Calling Rust from Frontend](https://v2.tauri.app/develop/calling-rust/) — HIGH confidence (official docs)
- [Tauri v2 with Next.js Monorepo Guide](https://melvinoostendorp.nl/blog/tauri-v2-nextjs-monorepo-guide) — MEDIUM confidence (community, verified against official patterns)
- [Tauri v2 Next.js Monorepo (GitHub)](https://github.com/Arbarwings/tauri-v2-nextjs-monorepo) — MEDIUM confidence (community reference implementation)
- [Tauri Monorepo Integration Discussion](https://github.com/orgs/tauri-apps/discussions/7368) — MEDIUM confidence (official org discussion)
- [Making Mobile Apps with Tauri (2025)](https://blog.erikhorton.com/2025/08/10/making-mobile-apps-at-the-speed-of-thought-with-tauri.html) — MEDIUM confidence (practitioner post, aligns with official docs)
- Context7 `/llmstxt/tauri_app_llms-full_txt` — HIGH confidence (official Tauri llms.txt, current)
