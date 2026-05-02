# Phase 3: Mobile Polish - Pattern Map

**Mapped:** 2026-04-17
**Files analyzed:** 14 (7 created, 7 modified)
**Analogs found:** 14 / 14

Every new file has a direct analog inside `apps/tauri-todo/**` or `apps/tauri-todo/src-tauri/**`. The phase is polish-only and strictly codebase-internal — no package-wide or monorepo-wide analogs are required. All file paths below are absolute.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `apps/tauri-todo/src/lib/runtime.ts` | utility | transform (pure predicate) | Phase 1 `verification-screen.tsx` @ commit `9c899d9` (deleted in `5b84df8`) | role-match (re-introduction) |
| `apps/tauri-todo/src/lib/haptics.ts` | utility (IPC wrapper) | request-response (JS → Tauri plugin IPC, fire-and-forget) | `apps/tauri-todo/src/hooks/use-todos.ts` (async plugin calls + try/catch + discriminated state) | role-match |
| `apps/tauri-todo/src/lib/haptics.test.ts` | test (unit, library module) | transform | `apps/tauri-todo/src/hooks/use-todos.test.ts` (vi.mock of a `@tauri-apps/*` plugin, async behavior assertions) | role-match |
| `apps/tauri-todo/src/lint/no-hover.test.ts` | test (filesystem lint) | batch (FS grep inside `it`) | `apps/tauri-todo/src/hooks/use-todos.test.ts` (Vitest `describe/it/expect` structure) | partial — no FS-lint test exists yet in the codebase; use Vitest skeleton from `use-todos.test.ts` + node `fs/promises` + `fast-glob`-free recursion |
| `apps/tauri-todo/src/lint/no-ui-pkg.test.ts` | test (filesystem lint) | batch | same as above | partial |
| `apps/tauri-todo/src/lint/capabilities.test.ts` | test (config file lint) | batch (read JSON + Rust + TOML, assert regex/membership) | same as above | partial |
| `apps/tauri-todo/src/components/todo-app.test.tsx` | test (component) | CRUD (render + DOM assert) | `apps/tauri-todo/src/components/todo-list.test.tsx` (simple `render` + `screen.getByText` without hooks) | exact |
| `apps/tauri-todo/src/components/todo-app.tsx` | component (layout) | request-response (props in, JSX out) | itself (class-only change); secondary analog: current JSX shape | self |
| `apps/tauri-todo/src/components/todo-input.tsx` | component (form) | request-response | itself (class-only bump `h-10` → `h-11`) | self |
| `apps/tauri-todo/src/components/todo-item.tsx` | component (row) | request-response | itself (class-only bump `w-6 h-6` / `w-8 h-8` → `w-11 h-11`) | self |
| `apps/tauri-todo/src/hooks/use-todos.ts` | hook (state + IPC) | CRUD over Tauri store plugin | itself — add `void haptic*()` after each `await save(next)` | self |
| `apps/tauri-todo/src/hooks/use-todos.test.ts` | test (hook) | CRUD assertions | itself — extend with `vi.mock("@/lib/haptics")` + call-order asserts | self |
| `apps/tauri-todo/src/components/todo-input.test.tsx` | test (component) | request-response | itself — add `h-11` className regex assertion | self |
| `apps/tauri-todo/src/components/todo-item.test.tsx` | test (component) | request-response | itself — add `w-11 h-11` className regex assertion | self |
| `apps/tauri-todo/src-tauri/src/lib.rs` | config (Rust entry) | event-driven (app init) | itself — existing `tauri_plugin_store` registration is the analog for the plugin register shape (though haptics requires the `.setup() + #[cfg(mobile)]` variant, **not** the Builder-root form used for store) | role-match |
| `apps/tauri-todo/src-tauri/Cargo.toml` | config (Rust deps) | — | itself — existing `tauri-plugin-store = "2"` in `[dependencies]` is the analog for crate version pinning; **but haptics goes under `[target.'cfg(...)'.dependencies]`**, not plain `[dependencies]` | role-match |
| `apps/tauri-todo/src-tauri/capabilities/mobile.json` | config (permissions) | — | itself — existing `"store:default"` grant is the analog for appending `"haptics:allow-*"` strings | exact |
| `apps/tauri-todo/package.json` | config (JS deps) | — | itself — existing `"@tauri-apps/plugin-store": "2.4.2"` line in `dependencies` is the analog for pinning the new haptics JS package at exact `2.3.2` | exact |

## Pattern Assignments

### `apps/tauri-todo/src/lib/runtime.ts` (utility, transform)

**Analog:** Phase 1 `apps/tauri-todo/src/components/verification-screen.tsx` @ commit `9c899d9` (file deleted in commit `5b84df8` — RESEARCH §Open Questions #3 mandates re-introduction).

**No current file exists to read line-numbers from** — pattern is to be re-introduced verbatim per RESEARCH.md Pattern 3 and CLAUDE-md constraint #2 ("exact `typeof window !== "undefined" && "__TAURI_INTERNALS__" in window` form"). Verbatim shape to copy:

```ts
// apps/tauri-todo/src/lib/runtime.ts — NEW
export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}
```

**Conventions from existing files to carry over:**
- No file-level `"use strict"`, no default export, no BOM, trailing newline (see any `apps/tauri-todo/src/**/*.ts`).
- Prettier `{ semi: false, printWidth: 120 }` — already the project default.
- Explicit return type `: boolean` on a top-level function per `.agents/rules/typescript.md` §"Declare return types on top-level functions".

---

### `apps/tauri-todo/src/lib/haptics.ts` (utility, request-response)

**Analog:** `apps/tauri-todo/src/hooks/use-todos.ts` — the only existing file in this app that (a) imports from a `@tauri-apps/plugin-*` package, (b) wraps async plugin calls, and (c) uses try/catch to absorb failures without breaking UX.

**Imports pattern** (`use-todos.ts` lines 1-4):

```ts
import type { Store } from "@tauri-apps/plugin-store"

import { load } from "@tauri-apps/plugin-store"
import { useEffect, useRef, useState } from "react"
```

Copy conventions: top-level `import type { ... }` separated from runtime imports by a blank line, alphabetical sort (enforced by `perfectionist/sort-imports`), `@tauri-apps/plugin-*` namespaced imports grouped together, `@/` path alias for internal imports. Applied to haptics.ts:

```ts
// apps/tauri-todo/src/lib/haptics.ts — NEW
import { impactFeedback, notificationFeedback, selectionFeedback } from "@tauri-apps/plugin-haptics"

import { isTauriRuntime } from "@/lib/runtime"
```

**Error-handling pattern** (`use-todos.ts` lines 45-57):

```ts
async function save(next: Todo[]) {
  const store = storeRef.current
  if (!store) return
  try {
    await store.set("todos", next)
    await store.save()
    todosRef.current = next
    setState({ status: "ready", todos: next })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    setState({ status: "error", message })
  }
}
```

**Apply to haptics.ts with one key difference: swallow silently, no state mutation** — D-13 mandates haptic failures must never break a CRUD op, so the `catch` block in haptics is empty (no `setState`, no rethrow). This is the *only* divergence from the `use-todos.ts` error pattern.

**Core pattern** (three named exports, one per CRUD intent) — RESEARCH Pattern 3:

```ts
// apps/tauri-todo/src/lib/haptics.ts — NEW
export async function hapticAdd(): Promise<void> {
  if (!isTauriRuntime()) return
  try {
    await impactFeedback("medium")
  } catch {
    // Android vibration support is device-dependent (plugin docs).
    // Never break a CRUD op over a haptic failure.
  }
}

export async function hapticToggle(): Promise<void> {
  if (!isTauriRuntime()) return
  try {
    await selectionFeedback()
  } catch {
    /* swallow */
  }
}

export async function hapticDelete(): Promise<void> {
  if (!isTauriRuntime()) return
  try {
    await notificationFeedback("warning")
  } catch {
    /* swallow */
  }
}
```

**Type literal conventions:** the plugin API accepts literal strings (`"medium"`, `"warning"`). Per `.agents/rules/typescript.md` §"No enums — use `as const` objects", do **not** introduce an `as const` object mapping intensities — the plugin already types these as literal unions (`ImpactFeedbackStyle`, `NotificationFeedbackType`). Just pass the string directly.

---

### `apps/tauri-todo/src/lib/haptics.test.ts` (test, transform)

**Analog:** `apps/tauri-todo/src/hooks/use-todos.test.ts` — the canonical example in this app of mocking a `@tauri-apps/plugin-*` module with `vi.mock`.

**Vi.mock pattern for a Tauri plugin** (`use-todos.test.ts` lines 1-11):

```ts
import type { Store } from "@tauri-apps/plugin-store"

import { load } from "@tauri-apps/plugin-store"
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useTodos } from "@/hooks/use-todos"

vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn(),
}))
```

**Apply to haptics.test.ts** — mock `@tauri-apps/plugin-haptics` listing exactly the three bindings used (`impactFeedback`, `notificationFeedback`, `selectionFeedback`). Example:

```ts
vi.mock("@tauri-apps/plugin-haptics", () => ({
  impactFeedback: vi.fn(async () => undefined),
  notificationFeedback: vi.fn(async () => undefined),
  selectionFeedback: vi.fn(async () => undefined),
}))
```

**beforeEach cleanup pattern** (`use-todos.test.ts` lines 32-34):

```ts
beforeEach(() => {
  vi.clearAllMocks()
})
```

Carry over verbatim so per-test mock call counts are isolated.

**Runtime-guard stubbing:** To test the `isTauriRuntime()` short-circuit, the test file must set/unset `(window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__` in `beforeEach` / `afterEach` (jsdom provides `window` per vitest.config.ts `environment: "jsdom"`). No existing analog in this app — invent the pattern here. Guardrail: no `any` per `.agents/rules/typescript.md` §"Never use `any`" — use `as unknown as T` at the boundary.

**Assertion style** (`use-todos.test.ts` lines 50-75) — `toHaveBeenCalledWith`, `toHaveBeenCalledExactlyOnceWith`, `not.toHaveBeenCalled`:

```ts
expect(double.set).toHaveBeenCalledWith(
  "todos",
  expect.arrayContaining([expect.objectContaining({ text: "Buy milk" })]),
)
expect(double.save).toHaveBeenCalled()
```

Apply to haptics.test.ts call-args assertions: `expect(impactFeedback).toHaveBeenCalledExactlyOnceWith("medium")`, etc.

---

### `apps/tauri-todo/src/lint/no-hover.test.ts` (test, batch)

**Analog:** `apps/tauri-todo/src/hooks/use-todos.test.ts` for the Vitest skeleton (`describe` / `it` / `expect`) — no FS-lint test currently exists in this app.

**Skeleton to copy** (`use-todos.test.ts` lines 5, 36-37):

```ts
import { describe, expect, it } from "vitest"

describe("useTodos", () => {
  it("loads an empty list from a fresh store and transitions to ready", async () => {
    // ...
  })
})
```

**Novel pattern (invent here, apply consistently to all three lint files):** Use Node's `fs/promises` `readdir({ withFileTypes: true, recursive: true })` to walk `src/` and assert no file contains the forbidden pattern. Example shape:

```ts
// apps/tauri-todo/src/lint/no-hover.test.ts — NEW
import { readFile, readdir } from "fs/promises"
import { resolve } from "path"
import { describe, expect, it } from "vitest"

const SRC_DIR = resolve(import.meta.dirname, "..")

async function collectFiles(dir: string, exts: string[]): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true })
  return entries
    .filter((e) => e.isFile() && exts.some((x) => e.name.endsWith(x)))
    .map((e) => resolve(e.parentPath ?? dir, e.name))
}

describe("no hover utilities in apps/tauri-todo/src", () => {
  it("does not use Tailwind hover: utilities anywhere in src/", async () => {
    const files = await collectFiles(SRC_DIR, [".ts", ".tsx", ".css"])
    const offenders: string[] = []
    for (const file of files) {
      if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue
      const content = await readFile(file, "utf8")
      if (/\bhover:/.test(content)) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })
})
```

**Conventions applied:**
- `import.meta.dirname` — Node 24 gives this for free (per `engines.node: >= 24`).
- Explicit return type on the helper per `.agents/rules/typescript.md`.
- Exclude test files from the grep so the lint test itself (which contains the string `"hover:"` as a literal) does not self-flag.
- `noUncheckedIndexedAccess` awareness — `offenders` is `string[]`, indexing it elsewhere would return `string | undefined`.

---

### `apps/tauri-todo/src/lint/no-ui-pkg.test.ts` (test, batch)

**Analog:** Same as `no-hover.test.ts` above — reuse the `collectFiles` helper shape.

**Pattern delta:** search scope includes `package.json` this time, and the forbidden string is `@monorepo-template/ui` (exact literal). Grep must fire on both source files and the `dependencies` / `devDependencies` blocks of `package.json`:

```ts
// apps/tauri-todo/src/lint/no-ui-pkg.test.ts — NEW (excerpt)
const PKG_JSON = resolve(import.meta.dirname, "../../package.json")
const srcFiles = await collectFiles(SRC_DIR, [".ts", ".tsx"])
const pkg = JSON.parse(await readFile(PKG_JSON, "utf8"))
const allDeps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) }
expect(Object.keys(allDeps)).not.toContain("@monorepo-template/ui")
```

**Conventions carried over from `use-todos.test.ts`:** Vitest imports, describe/it structure, `expect(...).toEqual` / `.toContain`.

---

### `apps/tauri-todo/src/lint/capabilities.test.ts` (test, batch)

**Analog:** Same file-walk + assertion pattern as the two lint tests above, but targets three specific files in `src-tauri/`.

**File targets (absolute, derived from `import.meta.dirname`):**
- `apps/tauri-todo/src-tauri/capabilities/mobile.json`
- `apps/tauri-todo/src-tauri/src/lib.rs`
- `apps/tauri-todo/src-tauri/Cargo.toml`

**Assertion shape (per RESEARCH §Validation Architecture → Test Map UX-04 rows):**

```ts
// apps/tauri-todo/src/lint/capabilities.test.ts — NEW (sketch)
import { readFile } from "fs/promises"
import { resolve } from "path"
import { describe, expect, it } from "vitest"

const SRC_TAURI = resolve(import.meta.dirname, "../../src-tauri")

describe("haptics install integrity", () => {
  it("capabilities/mobile.json grants all three haptics:allow-* permissions", async () => {
    const raw = await readFile(resolve(SRC_TAURI, "capabilities/mobile.json"), "utf8")
    const json = JSON.parse(raw) as { permissions: string[] }
    expect(json.permissions).toContain("haptics:allow-impact-feedback")
    expect(json.permissions).toContain("haptics:allow-notification-feedback")
    expect(json.permissions).toContain("haptics:allow-selection-feedback")
  })

  it("lib.rs registers haptics inside a mobile-gated setup block", async () => {
    const rs = await readFile(resolve(SRC_TAURI, "src/lib.rs"), "utf8")
    expect(rs).toMatch(/\.setup\(\s*\|app\|/)
    expect(rs).toMatch(/#\[cfg\(mobile\)\]/)
    expect(rs).toMatch(/tauri_plugin_haptics::init\(\)/)
  })

  it("Cargo.toml declares tauri-plugin-haptics under a mobile target cfg", async () => {
    const toml = await readFile(resolve(SRC_TAURI, "Cargo.toml"), "utf8")
    expect(toml).toMatch(/\[target\.'cfg\(any\(target_os = "android", target_os = "ios"\)\)'\.dependencies\]/)
    expect(toml).toMatch(/tauri-plugin-haptics\s*=\s*"2\.3\.2"/)
  })
})
```

Note the RESEARCH Validation Architecture table lumps this with `src/lint/capabilities.test.ts`. Keeping all three `it` cases in one file is fine and matches the Phase 2 practice of one describe per subject.

---

### `apps/tauri-todo/src/components/todo-app.test.tsx` (test, CRUD)

**Analog:** `apps/tauri-todo/src/components/todo-list.test.tsx` — the only test in this app that renders a component with discriminated-union state props *without* invoking the `useTodos` hook. `TodoApp` itself wraps the hook and would need the hook mocked, but the test can render the layout directly or mock `useTodos`.

**Pattern to copy** (`todo-list.test.tsx` lines 1-6, 8-11):

```tsx
import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { TodoList } from "@/components/todo-list"

const noop = vi.fn(async () => undefined)

describe("TodoList", () => {
  it("renders the loading copy when state.status is 'loading'", () => {
    render(<TodoList onDelete={noop} onToggle={noop} state={{ status: "loading" }} />)
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })
})
```

**Apply to todo-app.test.tsx** — because `TodoApp` calls `useTodos()` internally, either:
1. Mock `@/hooks/use-todos` (preferred — matches the `vi.mock("@tauri-apps/plugin-store", ...)` pattern from `use-todos.test.ts`), OR
2. Mock `@tauri-apps/plugin-store` the same way `use-todos.test.ts` does and let the real hook run.

**Test goal (SAFE-1 row in RESEARCH Validation table):** render `<TodoApp />`, grab the `<main>` element by role or by `querySelector("main")`, assert `className` contains `pt-[max(2rem,env(safe-area-inset-top))]` and `pb-[max(2rem,env(safe-area-inset-bottom))]`. Example:

```tsx
const main = container.querySelector("main")
expect(main?.className).toContain("pt-[max(2rem,env(safe-area-inset-top))]")
expect(main?.className).toContain("pb-[max(2rem,env(safe-area-inset-bottom))]")
```

---

### `apps/tauri-todo/src/components/todo-app.tsx` (component, request-response) — MODIFIED

**Analog:** itself (pre-Phase-3 file). Only the `<main>` className string changes.

**Current pattern** (`todo-app.tsx` line 9):

```tsx
<main className="min-h-screen bg-white px-4 py-8">
```

**Post-Phase-3 pattern** (UI-SPEC §Spacing → Safe-area + RESEARCH Pattern 4):

```tsx
<main className="min-h-screen bg-white px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
```

No import changes, no JSX structural changes. `py-8` (the current floor) is replaced by explicit `pt-[...]` + `pb-[...]` with a `max(2rem, ...)` to preserve the 2rem floor on no-notch devices (Pitfall 5).

---

### `apps/tauri-todo/src/components/todo-input.tsx` (component, request-response) — MODIFIED

**Analog:** itself (pre-Phase-3 file). Class-string-only change.

**Current** (`todo-input.tsx` lines 25, 31):

```tsx
<input className="flex-1 h-10 px-3 bg-white border border-gray-200 rounded-md text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
<button className="shrink-0 h-10 px-4 bg-blue-700 text-white text-sm font-normal rounded-md active:opacity-90 disabled:opacity-50" />
```

**After** (D-02, D-03 + RESEARCH Pattern 1):

```tsx
<input className="flex-1 h-11 px-3 bg-white border border-gray-200 rounded-md text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700" />
<button className="shrink-0 h-11 px-4 bg-blue-700 text-white text-sm font-normal rounded-md active:opacity-90 disabled:opacity-50" />
```

Only `h-10` → `h-11` on both elements. All other classes preserved verbatim. No new imports, no JSX structure change.

---

### `apps/tauri-todo/src/components/todo-item.tsx` (component, request-response) — MODIFIED

**Analog:** itself (pre-Phase-3 file).

**Current toggle** (`todo-item.tsx` lines 10-12):

```tsx
const toggleClass = todo.completed
  ? "w-6 h-6 shrink-0 rounded-full bg-blue-700 border-2 border-blue-700 flex items-center justify-center active:opacity-90"
  : "w-6 h-6 shrink-0 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center active:opacity-90"
```

**After** (D-04): both branches switch `w-6 h-6` → `w-11 h-11`. UI-SPEC notes the inner checkmark `<span className="text-white text-xs">✓</span>` may scale to `text-sm` or `text-base` for visual balance inside the larger container (Claude's discretion).

**Current delete** (`todo-item.tsx` lines 28-34):

```tsx
<button
  aria-label="Delete todo"
  className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md text-gray-400 active:opacity-90 active:text-red-600"
  ...
>
  <span className="text-xl leading-none">×</span>
</button>
```

**After** (D-05): `w-8 h-8` → `w-11 h-11`. `active:opacity-90 active:text-red-600` preserved verbatim (phase 2 press pattern; UI-SPEC enumerates this as a destructive-palette rule). `×` glyph stays `text-xl`.

No new imports, no JSX structure change, no aria-label change.

---

### `apps/tauri-todo/src/hooks/use-todos.ts` (hook, CRUD) — MODIFIED

**Analog:** itself. Pattern delta is adding `void hapticX()` *after* each `await save(next)` resolves.

**Imports delta** — add one line to the existing block (lines 1-4):

```ts
import { hapticAdd, hapticDelete, hapticToggle } from "@/lib/haptics"
```

Must be alphabetically sorted within its import group by `perfectionist/sort-imports`.

**CRUD function pattern delta** (`use-todos.ts` lines 59-77 → RESEARCH Pattern 3):

```ts
async function addTodo(text: string) {
  if (!storeRef.current) return
  const trimmed = text.trim()
  if (trimmed.length === 0) return
  const next: Todo[] = [...todosRef.current, { id: crypto.randomUUID(), text: trimmed, completed: false }]
  await save(next)
  void hapticAdd()   // fire-and-forget; save() has already succeeded
}

async function toggleTodo(id: string) {
  if (!storeRef.current) return
  const next = todosRef.current.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
  await save(next)
  void hapticToggle()
}

async function deleteTodo(id: string) {
  if (!storeRef.current) return
  const next = todosRef.current.filter((t) => t.id !== id)
  await save(next)
  void hapticDelete()
}
```

**Correctness constraints (from RESEARCH §Common Pitfalls):**
- Haptic call MUST be *after* `await save(next)` resolves — Pitfall 6 forbids firing on intent.
- Haptic MUST NOT fire when `save()` transitions state to `"error"`. The `save()` function currently swallows errors internally and sets state to `"error"`; it does not throw. **Gap:** with the current `save()` shape, `await save(next)` always resolves, so the haptic would fire even on save-failure. To meet the D-10 "successful add" semantic and the UX-04 test "Haptic NOT called when save() throws" (RESEARCH Validation row), `save()` must either (a) return a success boolean, or (b) throw on failure with the CRUD wrappers catching. Planner should call this out as a small refactor within the same plan.
- Use `void hapticX()` not `await hapticX()` — Pitfall 4 "Don't `await` haptic calls in a way that blocks the UI".

---

### `apps/tauri-todo/src/hooks/use-todos.test.ts` (test, CRUD) — MODIFIED

**Analog:** itself. Extend with haptics-mocking pattern adapted from the `vi.mock("@tauri-apps/plugin-store", ...)` style already used in this file.

**Pattern delta — add module mock** (follow the existing `vi.mock("@tauri-apps/plugin-store", ...)` on line 9):

```ts
vi.mock("@/lib/haptics", () => ({
  hapticAdd: vi.fn(async () => undefined),
  hapticToggle: vi.fn(async () => undefined),
  hapticDelete: vi.fn(async () => undefined),
}))
```

**Pattern delta — call-order assertions** (follow the existing `expect(double.save).toHaveBeenCalled()` assertions on lines 74, 129, 173):

```ts
// In the addTodo test case (around line 57-75):
await act(async () => { await result.current.addTodo("  Buy milk  ") })
expect(double.save).toHaveBeenCalled()
expect(hapticAdd).toHaveBeenCalledTimes(1)
expect(hapticToggle).not.toHaveBeenCalled()
expect(hapticDelete).not.toHaveBeenCalled()
```

Add analogous asserts to the toggle (line 110+) and delete (line 151+) test cases.

**New test case — haptic does not fire on save failure** (new `it` block, mirrors the error-case test on lines 176-186):

```ts
it("does not fire hapticAdd when the store save fails", async () => {
  const double = createStoreDouble()
  double.save = vi.fn(async () => { throw new Error("disk full") })
  vi.mocked(load).mockResolvedValue(double as unknown as Store)
  // ... renderHook, waitFor ready, addTodo ...
  expect(hapticAdd).not.toHaveBeenCalled()
})
```

This depends on the `use-todos.ts` refactor called out above (save-failure propagation).

---

### `apps/tauri-todo/src/components/todo-input.test.tsx` (test, request-response) — MODIFIED

**Analog:** itself. Add a class-string assertion at the end of the existing `describe` block.

**Pattern delta** (follow existing `expect(button).toBeDisabled()` style on line 48):

```tsx
it("renders input and Add button at 44px (h-11) touch target", () => {
  render(<TodoInput disabled={false} onAdd={vi.fn(async () => undefined)} />)
  const input = screen.getByPlaceholderText("Add a todo...")
  const button = screen.getByRole("button", { name: /add/i })
  expect(input.className).toMatch(/\bh-11\b/)
  expect(button.className).toMatch(/\bh-11\b/)
  expect(input.className).not.toMatch(/\bh-10\b/)
  expect(button.className).not.toMatch(/\bh-10\b/)
})
```

**Word-boundary regex:** `\bh-11\b` avoids false positives on hypothetical `h-110` etc. Existing test style uses `toBeDisabled()` / `toHaveValue()` — no prior className-regex precedent in this app, so invent the pattern here and reuse in `todo-item.test.tsx`.

---

### `apps/tauri-todo/src/components/todo-item.test.tsx` (test, request-response) — MODIFIED

**Analog:** itself. Same extension pattern as `todo-input.test.tsx` above.

**Pattern delta** — add the asserts at the end of the existing `describe` block. Must cover both the completed and incomplete toggle variants plus the delete button:

```tsx
it("renders toggle at 44px (w-11 h-11) when incomplete", () => {
  render(
    <TodoItem
      onDelete={vi.fn(async () => undefined)}
      onToggle={vi.fn(async () => undefined)}
      todo={makeTodo({ completed: false })}
    />,
  )
  const toggle = screen.getByRole("button", { name: "Mark as complete" })
  expect(toggle.className).toMatch(/\bw-11\b/)
  expect(toggle.className).toMatch(/\bh-11\b/)
})

it("renders toggle at 44px (w-11 h-11) when completed", () => { /* same with completed: true */ })

it("renders delete button at 44px (w-11 h-11)", () => {
  // ... screen.getByRole("button", { name: /delete todo/i }) ...
  // assert className matches w-11 and h-11, not w-8 or h-8
})
```

---

### `apps/tauri-todo/src-tauri/src/lib.rs` (config, event-driven) — MODIFIED

**Analog:** itself (existing 7-line file). Current registration is the shape for a cross-platform plugin; haptics requires a mobile-gated `.setup()` block.

**Current** (`src-tauri/src/lib.rs` lines 1-7):

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**After** (RESEARCH Pattern 2 + Pitfall 1):

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(mobile)]
            app.handle().plugin(tauri_plugin_haptics::init())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Correctness constraints:**
- Store plugin stays at Builder-root (cross-platform crate).
- Haptics MUST live inside `.setup() + #[cfg(mobile)]` — Pitfall 1 explains the desktop-host build break if placed at root.
- `app.handle().plugin(...)` returns `Result<_, _>`; the `?` operator propagates errors out of the closure. The closure returns `Ok(())` on the non-mobile path because `#[cfg(mobile)]` gates the entire line.

---

### `apps/tauri-todo/src-tauri/Cargo.toml` (config) — MODIFIED

**Analog:** itself. The existing `tauri-plugin-store = "2"` entry on line 15 is the analog for version-pinning a Tauri plugin crate, but it lives under plain `[dependencies]` because store is cross-platform. Haptics must go under a target-cfg section.

**Current** (`Cargo.toml` lines 13-18):

```toml
[dependencies]
tauri = { version = "2", features = ["config-json5"] }
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
```

**After** — append a new section at the end of the file:

```toml
[target.'cfg(any(target_os = "android", target_os = "ios"))'.dependencies]
tauri-plugin-haptics = "2.3.2"
```

**Correctness constraints:**
- Exact version `"2.3.2"` — RESEARCH §Standard Stack pins this to match the JS package (pinned in `package.json` below).
- The target string must be literally `cfg(any(target_os = "android", target_os = "ios"))` — CLAUDE-md constraint #5.
- Do NOT add haptics to plain `[dependencies]` — it breaks desktop host builds (Pitfall 1).

---

### `apps/tauri-todo/src-tauri/capabilities/mobile.json` (config) — MODIFIED

**Analog:** itself. The existing `"store:default"` permission on line 8 is the exact analog for appending plugin permission strings to the `permissions` array.

**Current** (`capabilities/mobile.json` lines 6-9):

```json
"permissions": [
  "core:default",
  "store:default"
]
```

**After** (D-09):

```json
"permissions": [
  "core:default",
  "store:default",
  "haptics:allow-impact-feedback",
  "haptics:allow-notification-feedback",
  "haptics:allow-selection-feedback"
]
```

**Correctness constraints (Pitfall 3):**
- Exact literal strings — no typos. The `allow-` prefix is mandatory.
- Do NOT use the broader `"haptics:default"` grant — UI-SPEC §Accessibility / Security Domain enforces least-privilege.
- Do NOT add `"haptics:allow-vibrate"` — we don't call `vibrate()`, so granting it would violate least-privilege.
- Keep `"platforms": ["iOS", "android"]` verbatim — UI-SPEC §Platform Contract wants the file iOS-ready even though iOS work is v2 scope.

---

### `apps/tauri-todo/package.json` (config) — MODIFIED

**Analog:** itself. Existing `"@tauri-apps/plugin-store": "2.4.2"` line in `dependencies` (line 20) is the exact pattern: exact-version pin (no caret), listed alongside other `@tauri-apps/*` runtime deps.

**Current** (`package.json` lines 18-24):

```json
"dependencies": {
  "@tauri-apps/api": "2.10.1",
  "@tauri-apps/plugin-store": "2.4.2",
  "react": "catalog:",
  "react-dom": "catalog:",
  "tailwindcss": "catalog:"
}
```

**After** — add one line, alphabetically sorted within `@tauri-apps/*` group:

```json
"dependencies": {
  "@tauri-apps/api": "2.10.1",
  "@tauri-apps/plugin-haptics": "2.3.2",
  "@tauri-apps/plugin-store": "2.4.2",
  ...
}
```

**Correctness constraints:**
- Install via `pnpm add @tauri-apps/plugin-haptics@2.3.2` from the `apps/tauri-todo` directory — NEVER `npm install` (CLAUDE-md constraint #1; pre-tool-use hook blocks `npm`).
- Exact-pin `"2.3.2"` (no caret) — matches the crate version in `Cargo.toml` (RESEARCH §Open Question 2).
- Do NOT run `pnpm tauri add haptics` (Pitfall 4, the CLI hangs/corrupts in pnpm workspaces).

---

## Shared Patterns

### Tauri Plugin Install Playbook (manual, 4-file shape)

**Source:** Phase 1 D-46 / D-47 (store plugin install) + RESEARCH §Pattern 2.
**Apply to:** All four install-related files in this phase (`package.json`, `Cargo.toml`, `lib.rs`, `capabilities/mobile.json`).

The playbook is a fixed sequence, already proven by the Phase 1 store-plugin install. Execute in order:

1. `cd apps/tauri-todo && pnpm add @tauri-apps/plugin-haptics@2.3.2` — JS side.
2. Edit `src-tauri/Cargo.toml` — append `[target.'cfg(...)'.dependencies]` section with exact-pinned crate.
3. Edit `src-tauri/src/lib.rs` — register inside `.setup() + #[cfg(mobile)]`.
4. Edit `src-tauri/capabilities/mobile.json` — append the three `haptics:allow-*` permissions.

Verification sequence: `cd src-tauri && cargo check --target aarch64-linux-android` (RESEARCH §Open Question 1) confirms the mobile-target build. No host `cargo check`.

### Error-Swallow Wrapper Around IPC

**Source:** Adapted from `apps/tauri-todo/src/hooks/use-todos.ts` lines 45-57 (`save` try/catch) with D-13 divergence (no state mutation in catch).
**Apply to:** `src/lib/haptics.ts` — every plugin call inside the three wrappers.
**Shape:**

```ts
if (!isTauriRuntime()) return
try {
  await pluginCall(...)
} catch {
  /* swallow — haptic must never break a CRUD op */
}
```

### Vitest Mocking of `@tauri-apps/plugin-*` Module

**Source:** `apps/tauri-todo/src/hooks/use-todos.test.ts` lines 9-11.
**Apply to:** `src/lib/haptics.test.ts` (mocking `@tauri-apps/plugin-haptics`), extended `src/hooks/use-todos.test.ts` (mocking `@/lib/haptics`).
**Shape:**

```ts
vi.mock("<package-or-alias>", () => ({
  exportedFn: vi.fn(async () => undefined),
  // ... list every binding the module under test actually imports ...
}))

beforeEach(() => {
  vi.clearAllMocks()
})
```

### Filesystem Lint Test Skeleton

**Source:** Invented for this phase (no prior analog in the app) but structured to match the Vitest `describe/it/expect` skeleton from `use-todos.test.ts`.
**Apply to:** `src/lint/no-hover.test.ts`, `src/lint/no-ui-pkg.test.ts`, `src/lint/capabilities.test.ts`.
**Shape:**

```ts
import { readFile, readdir } from "fs/promises"
import { resolve } from "path"
import { describe, expect, it } from "vitest"

const SRC_DIR = resolve(import.meta.dirname, "..")

async function collectFiles(dir: string, exts: string[]): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true })
  return entries
    .filter((e) => e.isFile() && exts.some((x) => e.name.endsWith(x)))
    .map((e) => resolve(e.parentPath ?? dir, e.name))
}
```

Reuse `collectFiles` verbatim across the three lint files (colocate inside each file — three tiny files don't warrant a shared util).

### TypeScript Conventions (from `.agents/rules/typescript.md`)

**Apply to:** All new `.ts` / `.tsx` files (`runtime.ts`, `haptics.ts`, `haptics.test.ts`, three lint tests, `todo-app.test.tsx`).

- **Explicit return types on top-level functions** — `: Promise<void>`, `: boolean`, `: string[]`. Exceptions: React components and hooks (none added this phase). [rule §Functions & Error Handling]
- **`import type` at top level**, not inline `import { type X }`. [rule §Imports & Exports]
- **Named exports only**, no default exports. [rule §Imports & Exports]
- **No `any`** — use `unknown`, generics, or `as unknown as T` at boundaries (e.g., the `window` guard stub in `haptics.test.ts`). [rule §Functions]
- **Discriminated unions over flag soup** — already applied in `TodosState`; carry into any new state type (none planned this phase, but keep in mind). [rule §Types]
- **`noUncheckedIndexedAccess` awareness** — `arr[0]` is `T | undefined`; handle before use. [rule §Types]
- **Prettier: `semi: false, printWidth: 120`** — no trailing semicolons. [project `.prettierrc`]
- **ESLint `perfectionist/sort-imports`** — alphabetical within groups (types, then runtime, then internal `@/`). [project eslint config]

### Press Feedback (carry forward from Phase 2)

**Source:** `apps/tauri-todo/src/components/todo-input.tsx` line 31 (`active:opacity-90`), `todo-item.tsx` lines 11-12 and 29 (`active:opacity-90 active:text-red-600`).
**Apply to:** Preserved verbatim on all enlarged controls (`TodoInput` button, `TodoItem` toggle, `TodoItem` delete). No change — just confirming nothing drops off when class strings grow.

## No Analog Found

None. Every file in this phase has a direct analog inside this app or a Phase-1-established pattern to re-introduce. The closest "no analog" candidates are the three `src/lint/*.test.ts` files (novel FS-grep pattern), but they reuse the Vitest skeleton and `fs/promises` is stdlib — no external pattern needed.

## Metadata

**Analog search scope:**
- `apps/tauri-todo/src/**/*.{ts,tsx,css}`
- `apps/tauri-todo/src-tauri/**/*.{rs,toml,json}`
- `apps/tauri-todo/package.json`
- `apps/tauri-todo/vitest.config.ts`

**Files scanned:** 14 source files + 4 config files + 1 vitest config = 19 files read in full.

**Pattern extraction date:** 2026-04-17

**Phase:** 03-mobile-polish
