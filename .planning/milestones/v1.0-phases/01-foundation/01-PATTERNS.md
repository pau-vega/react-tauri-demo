# Phase 1: Foundation - Pattern Map

**Mapped:** 2026-04-15
**Files analyzed:** 14 new files
**Analogs found:** 10 / 14

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `apps/tauri-todo/package.json` | config | — | `apps/showcase/package.json` | exact |
| `apps/tauri-todo/tsconfig.json` | config | — | `apps/showcase/tsconfig.json` | exact |
| `apps/tauri-todo/eslint.config.ts` | config | — | `apps/showcase/eslint.config.ts` | exact |
| `apps/tauri-todo/vite.config.ts` | config | request-response | `apps/showcase/vite.config.ts` | role-match (Tauri adds TAURI_DEV_HOST, port, HMR, envPrefix) |
| `apps/tauri-todo/vitest.config.ts` | config | — | `apps/showcase/vitest.config.ts` | exact |
| `apps/tauri-todo/index.html` | config | — | `apps/showcase/index.html` | role-match (adds viewport-fit=cover) |
| `apps/tauri-todo/src/main.tsx` | component | — | `apps/showcase/src/main.tsx` | exact (no globals.css import) |
| `apps/tauri-todo/src/app.tsx` | component | — | `apps/showcase/src/app.tsx` | exact |
| `apps/tauri-todo/src/index.css` | config | — | `apps/showcase/src/index.css` | exact |
| `apps/tauri-todo/src/components/verification-screen.tsx` | component | request-response | `apps/showcase/src/components/component-example.tsx` | partial (same role, different data flow — adds invoke + store) |
| `apps/tauri-todo/src-tauri/src/main.rs` | utility | — | none (Rust file) | no analog |
| `apps/tauri-todo/src-tauri/src/lib.rs` | service | request-response | none (Rust file) | no analog |
| `apps/tauri-todo/src-tauri/capabilities/mobile.json` | config | — | none | no analog |
| `turbo.json` (modify) | config | — | `turbo.json` (existing) | existing file to extend |

---

## Pattern Assignments

### `apps/tauri-todo/package.json` (config)

**Analog:** `apps/showcase/package.json`

**Scripts pattern** (lines 4–17):
```json
{
  "name": "@monorepo-template/tauri-todo",
  "private": true,
  "version": "0.0.0",
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
    "android:build": "tauri android build"
  }
}
```

**Tauri-specific deviations:**
- Add `@tauri-apps/cli` to `devDependencies` (not in catalog — pin to `2.10.1`)
- Add `@tauri-apps/api` and `@tauri-apps/plugin-store` to `dependencies` (not in catalog — pin to verified versions from RESEARCH.md)
- No `@monorepo-template/ui` dependency — tauri-todo is standalone
- No `e2e` script — Playwright is out of scope for Phase 1
- All shared deps (`react`, `react-dom`, `tailwindcss`, `vite`, `vitest`, `typescript`, `@vitejs/plugin-react`, `@tailwindcss/vite`) use `catalog:` reference

**Catalog reference pattern** (lines 19–49 of showcase/package.json):
```json
"react": "catalog:",
"react-dom": "catalog:",
"tailwindcss": "catalog:",
"vite": "catalog:",
"vitest": "catalog:",
"typescript": "catalog:",
"@vitejs/plugin-react": "catalog:",
"@types/react": "catalog:",
"@types/react-dom": "catalog:"
```

---

### `apps/tauri-todo/tsconfig.json` (config)

**Analog:** `apps/showcase/tsconfig.json` (lines 1–10 — verbatim copy)

```json
{
  "extends": "@monorepo-template/tsconfig/react-app.json",
  "include": ["src", "*.ts"],
  "exclude": ["node_modules"],
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Note:** Copy verbatim. The shared `react-app.json` already sets `jsx: "react-jsx"`, `strict: true`, `noUncheckedIndexedAccess: true`, and `vitest/globals` types (from `packages/tsconfig/react-app.json` lines 1–9).

---

### `apps/tauri-todo/eslint.config.ts` (config)

**Analog:** `apps/showcase/eslint.config.ts` (lines 1–13 — verbatim copy)

```typescript
import { react } from "@monorepo-template/eslint-config"
import { defineConfig } from "eslint/config"

export default defineConfig([
  ...react,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

**Note:** Copy verbatim. No modifications needed.

---

### `apps/tauri-todo/vite.config.ts` (config, request-response)

**Analog:** `apps/showcase/vite.config.ts` — same base shape, extended with Tauri requirements.

**Base pattern** (showcase/vite.config.ts lines 1–14):
```typescript
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
```

**Tauri extensions** (from RESEARCH.md Pattern 3 — VERIFIED against official Tauri v2 docs):
```typescript
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

**Key deviations from showcase analog:**
- `clearScreen: false` — Tauri CLI uses the terminal; Vite must not clear it
- `server.port: 1420` — Fixed port; Tauri's `devUrl` in `tauri.conf.json5` must match
- `server.strictPort: true` — Fail if port is taken (predictability)
- `server.hmr` — Conditional on `TAURI_DEV_HOST`; enables HMR on physical device over LAN
- `server.watch.ignored` — Prevents infinite rebuild loop when Cargo writes to `src-tauri/`
- `envPrefix` — Exposes `TAURI_ENV_*` vars (platform info etc.) to frontend JS
- `build.target: "safari13"` — Android WebView compatibility floor

---

### `apps/tauri-todo/vitest.config.ts` (config)

**Analog:** `apps/showcase/vitest.config.ts` (lines 1–17 — near-verbatim copy)

```typescript
import react from "@vitejs/plugin-react"
import { resolve } from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
    passWithNoTests: true,
  },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
})
```

**Note:** Copy verbatim. `passWithNoTests: true` is important — Phase 1 installs the test harness but does not yet add test files.

---

### `apps/tauri-todo/index.html` (config)

**Analog:** `apps/showcase/index.html` (lines 1–13)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>vite-app</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Required modifications (D-25, D-22):**
- `<meta name="viewport">` must become `content="width=device-width, initial-scale=1, viewport-fit=cover"` — adds `viewport-fit=cover` for mobile safe-area handling
- `<title>` must be `Tauri Todo`
- Icon can keep the default Vite/Tauri SVG or be removed (D-20 uses default Tauri icon)

---

### `apps/tauri-todo/src/main.tsx` (component)

**Analog:** `apps/showcase/src/main.tsx` (lines 1–12)

```typescript
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import { App } from "./app.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Key deviation from showcase:** Do NOT import `@monorepo-template/ui/globals.css` — tauri-todo does not depend on the UI package. Tailwind is configured directly via `@tailwindcss/vite` plugin.

---

### `apps/tauri-todo/src/app.tsx` (component)

**Analog:** `apps/showcase/src/app.tsx` (lines 1–5)

```typescript
import { VerificationScreen } from "@/components/verification-screen"

export function App() {
  return <VerificationScreen />
}
```

**Pattern:** Named export, single-line body delegating to the feature component. Identical shape to showcase's App — just swap `ComponentExample` for `VerificationScreen`.

---

### `apps/tauri-todo/src/index.css` (config)

**Analog:** `apps/showcase/src/index.css`

```css
@import "tailwindcss";
```

**Note:** The tauri-todo app does not consume `@monorepo-template/ui/globals.css` (no UI package dependency), so `index.css` must include the Tailwind directive directly. The showcase's `index.css` is minimal (just a comment) because globals come from the UI package. For tauri-todo, use `@import "tailwindcss"` as the base Tailwind v4 entry.

---

### `apps/tauri-todo/src/components/verification-screen.tsx` (component, request-response)

**Analog:** `apps/showcase/src/components/component-example.tsx` — same component role, but data flow adds Tauri IPC.

**Component structure pattern** (showcase/src/components/component-example.tsx lines 1–47):
```typescript
// Imports: named React hooks + named component imports using @/ alias
import { Tabs, TabsList, TabsTrigger } from "@monorepo-template/ui/components/tabs"
import { FormsExamples } from "@/components/categories/forms"

export function ComponentExample() {
  return (
    <div className="bg-background w-full min-h-screen">
      {/* JSX only — no state, no effects in this file */}
    </div>
  )
}
```

**Tauri IPC pattern to add** (from RESEARCH.md Pattern 5 + SKILL.md Quick Start):
```typescript
import { invoke } from "@tauri-apps/api/core"
import { load } from "@tauri-apps/plugin-store"
import { useState } from "react"

export function VerificationScreen() {
  const [greeting, setGreeting] = useState("")
  const [storeResult, setStoreResult] = useState("")
  const platform = import.meta.env.TAURI_ENV_PLATFORM ?? "web"

  async function handleGreet(name: string) {
    const result = await invoke<string>("greet", { name })
    setGreeting(result)
  }

  async function handleStoreTest() {
    const store = await load("store.json", { autoSave: false })
    await store.set("test-key", { value: "hello from store" })
    await store.save()
    const val = await store.get<{ value: string }>("test-key")
    setStoreResult(val?.value ?? "read failed")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 font-[system-ui]">
      {/* D-23: version/platform info */}
      <p>Platform: {platform}</p>

      {/* D-17: greet IPC section */}
      <input onChange={(e) => handleGreet(e.target.value)} />
      <p>{greeting}</p>

      {/* D-19: store plugin test */}
      <button onClick={handleStoreTest}>Test Store</button>
      <p>{storeResult}</p>
    </div>
  )
}
```

**Styling rules (from RESEARCH.md Anti-Patterns):**
- No `hover:` variants — mobile only, use `active:` instead (D-27, D-18)
- System font stack: `font-[system-ui]` or inline `style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}` (D-21)
- Light-only — no `dark:` variants (D-27)

---

### `apps/tauri-todo/src-tauri/src/main.rs` (utility)

**No analog in codebase** — Rust file, no existing Rust files in repo.

**Pattern from RESEARCH.md Pattern 2 + SKILL.md (VERIFIED):**
```rust
// src-tauri/src/main.rs
// Thin passthrough only — ALL logic lives in lib.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    app_lib::run();
}
```

---

### `apps/tauri-todo/src-tauri/src/lib.rs` (service, request-response)

**No analog in codebase** — Rust file, no existing Rust files in repo.

**Pattern from RESEARCH.md Code Examples + SKILL.md (VERIFIED):**
```rust
// src-tauri/src/lib.rs
// Source: tauri-v2 SKILL.md + RESEARCH.md Pattern 2

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

**Critical rules (from SKILL.md):**
- Every command must appear in `generate_handler![]` — commands absent from the macro silently fail
- `#[cfg_attr(mobile, tauri::mobile_entry_point)]` is required on `pub fn run()` — mobile replaces `main()` with this entry point
- Plugin must be registered via `.plugin()` before `.invoke_handler()`

---

### `apps/tauri-todo/src-tauri/capabilities/mobile.json` (config)

**No analog in codebase** — new Tauri file type.

**Pattern from RESEARCH.md Pattern 4 (VERIFIED against official Tauri v2 docs):**
```json
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

**Note:** The `$schema` path references `gen/schemas/mobile-schema.json` which is generated by `tauri android init`. The file will not exist until after init runs — IDE schema errors before that point are expected and harmless.

**Why `store:default` is required (SKILL.md Anti-Patterns):** Tauri v2 denies all plugin calls by default. Installing `tauri-plugin-store` without this capability causes silent runtime failures — JS calls never resolve, no error thrown.

---

### `turbo.json` (modify — existing file)

**Analog:** `turbo.json` (the file being modified — lines 1–42)

**Existing task structure to preserve:**
```json
{
  "tasks": {
    "build": { "dependsOn": ["^build"], "inputs": ["src/**", "package.json", "tsconfig.json"], "outputs": ["dist/**"] },
    "dev": { "persistent": true, "cache": false },
    "typecheck": { "dependsOn": ["^build"] },
    "lint": { "dependsOn": ["^build"] },
    "test": { "dependsOn": ["^build"], "outputs": ["coverage/**"] }
  }
}
```

**Tauri-specific tasks to add (D-02, D-15):**
```json
"android:dev": {
  "persistent": true,
  "cache": false
},
"android:build": {
  "dependsOn": ["^build"],
  "cache": false
}
```

**Rationale:** `android:dev` is persistent (long-running like `dev`). `android:build` depends on the JS build (`^build`) since Tauri wraps Vite, but is not cached (`cache: false`) because Cargo/Gradle manage their own caches and Turbo cannot observe Rust build outputs.

---

## Shared Patterns

### Named Exports Only
**Source:** `apps/showcase/src/app.tsx`, `apps/showcase/src/components/component-example.tsx`
**Apply to:** All `.tsx` files in `apps/tauri-todo/src/`

```typescript
// Never:
export default function App() { ... }

// Always:
export function App() { ... }
```

### Import Order (ESLint perfectionist/sort-imports enforces this)
**Source:** `apps/showcase/src/components/component-example.tsx` lines 1–9
**Apply to:** All TypeScript/TSX files

```typescript
// 1. External packages (alphabetical)
import { invoke } from "@tauri-apps/api/core"
import { load } from "@tauri-apps/plugin-store"
import { useState } from "react"

// 2. Internal @/ alias imports (alphabetical)
import { VerificationScreen } from "@/components/verification-screen"

// 3. Relative imports
import "./index.css"
```

### `import type` for Type-Only Imports
**Source:** CLAUDE.md conventions
**Apply to:** All TypeScript files

```typescript
// Avoid
import { ComponentProps } from "react"

// Prefer
import type { ComponentProps } from "react"
```

### No Semicolons, 120-char Width
**Source:** `.prettierrc` (root)
**Apply to:** All TypeScript/TSX files

```typescript
// No semicolons at end of statements
const platform = import.meta.env.TAURI_ENV_PLATFORM ?? "web"
```

### Catalog Version References
**Source:** `apps/showcase/package.json` lines 22–49
**Apply to:** `apps/tauri-todo/package.json` for all shared deps

```json
"react": "catalog:",
"react-dom": "catalog:",
"tailwindcss": "catalog:"
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/tauri-todo/src-tauri/src/main.rs` | utility | — | No Rust files exist in the codebase; pattern sourced from RESEARCH.md + SKILL.md |
| `apps/tauri-todo/src-tauri/src/lib.rs` | service | request-response | No Rust files exist; pattern sourced from RESEARCH.md + SKILL.md |
| `apps/tauri-todo/src-tauri/capabilities/mobile.json` | config | — | No Tauri capability files exist; pattern sourced from RESEARCH.md Pattern 4 |
| `apps/tauri-todo/src-tauri/tauri.conf.json5` | config | — | No Tauri config exists; pattern sourced from RESEARCH.md + SKILL.md Configuration Reference |
| `apps/tauri-todo/src-tauri/Cargo.toml` | config | — | No Cargo files exist; pattern sourced from RESEARCH.md Pattern 1 |
| `apps/tauri-todo/src-tauri/build.rs` | config | — | No Rust build scripts exist; single required line from SKILL.md |

**For Cargo.toml** — planner use RESEARCH.md Pattern 1 directly:
```toml
[package]
name = "tauri-todo"
version = "0.1.0"
edition = "2021"

[lib]
name = "app_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = { version = "2", features = ["config-json5"] }

[dependencies]
tauri = { version = "2", features = ["config-json5"] }
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

**For build.rs** — single required line:
```rust
fn main() {
    tauri_build::build()
}
```

---

## Metadata

**Analog search scope:** `apps/showcase/`, `turbo.json`, `pnpm-workspace.yaml`, `.gitignore`, `packages/tsconfig/`, `.planning/phases/01-foundation/01-RESEARCH.md`
**Files scanned:** 13
**Pattern extraction date:** 2026-04-15
