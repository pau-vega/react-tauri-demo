---
phase: 01-foundation
reviewed: 2026-04-16T10:30:00Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - .gitignore
  - apps/tauri-todo/eslint.config.ts
  - apps/tauri-todo/index.html
  - apps/tauri-todo/package.json
  - apps/tauri-todo/README.md
  - apps/tauri-todo/src-tauri/build.rs
  - apps/tauri-todo/src-tauri/capabilities/mobile.json
  - apps/tauri-todo/src-tauri/Cargo.toml
  - apps/tauri-todo/src-tauri/src/lib.rs
  - apps/tauri-todo/src-tauri/src/main.rs
  - apps/tauri-todo/src-tauri/tauri.conf.json5
  - apps/tauri-todo/src/app.tsx
  - apps/tauri-todo/src/components/verification-screen.tsx
  - apps/tauri-todo/src/index.css
  - apps/tauri-todo/src/main.tsx
  - apps/tauri-todo/tsconfig.json
  - apps/tauri-todo/vite.config.ts
  - apps/tauri-todo/vitest.config.ts
  - turbo.json
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-04-16T10:30:00Z
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

The Phase 1 foundation establishes a Tauri v2 + React app within the existing pnpm monorepo. The overall structure is correct and follows Tauri v2 conventions: `lib.rs` owns all application logic, `main.rs` is a thin passthrough, capabilities are properly scoped to mobile platforms, and the Vite config is correctly configured for Tauri dev/build flows. The frontend verification screen uses well-structured discriminated union types for state management, consistent with the project's TypeScript rules.

Key concerns: missing Content Security Policy in the Tauri config (security), the `greet` Rust command returns a plain `String` instead of `Result<T, E>` (robustness per Tauri skill rules), and the Vite config uses a deprecated `__dirname` pattern when a Vite 5+ built-in alternative exists.

## Critical Issues

### CR-01: Missing Content Security Policy (CSP) in Tauri Config

**File:** `apps/tauri-todo/src-tauri/tauri.conf.json5:19`
**Issue:** The `app.security` block defines capabilities but does not set a `csp` (Content Security Policy). Without a CSP, the WebView has no restrictions on script sources, style sources, or connection origins. While this is a mobile-only app with no remote content today, the absence of CSP is a security gap -- any future change that loads external resources, or any XSS in a dependency, would have no mitigation. The Tauri v2 skill reference explicitly recommends setting CSP.
**Fix:**
```json5
security: {
  csp: "default-src 'self'; style-src 'self' 'unsafe-inline'",
  capabilities: ["mobile-capability"],
},
```
The `'unsafe-inline'` for `style-src` is needed because Tailwind CSS injects inline styles. Adjust further if the app later loads images or fonts from external origins.

## Warnings

### WR-01: Rust `greet` Command Does Not Return `Result<T, E>`

**File:** `apps/tauri-todo/src-tauri/src/lib.rs:1-4`
**Issue:** The `greet` command returns a plain `String`. The Tauri v2 skill's "Always Do" rules state: "Return `Result<T, E>` from commands for proper error handling." While this trivial command cannot fail today, establishing the `Result` pattern from the start prevents inconsistency as more commands are added. Returning a plain type means the frontend `invoke` call cannot distinguish between a Rust panic and a normal error.
**Fix:**
```rust
#[tauri::command]
fn greet(name: String) -> Result<String, String> {
    Ok(format!("Hello, {}!", name))
}
```

### WR-02: Non-null Assertion on `document.getElementById("root")` Without Fallback

**File:** `apps/tauri-todo/src/main.tsx:7`
**Issue:** `document.getElementById("root")!` uses a non-null assertion. If the `root` element is missing (e.g., a malformed `index.html` or a mobile WebView rendering issue), this will throw an uncaught `TypeError` with no descriptive message, making debugging difficult -- especially on a mobile device where console access requires logcat.
**Fix:**
```tsx
const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Root element #root not found in document. Check index.html.")
}
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### WR-03: Vite Config Uses `__dirname` Instead of `import.meta.dirname`

**File:** `apps/tauri-todo/vite.config.ts:33`
**Issue:** The resolve alias uses `path.resolve(__dirname, "./src")`. In an ESM module (`"type": "module"` in package.json), `__dirname` is not natively available -- it works here only because Vite's config loading shims it. The project's own `eslint.config.ts` already uses the modern `import.meta.dirname` (line 10). Using `__dirname` is inconsistent and relies on Vite internals.
**Fix:**
```ts
resolve: {
  alias: {
    "@": path.resolve(import.meta.dirname, "./src"),
  },
},
```
Apply the same change in `vitest.config.ts` line 15, which also uses `__dirname` via `resolve(__dirname, "./src")`.

## Info

### IN-01: Unused `React` Import in Verification Screen

**File:** `apps/tauri-todo/src/components/verification-screen.tsx:3`
**Issue:** `React` is imported as a named import alongside `useState`. The `React` import is used only on line 104 to access `React.version`. Since React 17+ with the JSX transform, `React` does not need to be in scope for JSX. The import is technically used (for `React.version`), so this is not dead code, but it could be simplified.
**Fix:** This is minor and acceptable as-is since `React.version` is a verification feature. No action required unless the verification screen is removed.

### IN-02: `platform` Variable Computed on Every Render

**File:** `apps/tauri-todo/src/components/verification-screen.tsx:22`
**Issue:** `const platform = import.meta.env.TAURI_ENV_PLATFORM ?? "web"` is computed inside the component body on every render. Since environment variables are static (replaced at build time by Vite), this value never changes. Moving it outside the component would be slightly cleaner, though the cost is negligible.
**Fix:** Move to module scope:
```tsx
const platform = import.meta.env.TAURI_ENV_PLATFORM ?? "web"

export function VerificationScreen() {
  // ...
}
```

---

_Reviewed: 2026-04-16T10:30:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
