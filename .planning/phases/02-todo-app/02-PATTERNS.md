# Phase 2: Todo App - Pattern Map

**Mapped:** 2026-04-16
**Files analyzed:** 8 (5 new, 3 modified)
**Analogs found:** 8 / 8

---

## File Classification

| New/Modified File | Action | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|--------|------|-----------|----------------|---------------|
| `apps/tauri-todo/src/hooks/use-todos.ts` | CREATE | custom hook (state + async I/O) | CRUD + file-I/O (via store plugin) | `apps/tauri-todo/src/components/verification-screen.tsx` (store I/O) + `packages/ui/src/hooks/use-mobile.ts` (StrictMode-safe effect) | exact (composite) |
| `apps/tauri-todo/src/components/todo-app.tsx` | CREATE | container component | request-response (props down, callbacks up) | `apps/tauri-todo/src/components/verification-screen.tsx` (layout shell) | exact |
| `apps/tauri-todo/src/components/todo-input.tsx` | CREATE | form component | request-response (controlled input → submit) | `verification-screen.tsx` IPC form section (lines 69-94) | exact |
| `apps/tauri-todo/src/components/todo-list.tsx` | CREATE | list wrapper with discriminated state branching | CRUD (render) | `verification-screen.tsx` status-branching section (lines 86-93) | role-match |
| `apps/tauri-todo/src/components/todo-item.tsx` | CREATE | list-item row component | request-response (callback on tap) | No existing row component — closest is `verification-screen.tsx` inline button-in-row pattern (lines 71-85) | role-match |
| `apps/tauri-todo/src/app.tsx` | MODIFY | entry wrapper | passthrough | Current `apps/tauri-todo/src/app.tsx` (1-line swap) | exact |
| `apps/tauri-todo/src/components/verification-screen.tsx` | DELETE | — | — | — | n/a |
| `apps/tauri-todo/src-tauri/src/lib.rs` | MODIFY | Tauri entrypoint (Rust) | config (builder chain) | Current `apps/tauri-todo/src-tauri/src/lib.rs` (lines 1-13) | exact |

**Search scope:** `apps/tauri-todo/src/**`, `apps/tauri-todo/src-tauri/src/**`, `packages/ui/src/**`, `apps/showcase/src/**`

---

## Pattern Assignments

### `apps/tauri-todo/src/hooks/use-todos.ts` (custom hook, CRUD + file-I/O)

**Primary analog:** `apps/tauri-todo/src/components/verification-screen.tsx` — only existing file that uses `@tauri-apps/plugin-store` `load()`, `set()`, `get()`, `save()` sequence on Android.
**Secondary analog:** `packages/ui/src/hooks/use-mobile.ts` — only existing custom hook in the repo; establishes the `useState` + `useEffect` + cleanup shape to mirror.

**Imports pattern** (from `verification-screen.tsx` lines 1-3):

```typescript
import { load } from "@tauri-apps/plugin-store"
import React, { useState } from "react"
```

Mirror this exactly — named import for `load`, no semicolons, named-only imports. For the hook, add `useEffect` and `useRef` alongside `useState`, and add a type-only import for the `Store` class:

```typescript
import { load, type Store } from "@tauri-apps/plugin-store"
import { useEffect, useRef, useState } from "react"
```

> Note: the existing file uses `import React, { useState }` to access `React.version`; the hook does not need the default `React` import since hooks call `useState`/`useEffect`/`useRef` directly.

**Discriminated-union state pattern** (from `verification-screen.tsx` lines 5-15):

```typescript
type IpcState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

type StoreState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; value: string }
  | { status: "error"; message: string }
```

New file mirrors this exactly, substituting `todos: Todo[]` for `message`/`value`:

```typescript
export type Todo = {
  id: string
  text: string
  completed: boolean
}

export type TodosState =
  | { status: "loading" }
  | { status: "ready"; todos: Todo[] }
  | { status: "error"; message: string }
```

Matches CLAUDE.md / typescript.md directive "Use discriminated unions for variant data."

**Store load + get pattern** (from `verification-screen.tsx` lines 43-62, specifically lines 53-57):

```typescript
async function handleStoreTest() {
  if (!isTauriRuntime()) {
    setStoreState({
      status: "error",
      message: "Not running inside Tauri — launch via tauri android dev or tauri dev",
    })
    return
  }
  setStoreState({ status: "loading" })
  try {
    const store = await load("store.json", { autoSave: false, defaults: {} })
    await store.set("test-key", { value: "phase-1-check" })
    await store.save()
    const val = await store.get<{ value: string }>("test-key")
    setStoreState({ status: "success", value: val?.value ?? "read failed" })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    setStoreState({ status: "error", message })
  }
}
```

Copy verbatim:
- `load("store.json", { autoSave: false, defaults: {} })` — same file name, same options
- `store.get<T>(key)` generic syntax
- `err instanceof Error ? err.message : String(err)` — unknown-narrowing pattern

Do **not** copy:
- `isTauriRuntime()` guard — RESEARCH Open Question 2 resolved to let `try/catch` surface web-dev error naturally instead of branching in the hook. Research line 861.
- The `val?.value ?? "read failed"` optional chaining → for todos, use `stored ?? []` to coalesce `Todo[] | undefined`.

**StrictMode-safe useEffect pattern** (from `packages/ui/src/hooks/use-mobile.ts` lines 5-16):

```typescript
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
```

Mirror: empty dependency array `[]`, cleanup return function. Extend for async: wrap async work in inner function (`async function init() { ... }`), `void init()`, and use a `cancelled` flag in cleanup (per RESEARCH Pattern 1, line 291-311).

**Store ref pattern** (no direct analog — derived from RESEARCH Anti-Patterns, line 476):

Hold the `Store` instance in `useRef<Store | null>(null)` — not `useState` — because it is not display data and must persist across StrictMode double-mount without triggering re-renders. The ref is mutated inside the effect after load completes.

**Error handling pattern** (from `verification-screen.tsx` lines 37-40 and 59-61):

```typescript
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  setIpcState({ status: "error", message })
}
```

Copy exactly. Every `try { await store.X() } catch (err)` block in `useTodos` uses this same narrowing. Honors CLAUDE.md "Never use `any` — prefer generics or `unknown`" from `.agents/rules/typescript.md` lines 145-167.

**Note on hook shape:** This is the first custom hook in the `apps/tauri-todo/` app. `use-mobile.ts` is the only hook template anywhere in the repo. The file goes under `apps/tauri-todo/src/hooks/use-todos.ts` (directory to be created). Kebab-case file name (`use-todos.ts`), camelCase function (`useTodos`), named export — mirrors `use-mobile.ts` exactly.

---

### `apps/tauri-todo/src/components/todo-app.tsx` (container component, request-response)

**Analog:** `apps/tauri-todo/src/components/verification-screen.tsx` — sibling component, same directory, same app.

**Imports pattern** (from `verification-screen.tsx` lines 1-3):

```typescript
import { invoke } from "@tauri-apps/api/core"
import { load } from "@tauri-apps/plugin-store"
import React, { useState } from "react"
```

For `todo-app.tsx` (container — no direct store I/O, delegates to hook):

```typescript
import { TodoInput } from "@/components/todo-input"
import { TodoList } from "@/components/todo-list"
import { useTodos } from "@/hooks/use-todos"
```

> Import ordering: external packages first, then `@/*` imports alphabetically (per `perfectionist/sort-imports`, CLAUDE.md line 125). `verification-screen.tsx` line 1-3 demonstrates external imports first alphabetically.

**Layout shell pattern** (from `verification-screen.tsx` lines 64-67):

```typescript
return (
  <main className="min-h-screen bg-white px-4 py-12 flex flex-col items-center">
    <div className="w-full max-w-md flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900">Tauri Todo — Verification</h1>
```

Mirror exactly — same `<main>` tag, same `bg-white`, same `max-w-md` centering, same heading sizing (`text-xl font-semibold text-gray-900`). The only variation per UI-SPEC line 107 is `py-8` (not `py-12`) and `mx-auto` inside the inner div instead of `flex flex-col items-center` on `<main>`:

```typescript
return (
  <main className="min-h-screen bg-white px-4 py-8">
    <div className="w-full max-w-md mx-auto flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-gray-900">Tauri Todo</h1>
```

**Core pattern — props drill from hook to presentational children:**

```typescript
export function TodoApp() {
  const { state, addTodo, toggleTodo, deleteTodo } = useTodos()

  return (
    <main className="min-h-screen bg-white px-4 py-8">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-900">Tauri Todo</h1>
        <TodoInput onAdd={addTodo} disabled={state.status !== "ready"} />
        <TodoList state={state} onToggle={toggleTodo} onDelete={deleteTodo} />
      </div>
    </main>
  )
}
```

Named export (no default), no explicit return type on component (per `.agents/rules/typescript.md` line 114-131), no semicolons, 120-char wrap.

---

### `apps/tauri-todo/src/components/todo-input.tsx` (form component, request-response)

**Analog:** `apps/tauri-todo/src/components/verification-screen.tsx` — IPC form section lines 70-85.

**Controlled input + submit button pattern** (from `verification-screen.tsx` lines 71-85):

```typescript
<div className="flex gap-2">
  <input
    className="flex-1 h-10 px-3 bg-white border border-gray-200 rounded-md text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
    onChange={(e) => setName(e.target.value)}
    placeholder="Enter your name"
    value={name}
  />
  <button
    className="shrink-0 h-10 px-4 bg-blue-700 text-white text-sm font-normal rounded-md active:opacity-90 disabled:opacity-50"
    disabled={ipcState.status === "loading"}
    onClick={handleGreet}
  >
    {ipcState.status === "loading" ? "Sending..." : "Send Greeting"}
  </button>
</div>
```

Copy verbatim the input and button Tailwind classes — they are already the approved UI-SPEC values (UI-SPEC lines 118-122). Changes for Phase 2:
- Wrap in `<form onSubmit={...}>` instead of `<div>` (enables Enter-key submit per UI-SPEC line 177-178)
- `onChange` targets local `text` state (not `name`)
- Add `autoFocus` attribute on input (UI-SPEC line 189)
- `placeholder="Add a todo..."` (UI-SPEC line 199)
- Button label `"Add"` (UI-SPEC line 198)
- Button type `"submit"` (form semantics)
- `disabled` uses `!canSubmit` (composite of parent `disabled` prop + empty text check)

**Local state pattern** (from `verification-screen.tsx` lines 22-24):

```typescript
const [name, setName] = useState("")
```

Mirror: `const [text, setText] = useState("")`.

**Props interface pattern** (no direct analog in tauri-todo — from `.agents/rules/typescript.md` line 64-78, "Prefer optional properties over `T | undefined`"):

```typescript
type TodoInputProps = {
  onAdd: (text: string) => Promise<void>
  disabled: boolean
}

export function TodoInput({ onAdd, disabled }: TodoInputProps) {
```

`PascalCase` type name with `Props` suffix, `type` not `interface` (no inheritance needed; aligns with repo convention — see `packages/ui/src/components/input.tsx` line 5 `React.ComponentProps<"input">`).

**Submit handler pattern** (from `verification-screen.tsx` lines 28-41 — async function with try/catch):

```typescript
async function handleGreet() {
  // ...
  setIpcState({ status: "loading" })
  try {
    const result = await invoke<string>("greet", { name })
    setIpcState({ status: "success", message: result })
  } catch (err) {
    // ...
  }
}
```

Mirror the `async function` declaration style (not `const handleX = async () =>`). For `TodoInput.handleSubmit`, no try/catch needed here — errors bubble up from the hook's `save()`:

```typescript
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  const trimmed = text.trim()
  if (trimmed.length === 0) return
  await onAdd(trimmed)
  setText("")
}
```

---

### `apps/tauri-todo/src/components/todo-list.tsx` (list wrapper, CRUD render)

**Analog:** `apps/tauri-todo/src/components/verification-screen.tsx` — status-branching render section lines 86-93.

**Discriminated-state branching pattern** (from `verification-screen.tsx` lines 86-93):

```typescript
<p className="text-base text-gray-900">
  {ipcState.status === "idle" && <span className="text-gray-500">— awaiting response —</span>}
  {ipcState.status === "loading" && <span className="text-gray-500">— awaiting response —</span>}
  {ipcState.status === "success" && <span className="text-green-600">{ipcState.message}</span>}
  {ipcState.status === "error" && (
    <span className="text-red-600">IPC error: {ipcState.message}. Check logcat.</span>
  )}
</p>
```

The existing pattern uses inline `&&` expressions. RESEARCH Pattern 4 / UI-SPEC recommends early-return `if` branches for `TodoList` (clearer with multi-line JSX):

```typescript
export function TodoList({ state, onToggle, onDelete }: TodoListProps) {
  if (state.status === "loading") {
    return (
      <div className="py-12 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="py-12 flex items-center justify-center">
        <p className="text-sm text-red-600">Could not load todos. Restart the app and try again.</p>
      </div>
    )
  }

  if (state.todos.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center gap-2">
        <p className="text-base font-semibold text-gray-900">No todos yet</p>
        <p className="text-sm text-gray-500">Add your first todo above</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {state.todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}
```

Still honors the discriminated-union narrow (`state.todos` only accessible after `status === "ready"` narrowing via the preceding `return` in the loading/error branches). Copywriting exactly from UI-SPEC lines 199-207.

**Type-only import pattern** (from `.agents/rules/typescript.md` line 191-201):

```typescript
import type { TodosState } from "@/hooks/use-todos"
```

Top-level `import type`, not inline `import { type TodosState }`. Enforced by `@typescript-eslint/consistent-type-imports: error` (CLAUDE.md line 124).

---

### `apps/tauri-todo/src/components/todo-item.tsx` (list row, request-response callbacks)

**Analog:** `apps/tauri-todo/src/components/verification-screen.tsx` — button-in-row pattern (delete/toggle buttons line 78-84 + 98-104).

**Button with active state pattern** (from `verification-screen.tsx` line 98-104):

```typescript
<button
  className="h-10 px-4 bg-blue-700 text-white text-sm font-normal rounded-md active:opacity-90 disabled:opacity-50 self-start"
  disabled={storeState.status === "loading"}
  onClick={handleStoreTest}
>
  {storeState.status === "loading" ? "Testing..." : "Test Store"}
</button>
```

Mirror `active:opacity-90` (mobile touch feedback — NO `hover:` per CLAUDE.md / RESEARCH Anti-Patterns line 481). `type="button"` on non-submit buttons (explicit, prevents accidental form submission — verification-screen omits this because there's no form around the buttons; Phase 2's `TodoItem` buttons live inside an `<li>` which is inside a page with a `<form>`, so explicit `type="button"` is required).

**Conditional class composition** (no direct codebase analog — derived from RESEARCH Code Examples + UI-SPEC lines 143-160):

The existing verification-screen uses inline `&&` for conditional text (`{ipcState.status === "success" && <span className="text-green-600">...`). For `TodoItem` with many conditional classes, extract to const for readability:

```typescript
const toggleClass = todo.completed
  ? "w-6 h-6 shrink-0 rounded-full bg-blue-700 border-2 border-blue-700 flex items-center justify-center active:opacity-90"
  : "w-6 h-6 shrink-0 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center active:opacity-90"

const textClass = todo.completed ? "flex-1 text-base line-through text-gray-400" : "flex-1 text-base text-gray-900"
```

Do **not** import `cn()` from `@monorepo-template/ui` — the `ui` package is explicitly excluded from Phase 2 (UI-SPEC line 22-23, Phase 1 D-14). Raw string ternaries are the approved pattern.

**Type-only import pattern** (same as `todo-list.tsx`):

```typescript
import type { Todo } from "@/hooks/use-todos"
```

**Aria label pattern** (from UI-SPEC lines 205-207, no existing code analog):

```typescript
<button
  aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
  ...
>
```

```typescript
<button aria-label="Delete todo" ...>
```

Add for accessibility — icon-only buttons (checkmark `✓`, delete `×`) must have aria-labels.

---

### `apps/tauri-todo/src/app.tsx` (entry wrapper, passthrough — MODIFY)

**Current file** (`apps/tauri-todo/src/app.tsx` lines 1-5):

```typescript
import { VerificationScreen } from "@/components/verification-screen"

export function App() {
  return <VerificationScreen />
}
```

**Target** (1-line swap — pure import/JSX update):

```typescript
import { TodoApp } from "@/components/todo-app"

export function App() {
  return <TodoApp />
}
```

No pattern work required — structure is identical. The import path uses the `@/*` alias per `apps/tauri-todo/tsconfig.json` line 7.

---

### `apps/tauri-todo/src-tauri/src/lib.rs` (Tauri Rust entry — MODIFY)

**Current file** (`apps/tauri-todo/src-tauri/src/lib.rs` lines 1-13):

```rust
#[tauri::command]
fn greet(name: String) -> Result<String, String> {
    Ok(format!("Hello, {}!", name))
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

**Target** (per RESEARCH Pattern 3 Option B, line 446-452 — cleanest form, no warnings):

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Changes:
1. Delete the entire `greet` function (lines 1-4 of current file)
2. Delete the `.invoke_handler(tauri::generate_handler![greet])` line (line 10 of current file)
3. Keep `.plugin(tauri_plugin_store::Builder::new().build())` — verified Phase 1 registration, needed for Phase 2 persistence
4. Keep `.run(tauri::generate_context!())` and `.expect(...)` lines — unchanged

No analog search needed — this IS the analog, modified in place. The builder chain shape is pre-established.

---

## Shared Patterns

### Authentication
**Not applicable.** No users, no sessions, no auth in this app (RESEARCH Security Domain lines 890-894).

### Error Handling
**Source:** `apps/tauri-todo/src/components/verification-screen.tsx` lines 37-40

```typescript
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  setIpcState({ status: "error", message })
}
```

**Apply to:** every `try/catch` inside `useTodos` (load, save, set). Exactly this narrowing — do NOT use `any`, do NOT use `err.message` directly (unknown errors may not be `Error` instances). Per `.agents/rules/typescript.md` lines 145-167.

No logging library — `console.error` not used (RESEARCH Error Handling — CLAUDE.md line 132-136 "No explicit try-catch patterns found in codebase" — but verification-screen is the precedent for the Phase 2 pattern).

### Validation
**Source:** `apps/tauri-todo/src/components/verification-screen.tsx` — implicit in button `disabled` prop (lines 80, 100).

```typescript
disabled={ipcState.status === "loading"}
```

**Apply to:** `TodoInput` submit button — disable when parent `disabled` is true OR text is empty. Trim whitespace before calling `onAdd` (RESEARCH Pattern 1, line 329; Anti-Patterns line 484). No schema libraries (Zod, Yup) — the only input has one constraint (non-empty after trim) and is enforced inline.

### Tailwind class conventions
**Source:** `verification-screen.tsx` lines 65-121 + UI-SPEC "Tailwind Classes Reference" section (RESEARCH lines 803-823).

**Apply to:** all 4 new components. Use exact class strings from UI-SPEC table — verified as consistent with verification-screen's Phase 1 patterns (same `bg-blue-700`, `border-gray-200`, `active:opacity-90`, `rounded-md`, `h-10`, `focus:ring-2 focus:ring-blue-700`, etc.).

Never use `hover:` — mobile-only design per CLAUDE.md UX rule and RESEARCH Anti-Patterns line 481.

### Named exports + kebab-case files
**Source:** Every file in `apps/tauri-todo/src/` and `packages/ui/src/components/`.

**Apply to:** all 4 new components + 1 hook. Examples:
- `apps/tauri-todo/src/app.tsx` → `export function App()`
- `apps/tauri-todo/src/components/verification-screen.tsx` → `export function VerificationScreen()`
- `packages/ui/src/hooks/use-mobile.ts` → `export function useIsMobile()`
- `packages/ui/src/components/button.tsx` line 50 → `export { Button, buttonVariants }`

No `export default` anywhere in the repo outside config files. Mirror exactly.

### Import ordering
**Source:** `apps/tauri-todo/src/components/verification-screen.tsx` lines 1-3 + ESLint rule `perfectionist/sort-imports: error` (CLAUDE.md line 125).

```typescript
import { invoke } from "@tauri-apps/api/core"
import { load } from "@tauri-apps/plugin-store"
import React, { useState } from "react"
```

External packages sorted alphabetically, then a blank line, then `@/` aliases sorted alphabetically. `import type` comes in its own alphabetic group per ESLint `perfectionist` default.

### Discriminated-union state
**Source:** `verification-screen.tsx` lines 5-15 (IpcState, StoreState).

**Apply to:** `TodosState` in `use-todos.ts`. Same `{ status: "..." } | ...` shape. Mandated by CLAUDE.md / `.agents/rules/typescript.md` lines 17-50.

---

## No Analog Found

Files with no close match in the codebase. Planner should use RESEARCH.md patterns for these.

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `apps/tauri-todo/src/hooks/use-todos.ts` (the **async/store-I/O** aspect specifically) | custom hook | async + file-I/O | `use-mobile.ts` is sync (matchMedia is sync-subscribe); no existing hook combines `useRef<T \| null>` with async `load()`. RESEARCH Pattern 1 (lines 270-350) provides the full template. Composite of `verification-screen.tsx` store API + `use-mobile.ts` effect shape. |
| `apps/tauri-todo/src/components/todo-item.tsx` (the **list-row with callbacks** aspect specifically) | component | event-driven | No `<li>`-based row component in `apps/tauri-todo/` or `apps/showcase/src/` (showcase uses the UI package's `Item` primitive, which is excluded from Phase 2 per UI-SPEC line 22-23). RESEARCH Code Examples section (lines 737-776) provides the template. |
| `apps/tauri-todo/src/hooks/` (the **directory** itself) | config | — | Directory does not exist yet. Plan must include `mkdir` step (or implicitly via Write tool) before creating `use-todos.ts`. |

---

## Metadata

**Analog search scope:**
- `apps/tauri-todo/src/**/*.{ts,tsx}` — 3 files (app.tsx, main.tsx, components/verification-screen.tsx)
- `apps/tauri-todo/src-tauri/src/**/*.rs` — 2 files (lib.rs, main.rs)
- `apps/tauri-todo/src-tauri/capabilities/*.json` — 2 files (mobile.json, default.json)
- `packages/ui/src/hooks/**/*.ts` — 1 file (use-mobile.ts)
- `packages/ui/src/components/*.tsx` — 54 files (scanned for shape patterns; most not applicable — UI package excluded from Phase 2 imports)
- `apps/showcase/src/**/*.{ts,tsx}` — 10 files (scanned for controlled input + list patterns)

**Files scanned:** ~75

**Key patterns identified:**
- All controllers (well, "containers" in this frontend-only app) use discriminated-union `useState` with early-return or inline `&&` branching
- The only custom hook template in the repo is `use-mobile.ts` (sync pattern) — async hook has no direct analog; compose from `verification-screen.tsx` store-I/O + `use-mobile.ts` effect shape
- Error handling is uniformly `err instanceof Error ? err.message : String(err)` in the only file that has `try/catch` (`verification-screen.tsx`)
- Tailwind classes are used as raw strings (no `cn()` in `apps/tauri-todo/`) — UI package's utilities explicitly excluded per Phase 1 D-14
- Named exports only, kebab-case files, PascalCase components/types, camelCase functions/variables, no semicolons, 120-char wrap — enforced uniformly across repo

**Pattern extraction date:** 2026-04-16
