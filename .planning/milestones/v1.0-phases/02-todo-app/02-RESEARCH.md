# Phase 2: Todo App - Research

**Researched:** 2026-04-16 (refreshed)
**Domain:** React CRUD UI + Tauri v2 Store Plugin persistence (Android)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Todo Data Model**
- D-01: Minimal fields only: `id` (string), `text` (string), `completed` (boolean). No timestamps, priorities, categories, or sort order.
- D-02: IDs generated via `crypto.randomUUID()`. Browser-native, no dependencies, available in WebView.
- D-03: Todo type defined as a discriminated-union-friendly interface following existing codebase patterns (see `verification-screen.tsx` IpcState/StoreState).

**Storage**
- D-04: Single key `"todos"` in the Tauri Store holding the full array. Store file: `store.json` (same as Phase 1 verification).
- D-05: Save after every mutation — call `store.save()` after each add/toggle/delete. No debouncing. Matches the `autoSave: false` pattern from Phase 1.
- D-06: Store plugin already installed and registered (JS: `@tauri-apps/plugin-store`, Rust: `tauri_plugin_store`, capability: `store:default`). No new plugin installation needed.

**Component Architecture**
- D-07: Separate components: `TodoApp` (container), `TodoInput` (add form), `TodoList` (list wrapper), `TodoItem` (single row). Each in its own file under `src/components/` using kebab-case naming.
- D-08: Remove the Phase 1 verification screen (`verification-screen.tsx`). It served its purpose — `App.tsx` renders `TodoApp` directly.
- D-09: Remove the `greet` Rust command from `lib.rs`. Phase 2 doesn't need IPC commands — store plugin handles persistence directly from JS.
- D-10: `useTodos` custom hook in `src/hooks/use-todos.ts` encapsulates store load/save and CRUD operations. TodoApp stays presentational.

**Interactions**
- D-11: Add-todo input at the top of the screen with an add button. List below. Input clears after adding.
- D-12: Checkbox (or circle) on the left side of each todo to toggle complete/incomplete. Tap checkbox to toggle.
- D-13: Completed todos stay in place with strikethrough text and dimmed styling. No reordering or hiding.
- D-14: Visible delete button (X or trash icon) on the right side of each todo row. Always visible, no swipe-to-reveal.

**Empty State**
- D-15: Simple centered text message when no todos exist (e.g., "No todos yet"). No illustrations, icons, or animations.

### Claude's Discretion
- Exact Tailwind utility classes for layout and styling
- Loading state while store initializes on app startup
- Keyboard behavior (auto-focus input, submit on Enter)
- Error handling if store fails to load or save

### Deferred Ideas (OUT OF SCOPE)
- Swipe-to-delete gesture — v2 scope (ENH-01)
- Inline todo editing — v2 scope (ENH-02)
- Todo categories or tags — v2 scope (ENH-03)
- Haptic feedback on add/delete — Phase 3 (UX-04)
- Dark mode — Phase 3 territory
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TODO-01 | User can add a new todo item | `useTodos` hook `addTodo()` + `TodoInput` form component + `store.set()` + `store.save()` pattern |
| TODO-02 | User can mark a todo as complete/incomplete | `useTodos` hook `toggleTodo()` + `TodoItem` checkbox button + array map mutation + `store.save()` |
| TODO-03 | User can delete a todo | `useTodos` hook `deleteTodo()` + `TodoItem` delete button + array filter + `store.save()` |
| TODO-04 | Empty state shown when no todos exist | `TodoList` conditional render — `state.status === "ready" && state.todos.length === 0` branch |
| PERS-01 | @tauri-apps/plugin-store installed and registered (JS + Rust) | Already complete from Phase 1 — verified in `package.json` (2.4.2), `Cargo.toml` (`tauri-plugin-store = "2"`), and `lib.rs` builder chain |
| PERS-02 | Todos persist across app restarts | `Store.load("store.json")` on mount, `store.save()` after every mutation via `useTodos` |
| PERS-03 | Store capability granted for mobile platform | Already complete — `capabilities/mobile.json` contains `"store:default"` |
</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

These directives from `./CLAUDE.md` and `.agents/rules/typescript.md` MUST be honored by the planner:

| Constraint | Impact on Phase 2 |
|------------|-------------------|
| TypeScript strict mode + `noUncheckedIndexedAccess` | `store.get<Todo[]>("todos")` returns `Todo[] \| undefined` — must null-coalesce |
| No `any` — use `unknown` or generics | `try { } catch (err)` — `err` is `unknown`, use `err instanceof Error ? err.message : String(err)` |
| Prefer `import type` for type-only imports | `import type { Todo } from "@/hooks/use-todos"` when consumed as type only |
| No default exports | All new files use named exports: `export function TodoApp()`, `export function useTodos()` |
| No semicolons, 120-char lines | `.prettierrc` enforced — existing `verification-screen.tsx` shows the style |
| kebab-case file names | `todo-app.tsx`, `todo-input.tsx`, `todo-list.tsx`, `todo-item.tsx`, `use-todos.ts` |
| PascalCase components, camelCase variables | `TodoApp`, `useTodos`, `addTodo`, `toggleTodo`, `deleteTodo` |
| Discriminated unions over bag-of-optionals | `TodosState` = `{ status: "loading" } \| { status: "ready"; todos: Todo[] } \| { status: "error"; message: string }` |
| No hover states (mobile-only design — UX-02) | Use `active:opacity-90` / `active:text-red-600`, never `hover:` |
| `pnpm` only (monorepo, enforced by hook) | Any ad-hoc install (none expected in Phase 2) must use `pnpm add`, never `npm` |
| GSD workflow enforcement | File edits must happen inside `/gsd-execute-phase`, not ad hoc |

[VERIFIED: reading `./CLAUDE.md` and `.agents/rules/typescript.md` directly]
[VERIFIED: `.planning/config.json` `mode: yolo`, `nyquist_validation: false` — skip Validation Architecture section]

---

## Summary

Phase 2 replaces the Phase 1 verification screen with a four-component React CRUD app backed by the Tauri Store plugin. The entire persistence stack (plugin, Rust registration, Android capability) was completed in Phase 1 and requires zero new installs, zero `Cargo.toml` changes, and no new Rust commands. The only Rust change is removing the now-unused `greet` command.

The work is almost entirely TypeScript/React:
1. One custom hook (`useTodos`) that owns store I/O and exposes synchronous-feeling CRUD
2. Four presentational components (`TodoApp`, `TodoInput`, `TodoList`, `TodoItem`)
3. A one-line swap in `App.tsx` (import `TodoApp` instead of `VerificationScreen`)
4. Deletion of `verification-screen.tsx`
5. Removal of the `greet` command from `lib.rs`

The primary technical risk is the **store initialization race**: `Store.load()` is async and `store.get("todos")` returns `undefined` on first launch. The hook must gate rendering on a loading state and null-coalesce missing keys. The secondary risk is **React StrictMode double-invocation of `useEffect`** — the store instance must live in a `useRef` (not state) and the effect must use a `cancelled` flag in cleanup.

**Primary recommendation:** Build `useTodos` first (Plan 01), then wire presentational components to it (Plan 02), then clean up Phase 1 leftovers (Plan 03). All store-API decisions are settled — build directly from the code examples below.

**Key API correction vs. training knowledge:** `store.get<T>(key)` returns `Promise<T | undefined>`, not `Promise<T | null>`. The null-coalescing pattern `stored ?? []` handles both, but the exact type annotation matters for `noUncheckedIndexedAccess` compliance.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Todo CRUD operations | Frontend (React hook) | — | All mutations happen in JS; no Rust commands needed |
| Persistent storage | Tauri Store Plugin (JS bindings) | Rust `tauri_plugin_store` + Android filesystem | Plugin already bridges JS API to native file I/O; no custom Rust needed |
| UI rendering | Frontend (React components) | — | Pure presentational layer; WebView (Chromium on Android) renders React |
| Rust backend | Passthrough only | — | Only store plugin registration remains; `greet` command removed; no new commands |
| Mobile capability permissions | Tauri capabilities file | — | `mobile.json` already grants `store:default`; no changes needed |
| ID generation | Browser runtime (`crypto.randomUUID()`) | — | Chromium WebView on Android implements Web Crypto natively |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tauri-apps/plugin-store` | 2.4.2 | Key-value persistence to disk | Already installed and verified working on Android in Phase 1 |
| `tauri-plugin-store` (Rust) | ^2 (resolves to 2.4.2) | Native-side implementation of the store plugin | Already in `Cargo.toml`; registered in `lib.rs` builder |
| `@tauri-apps/api` | 2.10.1 | Core Tauri frontend API (only `@tauri-apps/api/core` `invoke` was used Phase 1; Phase 2 may not import it directly) | Already installed |
| `react` / `react-dom` | 19.2.5 | UI rendering | Project pnpm catalog pin |
| `tailwindcss` | 4.2.2 | Utility CSS | Already configured via `@import "tailwindcss"` in `index.css` |
| `typescript` | 5.9.3 | Type safety | Project pnpm catalog pin |

Claim provenance:
- [VERIFIED: pnpm registry — `pnpm view @tauri-apps/plugin-store version` returned `2.4.2` on 2026-04-16]
- [VERIFIED: pnpm registry — `pnpm view react version` returned `19.2.5` on 2026-04-16]
- [VERIFIED: pnpm registry — `pnpm view @tauri-apps/api version` returned `2.10.1` on 2026-04-16]
- [VERIFIED: `apps/tauri-todo/package.json` and `apps/tauri-todo/src-tauri/Cargo.toml` — confirmed already present]
- [VERIFIED: https://docs.rs/tauri-plugin-store/latest — Rust crate 2.4.2]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `crypto.randomUUID()` | Browser native (Web Crypto) | UUID generation for todo IDs | D-02 locked — no library install needed. Available in Chromium WebView on Android. |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `store.save()` after each mutation | `autoSave: 100` (default) or custom debounce | D-05 locked — explicit save-after-every-mutation; matches Phase 1 pattern; deterministic for testing |
| `crypto.randomUUID()` | `nanoid` or timestamp IDs | D-02 locked — browser-native requires no dependency |
| Full array stored at single key | Individual keys per todo | D-04 locked — single key is simpler for small dataset; one `store.set` per mutation |
| Named `load()` import | `Store.load()` static method | Phase 1 used `load()` — keep consistent. Both are identical per source: `load()` is `(path, options) => Store.load(path, options)` |

**No installation needed.** All dependencies are already in `package.json` and `Cargo.toml`.

**Version verification output (2026-04-16):**
- `pnpm view @tauri-apps/plugin-store version` -> `2.4.2`
- `pnpm view @tauri-apps/api version` -> `2.10.1`
- `pnpm view react version` -> `19.2.5`

[VERIFIED: all versions confirmed via pnpm registry queries on 2026-04-16]

---

## Architecture Patterns

### System Architecture Diagram

```
  User tap / keyboard event
           |
           v
   TodoApp (container)
           |
   +-------+-------+
   |               |
   v               v
 TodoInput    TodoList
 (form)        |
               +--> TodoItem (xN) [toggle/delete]
               |
               +--> "No todos yet" (empty state)
               |
               +--> "Loading..." (while store hydrates)
               |
               +--> Error message (if store fails)

   All four components call back to:
           |
           v
   [useTodos hook]
   +-------------------------------------------------+
   |  state: TodosState (loading | ready | error)    |
   |  storeRef: useRef<Store | null>                 |
   |                                                 |
   |  useEffect (mount, StrictMode-safe):            |
   |    -> Store.load("store.json", {autoSave:false})|
   |    -> store.get<Todo[]>("todos")                |
   |    -> setState({status:"ready", todos: got??[]})|
   |                                                 |
   |  addTodo(text)     -> mutate -> save(next)      |
   |  toggleTodo(id)    -> mutate -> save(next)      |
   |  deleteTodo(id)    -> mutate -> save(next)      |
   |                                                 |
   |  save(next):                                    |
   |    -> storeRef.current.set("todos", next)       |
   |    -> storeRef.current.save()                   |
   |    -> setState({status:"ready", todos: next})   |
   +-------------------------------------------------+
           |
           v
   @tauri-apps/plugin-store (JS bindings)
           |  Tauri IPC (Resource RID)
           v
   tauri_plugin_store (Rust crate)
           |
           v
   store.json  (Android app_data_dir, managed by plugin)
```

**Data flow — cold start:**
1. `main.tsx` renders `<App />` (StrictMode) -> `<TodoApp />`
2. `TodoApp` calls `useTodos()` — hook's `useEffect` fires
3. `await Store.load("store.json", { autoSave: false, defaults: {} })` — async, returns `Store` instance
4. `storeRef.current = store`
5. `await store.get<Todo[]>("todos")` — returns `Todo[] | undefined`
6. `setState({ status: "ready", todos: stored ?? [] })`
7. React re-renders -> `TodoList` receives the persisted array

**Data flow — mutation:**
1. User triggers action (add/toggle/delete) -> callback from `useTodos`
2. Hook computes next array (concat / map / filter — always new reference)
3. `await storeRef.current.set("todos", nextTodos)`
4. `await storeRef.current.save()` — flushes to disk
5. `setState({ status: "ready", todos: nextTodos })` — UI updates

### Recommended Project Structure

```
apps/tauri-todo/src/
├── app.tsx                     # Modified: import TodoApp instead of VerificationScreen
├── main.tsx                    # Unchanged
├── index.css                   # Unchanged
├── hooks/
│   └── use-todos.ts            # NEW: useTodos() — all store logic here
└── components/
    ├── todo-app.tsx            # NEW: layout shell
    ├── todo-input.tsx          # NEW: add form
    ├── todo-list.tsx           # NEW: list wrapper + empty state
    ├── todo-item.tsx           # NEW: single row
    └── verification-screen.tsx # DELETED

apps/tauri-todo/src-tauri/src/
├── main.rs                     # Unchanged (thin passthrough to lib::run)
└── lib.rs                      # Modified: remove greet command + handler entry
```

### Pattern 1: `useTodos` Hook Shape

**What:** Custom hook that owns all async store I/O and exposes CRUD callbacks
**When to use:** Async side effects (store I/O) need to be decoupled from presentational components; StrictMode-safe mounting

```typescript
// Source: verified against apps/tauri-todo/src/components/verification-screen.tsx
// and https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/store/guest-js/index.ts
import { load, type Store } from "@tauri-apps/plugin-store"
import { useEffect, useRef, useState } from "react"

export type Todo = {
  id: string
  text: string
  completed: boolean
}

export type TodosState =
  | { status: "loading" }
  | { status: "ready"; todos: Todo[] }
  | { status: "error"; message: string }

export function useTodos() {
  const [state, setState] = useState<TodosState>({ status: "loading" })
  const storeRef = useRef<Store | null>(null)

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const store = await load("store.json", { autoSave: false, defaults: {} })
        if (cancelled) return
        storeRef.current = store
        const stored = await store.get<Todo[]>("todos")
        if (cancelled) return
        setState({ status: "ready", todos: stored ?? [] })
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        setState({ status: "error", message })
      }
    }
    void init()
    return () => {
      cancelled = true
    }
  }, [])

  async function save(next: Todo[]) {
    const store = storeRef.current
    if (!store) return
    try {
      await store.set("todos", next)
      await store.save()
      setState({ status: "ready", todos: next })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setState({ status: "error", message })
    }
  }

  const addTodo = async (text: string) => {
    if (state.status !== "ready") return
    const trimmed = text.trim()
    if (trimmed.length === 0) return
    const next: Todo[] = [
      ...state.todos,
      { id: crypto.randomUUID(), text: trimmed, completed: false },
    ]
    await save(next)
  }

  const toggleTodo = async (id: string) => {
    if (state.status !== "ready") return
    const next = state.todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    await save(next)
  }

  const deleteTodo = async (id: string) => {
    if (state.status !== "ready") return
    const next = state.todos.filter((t) => t.id !== id)
    await save(next)
  }

  return { state, addTodo, toggleTodo, deleteTodo }
}
```

Notes:
- `Store` is exported from `@tauri-apps/plugin-store` and used as the ref type — cleaner than `Awaited<ReturnType<typeof load>>`.
- `defaults: {}` is passed for safety. The TypeScript type declares `defaults` required (`{ [key: string]: unknown }`) in the source, though published docs say optional. Matching Phase 1 exactly is safest.
- `void init()` suppresses the "floating promise" lint warning.
- `trimmed.length === 0` guards empty adds — aligns with `disabled` state in `TodoInput`.

[VERIFIED: Store type, load signature, get return type — https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/store/guest-js/index.ts lines 17-45, 50-72, 104-114]
[VERIFIED: error handling pattern — verification-screen.tsx lines 38-39, 59]
[VERIFIED: StrictMode-safe useEffect pattern — packages/ui/src/hooks/use-mobile.ts lines 7-16]

### Pattern 2: Store API — canonical usage

**What:** The plugin exports both a `load()` function and a `Store.load()` static method. They are identical — `load()` delegates to `Store.load()`.

```typescript
// Source: https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/store/guest-js/index.ts
// Line 62-67:
//   export async function load(path: string, options?: StoreOptions): Promise<Store> {
//     return await Store.load(path, options)
//   }
//
// Line 196-202 (Store.load):
//   static async load(path: string, options?: StoreOptions): Promise<Store> {
//     const rid = await invoke<number>('plugin:store|load', { path, options })
//     return new Store(rid)
//   }

import { load } from "@tauri-apps/plugin-store"
const store = await load("store.json", { autoSave: false, defaults: {} })
```

**StoreOptions type (verified from source):**
```typescript
export type StoreOptions = {
  defaults: { [key: string]: unknown }  // Required in TS source; optional at runtime per published docs
  autoSave?: boolean | number           // Default: 100ms debounce. Pass false to disable.
  serializeFnName?: string
  deserializeFnName?: string
  createNew?: boolean
  overrideDefaults?: boolean
}
```

**Store instance methods (verified from source):**
```typescript
async set(key: string, value: unknown): Promise<void>
async get<T>(key: string): Promise<T | undefined>   // IMPORTANT: returns undefined, not null
async save(): Promise<void>
async delete(key: string): Promise<boolean>
async clear(): Promise<void>
async has(key: string): Promise<boolean>
async keys(): Promise<string[]>
async values<T>(): Promise<T[]>
async entries<T>(): Promise<Array<[key: string, value: T]>>
async length(): Promise<number>
async reset(): Promise<void>
```

[VERIFIED: direct fetch of https://raw.githubusercontent.com/tauri-apps/plugins-workspace/v2/plugins/store/guest-js/index.ts on 2026-04-16]
[VERIFIED: `get<T>` implementation at line 239-245 — `return exists ? value : undefined`]
[CITED: https://v2.tauri.app/reference/javascript/store/]

### Pattern 3: Removing the `greet` Command (D-09)

**What:** Strip the greet command from `lib.rs`, keep store plugin registration intact.

```rust
// CURRENT (apps/tauri-todo/src-tauri/src/lib.rs, verified 2026-04-16):
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

// TARGET (Option A — empty handler, preserves builder shape):
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// TARGET (Option B — omit invoke_handler entirely, cleanest):
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

**Recommendation: use Option B.** `tauri::Builder` does not require `.invoke_handler()` — if no commands exist, omit the call. This is cleaner than an empty macro and avoids any chance of a lint warning.

Both options compile. `tauri::generate_handler![]` with an empty list is parsed by `syn::parse_terminated`, which accepts zero tokens. The generated closure returns `false` for every invoke call (no match arms), which is fine — no JS code should invoke a command in Phase 2 anyway.

[VERIFIED: tauri-macros/src/command/handler.rs — `parse_terminated(CommandDef::parse, Token![,])` handles zero items]
[VERIFIED: tauri/src/app.rs — `invoke_handler` is an optional builder method; builder has a default no-op handler]
[CITED: https://github.com/tauri-apps/tauri/issues/15012 — generate_handler! is compile-heavy but does not warn on empty]

### Pattern 4: Delete Ordering (D-08 execution order)

**What:** Deleting `verification-screen.tsx` and updating `app.tsx` import must happen in the correct order to avoid TypeScript errors.

**Safe order:**
1. Create `todo-app.tsx` (and other components / hook) first
2. Update `app.tsx` to `import { TodoApp } from "@/components/todo-app"`
3. Delete `verification-screen.tsx` last

Never delete first — the project will not compile between steps 1 and 3 if `app.tsx` still imports the deleted file.

### Anti-Patterns to Avoid

- **Storing the store instance in `useState`** — triggers re-renders. Use `useRef`. The store reference is not display data.
- **Calling `store.save()` inside `store.set()` implicitly** — Phase 1 used `autoSave: false`. Explicit `store.save()` calls are required per D-05.
- **Mutating the todos array in place** — always create a new array (`[...todos]`, `.map()`, `.filter()`). React state updates require new references.
- **Skipping the `cancelled` flag in `useEffect`** — React StrictMode calls `useEffect` twice in development. Without the flag, the second invocation may race with the first.
- **Default-exporting components** — project convention is named exports only. No `export default`.
- **Using `hover:` Tailwind variants** — mobile-only design. Use `active:` for touch feedback (D from UX-02 / Phase 1 verification-screen pattern).
- **Passing the store instance as a prop** — keeps it out of the render tree. Keep it encapsulated in `useTodos`.
- **Calling `crypto.randomUUID()` in render** — must be inside the mutation handler. Never in a component body (would generate a new ID every render).
- **Treating `store.get()` as returning `null`** — it returns `undefined`. Null-coalescing with `??` handles both, but the type annotation must use `| undefined`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Key-value persistence | Custom file I/O via `@tauri-apps/plugin-fs` | `@tauri-apps/plugin-store` | Already installed, handles JSON serialization, Android data-dir path, and IPC plumbing |
| UUID generation | Custom random ID / nanoid | `crypto.randomUUID()` | Browser-native (Web Crypto) in Chromium WebView; zero dependency; RFC 4122 v4 |
| CSS class merging | String concatenation / `clsx` / `cn()` | Direct Tailwind utility strings | No dynamic class merging needed — UI spec classes are static per component state |
| Form state | `react-hook-form` / formik | Single controlled input in `TodoInput` | One field, one button, no validation beyond trim — over-engineering |
| Discriminated-union state | `useReducer` with action types | `useState` + discriminated union type | The existing codebase pattern (`verification-screen.tsx`) uses `useState` with union types directly |
| Rust commands for CRUD | Custom `add_todo`, `toggle_todo`, `delete_todo` Rust commands | Pure JS via store plugin | D-09 locked — plugin owns the Rust-JS bridge; direct JS calls are simpler |

**Key insight:** The entire persistence stack is already solved by the store plugin. Phase 2 is a pure React CRUD exercise on top of an already-proven storage layer. Any "helper" code beyond the four components and one hook is over-engineering.

---

## Runtime State Inventory

Phase 2 is a greenfield feature addition within an already-scaffolded app. The only pre-existing runtime state affected is:

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `store.json` may contain Phase 1 test key `"test-key"` from verification-screen's `handleStoreTest` (written only if the user tapped "Test Store") | Leave in place. Phase 2 writes a separate `"todos"` key. Optional cleanup: `store.delete("test-key")` on first load — NOT required. |
| Live service config | None — Tauri store runs in-process, no external services | None |
| OS-registered state | None — Android app package unchanged | None |
| Secrets/env vars | None — no secrets in this app | None |
| Build artifacts | `apps/tauri-todo/src-tauri/target/` contains a build from Phase 1; cargo will re-build incrementally when `lib.rs` is edited | None — `cargo build` handles this. First rebuild after `lib.rs` edit may take ~30s. |

**Code deletions with runtime impact:**
- Deleting `verification-screen.tsx` — no runtime impact beyond UI (no background tasks, no listeners)
- Removing `greet` Rust command — no runtime impact. No JS code calls `invoke("greet", ...)` anymore (only `verification-screen.tsx` did, and that file is also being removed).

---

## Common Pitfalls

### Pitfall 1: `store.get()` returns `undefined`, not `null`

**What goes wrong:** Treating `get()` as returning `null` leads to incorrect type annotations (`Todo[] | null`) which fail under `noUncheckedIndexedAccess` or cause type narrowing issues.
**Why it happens:** Training data from older plugin versions. The current `v2` source returns `Promise<T | undefined>` explicitly.
**How to avoid:** Type the variable as `Todo[] | undefined`. Use `stored ?? []` to coalesce.
**Warning signs:** TypeScript error `Type 'Todo[] | undefined' is not assignable to type 'Todo[]'`.

```typescript
// Correct:
const stored = await store.get<Todo[]>("todos")  // Todo[] | undefined
const todos = stored ?? []

// Incorrect:
const stored: Todo[] | null = await store.get<Todo[]>("todos")  // Wrong — it's undefined
```

[VERIFIED: plugin source lines 239-245 — `return exists ? value : undefined`]

### Pitfall 2: Store Initialization Race on First Run

**What goes wrong:** `store.get("todos")` returns `undefined` on a fresh install. If the hook doesn't null-coalesce, spreading or mapping `undefined` throws a runtime TypeError.
**Why it happens:** The store key `"todos"` does not exist before the first add. The plugin returns `undefined`, not an empty array.
**How to avoid:** Always null-coalesce: `const stored = await store.get<Todo[]>("todos"); setState({ status: "ready", todos: stored ?? [] })`.
**Warning signs:** App crashes immediately after first install on a fresh device; works fine after first add.

### Pitfall 3: StrictMode Double-Effect Invocation

**What goes wrong:** `useEffect` fires twice in development (React StrictMode). `Store.load()` is called twice. If state management is naive, the second invocation may overwrite the first's hydrated todos with an empty array, or two concurrent `save()` calls may race.
**Why it happens:** React StrictMode intentionally mounts-unmounts-remounts in development to surface side effects.
**How to avoid:**
1. Use a `cancelled` flag in the cleanup function and check it after each `await`.
2. Hold the `Store` reference in `useRef`, not `useState` — refs persist across the double-mount cycle without triggering re-renders.
3. Keep `useEffect` dependency array empty (`[]`) — do not re-run after mount.

**Warning signs:** Todos added in dev mode disappear on reload, but persist correctly in release builds. Console shows duplicate "loading" logs.

[VERIFIED: React StrictMode behavior documented at https://react.dev/reference/react/StrictMode; pattern in use-mobile.ts]

### Pitfall 4: `app.tsx` Import Not Updated Before Deletion

**What goes wrong:** Deleting `verification-screen.tsx` before updating `app.tsx` leaves a broken import — TypeScript error `Cannot find module '@/components/verification-screen'`.
**Why it happens:** Two changes must happen atomically: delete the file, update the import.
**How to avoid:** Order the steps: (1) create all new components, (2) update `app.tsx` import, (3) delete `verification-screen.tsx`. Never delete first.
**Warning signs:** `pnpm typecheck` fails with "Cannot find module" error.

### Pitfall 5: `autoSave` Default is 100ms, Not False

**What goes wrong:** Omitting `autoSave` from `load()` options causes the store to auto-save on a 100ms debounce. This is not the chosen pattern (D-05) — `store.save()` must be called explicitly after each mutation.
**Why it happens:** The plugin default (`autoSave?: boolean | number`) is `true` with 100ms debounce. Only passing `autoSave: false` disables it.
**How to avoid:** Always pass `{ autoSave: false, defaults: {} }` to `load()` — matches Phase 1 verification screen pattern exactly.
**Warning signs:** Saves appear to happen "automatically" in dev — works fine but diverges from the explicit-save contract.

[VERIFIED: StoreOptions source lines 27-30 — `Auto save on modification with debounce duration in milliseconds, it's 100ms by default, pass in false to disable it`]

### Pitfall 6: Empty `generate_handler![]` vs. Omitted `invoke_handler`

**What goes wrong:** Some Tauri versions may emit a lint warning about empty macro invocations. Cosmetic only — never fails the build.
**Why it happens:** `tauri::generate_handler![]` parses fine but produces a closure with no match arms.
**How to avoid:** Prefer removing the `.invoke_handler()` line entirely from the builder chain. Cleaner code, zero chance of warning.
**Warning signs:** `cargo build` prints a warning about unused variables or an empty macro.

```rust
// Safest fix (zero warnings):
tauri::Builder::default()
    .plugin(tauri_plugin_store::Builder::new().build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
```

[VERIFIED: tauri-macros parser accepts empty input (parse_terminated)]
[VERIFIED: tauri::Builder does not require invoke_handler (src/app.rs)]

### Pitfall 7: `defaults` Required in TypeScript but Optional at Runtime

**What goes wrong:** Calling `load("store.json", { autoSave: false })` without `defaults` produces a TypeScript error because the source declares `defaults: { [key: string]: unknown }` (non-optional). But the runtime accepts it fine.
**Why it happens:** Mismatch between published docs (which say optional) and source TS declaration (which says required).
**How to avoid:** Always pass `defaults: {}` explicitly. Matches Phase 1 pattern and satisfies TypeScript.

[VERIFIED: source line 22-25 declares `defaults: { [key: string]: unknown }` without `?`]
[VERIFIED: verification-screen.tsx line 53 passes `defaults: {}`]

### Pitfall 8: `crypto.randomUUID()` Requires Secure Context

**What goes wrong:** In some browser contexts, `crypto.randomUUID()` is only available on HTTPS or localhost. Non-secure contexts throw `TypeError: crypto.randomUUID is not a function`.
**Why it happens:** Web Crypto API is gated on secure context.
**How to avoid:** Not an issue for Tauri — the WebView runs in a privileged context where `crypto.randomUUID()` is always available. Android WebView (Chromium ≥92) has full Web Crypto support. This pitfall only matters if Phase 2 is ever tested in a plain http:// browser (which it won't be — dev runs at http://localhost:1420 which is a secure context).
**Warning signs:** `TypeError` in browser console. Not expected in this phase.

[CITED: MDN — crypto.randomUUID() requires secure context, but localhost counts as secure]
[VERIFIED: Phase 1 Android target runs Chromium WebView on Android 7.0+ which supports Web Crypto]

---

## Code Examples

### TodoApp Container

```typescript
// apps/tauri-todo/src/components/todo-app.tsx
import { useTodos } from "@/hooks/use-todos"
import { TodoInput } from "@/components/todo-input"
import { TodoList } from "@/components/todo-list"

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

### TodoInput Form

```typescript
// apps/tauri-todo/src/components/todo-input.tsx
import { useState } from "react"

type TodoInputProps = {
  onAdd: (text: string) => Promise<void>
  disabled: boolean
}

export function TodoInput({ onAdd, disabled }: TodoInputProps) {
  const [text, setText] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed.length === 0) return
    await onAdd(trimmed)
    setText("")
  }

  const canSubmit = !disabled && text.trim().length > 0

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        autoFocus
        className="flex-1 h-10 px-3 bg-white border border-gray-200 rounded-md text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a todo..."
        value={text}
      />
      <button
        className="shrink-0 h-10 px-4 bg-blue-700 text-white text-sm font-normal rounded-md active:opacity-90 disabled:opacity-50"
        disabled={!canSubmit}
        type="submit"
      >
        Add
      </button>
    </form>
  )
}
```

### TodoList Wrapper + Empty State

```typescript
// apps/tauri-todo/src/components/todo-list.tsx
import { TodoItem } from "@/components/todo-item"
import type { TodosState } from "@/hooks/use-todos"

type TodoListProps = {
  state: TodosState
  onToggle: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

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

### TodoItem Row

```typescript
// apps/tauri-todo/src/components/todo-item.tsx
import type { Todo } from "@/hooks/use-todos"

type TodoItemProps = {
  todo: Todo
  onToggle: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const toggleClass = todo.completed
    ? "w-6 h-6 shrink-0 rounded-full bg-blue-700 border-2 border-blue-700 flex items-center justify-center active:opacity-90"
    : "w-6 h-6 shrink-0 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center active:opacity-90"

  const textClass = todo.completed ? "flex-1 text-base line-through text-gray-400" : "flex-1 text-base text-gray-900"

  return (
    <li className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white border border-gray-200">
      <button
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        className={toggleClass}
        onClick={() => onToggle(todo.id)}
        type="button"
      >
        {todo.completed && <span className="text-white text-xs">✓</span>}
      </button>
      <span className={textClass}>{todo.text}</span>
      <button
        aria-label="Delete todo"
        className="w-8 h-8 shrink-0 flex items-center justify-center rounded-md text-gray-400 active:opacity-90 active:text-red-600"
        onClick={() => onDelete(todo.id)}
        type="button"
      >
        <span className="text-xl leading-none">×</span>
      </button>
    </li>
  )
}
```

### `app.tsx` Update

```typescript
// apps/tauri-todo/src/app.tsx (full file after change)
import { TodoApp } from "@/components/todo-app"

export function App() {
  return <TodoApp />
}
```

### `lib.rs` Update (Rust)

```rust
// apps/tauri-todo/src-tauri/src/lib.rs (full file after change)
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Tailwind Classes Reference (from 02-UI-SPEC.md)

Verified against `02-UI-SPEC.md` — use verbatim:

| Element | Classes |
|---------|---------|
| Main container | `min-h-screen bg-white px-4 py-8` |
| Inner container | `w-full max-w-md mx-auto flex flex-col gap-6` |
| App heading | `text-xl font-semibold text-gray-900` |
| Form row | `flex gap-2` |
| Text input | `flex-1 h-10 px-3 bg-white border border-gray-200 rounded-md text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700` |
| Add button | `shrink-0 h-10 px-4 bg-blue-700 text-white text-sm font-normal rounded-md active:opacity-90 disabled:opacity-50` |
| Todo list `<ul>` | `flex flex-col gap-2` |
| Todo row `<li>` | `flex items-center gap-3 px-3 py-3 rounded-lg bg-white border border-gray-200` |
| Toggle (incomplete) | `w-6 h-6 shrink-0 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center active:opacity-90` |
| Toggle (completed) | `w-6 h-6 shrink-0 rounded-full bg-blue-700 border-2 border-blue-700 flex items-center justify-center active:opacity-90` |
| Todo text (normal) | `flex-1 text-base text-gray-900` |
| Todo text (completed) | `flex-1 text-base line-through text-gray-400` |
| Delete button | `w-8 h-8 shrink-0 flex items-center justify-center rounded-md text-gray-400 active:opacity-90 active:text-red-600` |
| Loading state | `py-12 flex items-center justify-center` with inner `<p className="text-sm text-gray-500">Loading...</p>` |
| Empty state | `py-12 flex flex-col items-center gap-2` with heading (`text-base font-semibold text-gray-900`) + body (`text-sm text-gray-500`) |

[VERIFIED: 02-UI-SPEC.md]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `new Store(path)` constructor | `await Store.load(path, options)` static / `await load(path, options)` named | Plugin 2.0.0 stable | Phase 1 already uses the current pattern |
| `store.get()` returns `null` on miss | `store.get()` returns `undefined` on miss | Plugin 2.x | Null-coalescing with `??` handles either; the type annotation must use `undefined` |
| Manual file persistence via `@tauri-apps/plugin-fs` | `@tauri-apps/plugin-store` | Tauri v2 plugin ecosystem | Store plugin handles path resolution, serialization, cross-platform location |
| `@tauri-apps/api/tauri` (v1) | `@tauri-apps/api/core` (v2) | Tauri v2.0 | Phase 1 already uses `@tauri-apps/api/core` in verification-screen.tsx |
| `main.rs` as entry for commands | `lib.rs` with `#[cfg_attr(mobile, tauri::mobile_entry_point)]` | Tauri v2 mobile support | Phase 1 already uses lib.rs entry |

**No deprecated patterns in use.** Phase 1 established the correct v2 APIs throughout. Phase 2 should not introduce any legacy patterns.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `defaults: {}` satisfies the `StoreOptions.defaults` field at both type-check time and runtime | Pattern 2 / Pitfall 7 | Low — Phase 1 verification-screen.tsx uses this pattern and works in production on Android. If it fails type-check in a future plugin version, the fix is a 1-line change (add a non-empty default). |
| A2 | Omitting `.invoke_handler()` entirely when no commands exist produces no compile warnings or runtime errors | Pattern 3 / Pitfall 6 | Low — Tauri Builder's default invoke handler is a no-op. The only risk is a minor Rust warning about unused functions, which doesn't exist here since `greet` is being deleted too. |

**All other claims in this document are `[VERIFIED]` or `[CITED]`** — either verified against source (plugins-workspace repo, Phase 1 code, package.json, pnpm registry) or cited to official Tauri docs at `v2.tauri.app`.

---

## Open Questions

**None.** The three previously-open questions from the stale research are resolved:

1. **Empty `generate_handler![]` — warning or clean compile?**
   RESOLVED: Prefer **omitting `.invoke_handler()` entirely** (Option B in Pattern 3). Verified safe against `tauri::Builder` source — `invoke_handler` is optional. If for some reason the team prefers to preserve the builder-chain shape, the empty macro form (`tauri::generate_handler![]`) also compiles cleanly; it's a stylistic choice.

2. **Store behavior in web dev mode (`pnpm dev` without Tauri)**
   RESOLVED: Let the `try/catch` in `useEffect` catch the error and set `{ status: "error", message }`. The UI spec already defines an error state ("Could not load todos. Restart the app and try again."). No `isTauriRuntime()` guard needed in `useTodos` — the error state renders gracefully in web dev mode. Keeping this path simple also mirrors production behavior: the user sees an error, not a blank screen.

3. **Does `store.get()` return `null` or `undefined`?**
   RESOLVED: `undefined`. Verified against source: `return exists ? value : undefined` (guest-js/index.ts line 244). Type annotations must use `Todo[] | undefined`. Null-coalescing (`stored ?? []`) handles the undefined case correctly.

---

## Environment Availability

All external dependencies were validated in Phase 1. No new dependencies introduced in Phase 2.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@tauri-apps/plugin-store` (JS) | PERS-01, PERS-02 | ✓ | 2.4.2 | — |
| `tauri-plugin-store` (Rust crate) | PERS-01 | ✓ | ^2 resolves to 2.4.2 | — |
| `store:default` capability | PERS-03 | ✓ | `capabilities/mobile.json` | — |
| `crypto.randomUUID()` | TODO-01 | ✓ | Browser native (Chromium WebView on Android 7.0+) | — |
| Tailwind CSS v4 | UI rendering | ✓ | 4.2.2 | — |
| React 19 + StrictMode | All components | ✓ | 19.2.5 | — |
| TypeScript 5.9.3 + `noUncheckedIndexedAccess` | Type safety | ✓ | 5.9.3 | — |

**No missing dependencies.** Phase 2 requires no new installs.

---

## Security Domain

No external I/O beyond the Tauri Store plugin. No network calls, no auth, no user credentials. The attack surface is minimal.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No users in this app |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | Single-user local app |
| V5 Input Validation | yes | Trim whitespace on todo text; rely on React's built-in JSX escaping for XSS-safe rendering |
| V6 Cryptography | no | No secrets stored; `crypto.randomUUID()` is for ID generation, not security |
| V7 Error Handling | yes | Catch store errors; do not leak stack traces to UI; show generic message ("Could not load todos") |

### Known Threat Patterns for {React + Tauri + local storage}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via user-controlled todo text | Tampering | React escapes interpolated strings by default — `{todo.text}` in JSX is safe. No `dangerouslySetInnerHTML` anywhere. |
| Store file tampering (attacker rewrites `store.json`) | Tampering | Out of scope — requires filesystem access to the device. Tauri sandboxes the app data directory. The todo app assumes the local device is trusted. |
| Information disclosure via verbose errors | Information disclosure | Catch blocks use the generic message pattern (`err instanceof Error ? err.message : String(err)`) — this surfaces plugin error text but not stack traces. The UI-spec error copy is intentionally generic ("Could not load todos. Restart the app and try again."). |
| Over-broad capability permissions | Elevation of privilege | `mobile.json` grants only `core:default` and `store:default` — least-privilege. Do not add more permissions in Phase 2. |

[VERIFIED: capabilities/mobile.json — only 2 permissions granted, both required]
[CITED: React docs — JSX expression interpolation is XSS-safe by default]

---

## Sources

### Primary (HIGH confidence)

- **Tauri plugins-workspace source** — https://raw.githubusercontent.com/tauri-apps/plugins-workspace/v2/plugins/store/guest-js/index.ts (fetched directly 2026-04-16)
  - Verified `StoreOptions` type, `load()` / `Store.load()` signature, `get<T>` returns `undefined` on miss
- **Tauri v2 docs** — https://v2.tauri.app/reference/javascript/store/
  - Cross-checked API signatures and runtime behavior
- **Tauri v2 store plugin overview** — https://v2.tauri.app/plugin/store/
  - Confirmed Android/iOS platform support
- **Tauri core repo** — https://github.com/tauri-apps/tauri/blob/dev/crates/tauri-macros/src/command/handler.rs + src/app.rs
  - Confirmed empty `generate_handler![]` parses fine; `invoke_handler` is optional on Builder
- **Context7** — `/tauri-apps/plugins-workspace` library — fetched store plugin usage examples
- **Project code:**
  - `apps/tauri-todo/src/components/verification-screen.tsx` — existing verified store API usage
  - `apps/tauri-todo/src-tauri/capabilities/mobile.json` — `store:default` capability already granted
  - `apps/tauri-todo/src-tauri/src/lib.rs` — current Rust state
  - `apps/tauri-todo/package.json`, `Cargo.toml` — dependency versions
  - `.planning/phases/02-todo-app/02-CONTEXT.md` — all locked decisions
  - `.planning/phases/02-todo-app/02-UI-SPEC.md` — Tailwind classes and copy contract
  - `.planning/phases/02-todo-app/02-PATTERNS.md` — analog mappings for each new file
  - `.planning/phases/01-foundation/01-CONTEXT.md` — Phase 1 foundation decisions
- **Version queries (pnpm registry, 2026-04-16):**
  - `pnpm view @tauri-apps/plugin-store version` -> `2.4.2`
  - `pnpm view @tauri-apps/api version` -> `2.10.1`
  - `pnpm view react version` -> `19.2.5`

### Secondary (MEDIUM confidence)

- **Project skill** — `.agents/skills/tauri-v2/SKILL.md` + `references/plugin-reference.md` — Tauri v2 patterns, known pitfalls, store capability reference
- **WebSearch findings** — cross-verified with official sources:
  - Android store path behavior (tauri/tauri-apps issues #14603, #298) — documented but not critical for Phase 2
  - React 19 StrictMode behavior — confirmed via React docs

### Tertiary (LOW confidence)

None. All claims verified against source or official docs.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all deps verified against package.json, Cargo.toml, and pnpm registry on 2026-04-16
- Architecture: HIGH — directly derived from locked CONTEXT.md decisions, 02-UI-SPEC.md contract, and existing verified Phase 1 code
- API signatures: HIGH — fetched directly from plugins-workspace v2 source
- Pitfalls: HIGH (pitfalls 1, 2, 3, 4, 5, 7) / HIGH (pitfalls 6, 8 — verified via macro source and MDN)

**Research date:** 2026-04-16 (refreshed)
**Valid until:** 2026-05-16 (stable plugin APIs, low churn expected; revalidate on major Tauri v2 release)

**Changes from previous RESEARCH.md:**
- Corrected `store.get()` return type: `undefined`, not `null` (previously inconsistent)
- Clarified `defaults` field is required in TS type but accepts `{}` — pass it explicitly
- Recommended omitting `.invoke_handler()` entirely over empty `generate_handler![]` (cleaner)
- Added full `TodoInput`, `TodoList`, `TodoItem` code examples (previously only `TodoApp` and hook were shown)
- Added Project Constraints section mirroring CLAUDE.md / typescript.md rules
- Added Pitfall 8 (secure context requirement for `crypto.randomUUID()`) — verified non-issue for Tauri
- Added Security Domain section (minimal, since no external I/O)
- Moved assumptions count from 2 low-risk to 2 low-risk and confirmed via new source verification
