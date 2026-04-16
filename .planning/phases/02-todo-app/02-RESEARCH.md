# Phase 2: Todo App - Research

**Researched:** 2026-04-16
**Domain:** React component architecture + Tauri Store plugin persistence (Android)
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
| TODO-04 | Empty state shown when no todos exist | `TodoList` conditional render — `todos.length === 0` branch renders centered empty state |
| PERS-01 | @tauri-apps/plugin-store installed and registered (JS + Rust) | Already complete from Phase 1 — verified in `package.json` (2.4.2) and `Cargo.toml` and `lib.rs` |
| PERS-02 | Todos persist across app restarts | `store.load("store.json")` on mount, `store.save()` after every mutation via `useTodos` |
| PERS-03 | Store capability granted for mobile platform | Already complete — `mobile.json` capability already contains `"store:default"` |
</phase_requirements>

---

## Summary

Phase 2 replaces the Phase 1 verification screen with a functional todo app that persists to the Tauri Store. The entire persistence infrastructure (plugin installed, Rust registered, mobile capability granted) was completed in Phase 1 and requires zero changes to `Cargo.toml`, `lib.rs`, or `mobile.json`. The only Rust change is removing the now-unnecessary `greet` command.

The work is almost entirely TypeScript/React: four component files, one custom hook, and a swap in `App.tsx`. The `useTodos` hook owns all async store interaction and exposes a synchronous-feeling API to `TodoApp`. Components are purely presentational. The UI spec is already finalized in `02-UI-SPEC.md` and provides exact Tailwind classes, copy, and state machine — no design decisions remain open.

The primary risk is **store initialization race conditions**: `Store.load()` is async, so the hook must gate rendering behind a loading state to prevent null-reference errors on `store.get()`. The secondary risk is **StrictMode double-invocation**: React StrictMode calls `useEffect` twice in development, which means `Store.load()` fires twice. The store reference must be held outside of per-render scope (e.g., via `useRef`) to avoid creating two store instances.

**Primary recommendation:** Build the `useTodos` hook first (load -> CRUD -> save), then wire presentational components to it. All persistence complexity is contained in the hook — components receive plain arrays and callbacks.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Todo CRUD operations | Frontend (React hook) | — | All mutations happen in JS; no Rust commands needed; store plugin handles JS-to-disk bridge |
| Persistent storage | Tauri Store Plugin | Android filesystem | Plugin already bridges JS API to native file I/O; no custom Rust needed |
| UI rendering | Frontend (React components) | — | Pure presentational layer; no server-side rendering; Tauri WebView renders React |
| Rust backend | Passthrough only | — | Only store plugin registration remains; `greet` command removed; no new commands |
| Mobile capability permissions | Tauri capabilities file | — | `mobile.json` already grants `store:default`; no changes needed |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tauri-apps/plugin-store` | 2.4.2 | Key-value persistence to disk | Already installed and verified working on Android in Phase 1 |
| `react` | 19.2.5 | UI rendering | Project standard via pnpm catalog |
| `tailwindcss` | 4.2.2 | Utility CSS | Already configured via `@import "tailwindcss"` in `index.css` |

[VERIFIED: pnpm registry — `pnpm view @tauri-apps/plugin-store version` returned `2.4.2`]
[VERIFIED: package.json — confirmed exact versions in project]

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `crypto.randomUUID()` | Browser native | UUID generation for todo IDs | D-02 locked — no library install needed |
| `@tauri-apps/api` | 2.10.1 | Core Tauri frontend API | Only needed if `isTauriRuntime()` guard is used in `useTodos` |

[VERIFIED: package.json — `@tauri-apps/api` 2.10.1 confirmed]

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `store.save()` after each mutation | Debounced saves | D-05 locked — save-after-every-mutation chosen; debouncing adds complexity, acceptable for a todo list |
| `crypto.randomUUID()` | `nanoid` or timestamp IDs | D-02 locked — browser-native requires no dependency |
| Full array stored at single key | Individual keys per todo | D-04 locked — single key is simpler for a small dataset |

**No installation needed.** All dependencies are already in `package.json` and `Cargo.toml`.

---

## Architecture Patterns

### System Architecture Diagram

```
User tap / keyboard
        |
        v
  TodoInput (form)
  TodoList -> TodoItem (xN)
        |
        v
  [useTodos hook]
  +---------------------------------------------+
  |  State: todos[], loadingState               |
  |  addTodo() -> mutate array -> store.save()  |
  |  toggleTodo() -> mutate -> store.save()     |
  |  deleteTodo() -> mutate -> store.save()     |
  |  useEffect -> Store.load("store.json")      |
  |              -> store.get("todos")          |
  +---------------------------------------------+
        |
        v
  @tauri-apps/plugin-store (JS binding)
        |  IPC bridge
        v
  tauri_plugin_store (Rust)
        |
        v
  store.json (Android app data directory)
```

**Data flow for app startup:**
1. `main.tsx` -> renders `<App />` -> renders `<TodoApp />`
2. `TodoApp` calls `useTodos()` — hook fires `useEffect`
3. `Store.load("store.json", { autoSave: false })` — async, returns `Store` instance
4. `store.get<Todo[]>("todos")` — returns array or null
5. Hook sets `todos` state and clears `loading` state
6. React re-renders — `TodoList` now receives the persisted array

**Data flow for mutation:**
1. User triggers action (add/toggle/delete) -> callback from `useTodos`
2. Hook computes next array (filter / map / concat)
3. `store.set("todos", nextTodos)`
4. `store.save()` — flushes to disk
5. React `setTodos(nextTodos)` — UI updates

### Recommended Project Structure

```
apps/tauri-todo/src/
├── app.tsx                     # Updated: renders <TodoApp /> (was VerificationScreen)
├── main.tsx                    # Unchanged
├── index.css                   # Unchanged
├── hooks/
│   └── use-todos.ts            # New: useTodos() — all store logic here
└── components/
    ├── todo-app.tsx             # New: layout shell
    ├── todo-input.tsx           # New: add form
    ├── todo-list.tsx            # New: list wrapper + empty state
    ├── todo-item.tsx            # New: single row
    └── verification-screen.tsx # DELETED

apps/tauri-todo/src-tauri/src/
└── lib.rs                      # Modified: remove greet command
```

### Pattern 1: `useTodos` Hook Shape

**What:** Custom hook that owns all async store interaction and exposes CRUD callbacks
**When to use:** Any time async side effects (store I/O) need to be decoupled from presentational components

```typescript
// Source: verified patterns from verification-screen.tsx + Context7 store docs
import { load } from "@tauri-apps/plugin-store"
import { useEffect, useRef, useState } from "react"

type Todo = {
  id: string
  text: string
  completed: boolean
}

type TodosState =
  | { status: "loading" }
  | { status: "ready"; todos: Todo[] }
  | { status: "error"; message: string }

export function useTodos() {
  const [state, setState] = useState<TodosState>({ status: "loading" })
  const storeRef = useRef<Awaited<ReturnType<typeof load>> | null>(null)

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const store = await load("store.json", { autoSave: false })
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
    return () => { cancelled = true }
  }, [])

  async function save(next: Todo[]) {
    if (!storeRef.current) return
    await storeRef.current.set("todos", next)
    await storeRef.current.save()
    setState({ status: "ready", todos: next })
  }

  const addTodo = async (text: string) => {
    if (state.status !== "ready") return
    const next = [...state.todos, { id: crypto.randomUUID(), text, completed: false }]
    await save(next)
  }

  const toggleTodo = async (id: string) => {
    if (state.status !== "ready") return
    const next = state.todos.map((t) => t.id === id ? { ...t, completed: !t.completed } : t)
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

### Pattern 2: Store API — `load()` vs `Store.load()`

**What:** The plugin exports both a `load()` function (used in Phase 1) and a `Store.load()` static method. They are equivalent.
**When to use:** Use `load()` (named import) — consistent with existing Phase 1 pattern in `verification-screen.tsx`.

```typescript
// Source: Context7 /tauri-apps/plugins-workspace + verification-screen.tsx
import { load } from "@tauri-apps/plugin-store"

// Phase 1 used this exact signature — keep consistent:
const store = await load("store.json", { autoSave: false })
```

Note: Context7 docs show `Store.load()` as the newer API. Both work. The Phase 1 code uses `load()` — stay consistent.
[VERIFIED: verification-screen.tsx line 53 — `await load("store.json", { autoSave: false, defaults: {} })`]
[CITED: https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/store/README.md]

### Pattern 3: Removing the `greet` Command (D-09)

**What:** Strip the greet command from `lib.rs`, keep store plugin registration intact.
**When to use:** Whenever a Tauri command is no longer needed — remove from both handler macro and function definition.

```rust
// Source: current apps/tauri-todo/src-tauri/src/lib.rs

// BEFORE (Phase 1):
// #[tauri::command]
// fn greet(name: String) -> Result<String, String> { ... }
//
// pub fn run() {
//     tauri::Builder::default()
//         .plugin(tauri_plugin_store::Builder::new().build())
//         .invoke_handler(tauri::generate_handler![greet])
//         ...

// AFTER (Phase 2):
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

Note: `tauri::generate_handler![]` with an empty list is valid Rust — it compiles without error.
[VERIFIED: tauri-v2 SKILL.md — empty handler list not documented as problematic; [ASSUMED] empty macro list compiles — needs verification if Rust throws a warning]

### Anti-Patterns to Avoid

- **Storing the store instance in component state:** `useState(null)` for a `Store` object causes re-renders. Use `useRef` — the store reference is not display data.
- **Calling `store.save()` inside `store.set()` automatically:** The Phase 1 verification screen used `autoSave: false`. Explicit `store.save()` calls are required (D-05).
- **Mutating the todos array in-place:** Always create a new array (`[...todos]`, `.map()`, `.filter()`). React state updates require new references.
- **Skipping the `cancelled` flag in `useEffect`:** React StrictMode calls `useEffect` twice in development. Without the `cancelled` flag, the second invocation may race with the first, setting state after the component is effectively reset.
- **Default exporting components:** Project convention is named exports only. No `export default`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Key-value persistence | Custom file I/O via Tauri FS plugin | `@tauri-apps/plugin-store` | Already installed, handles serialization, file location, Android permissions |
| UUID generation | Custom random ID | `crypto.randomUUID()` | Browser-native in Chromium WebView; zero dependency; collision-safe |
| CSS class merging | String concatenation | Tailwind utility classes directly | No `cn()` needed here — no dynamic class merging required in these simple components |

**Key insight:** The entire persistence stack is already solved. Phase 2 is a pure React CRUD exercise on top of an already-proven storage layer.

---

## Common Pitfalls

### Pitfall 1: Store Initialization Race on First Run

**What goes wrong:** `store.get("todos")` returns `null` on first app run (no stored data yet). If the hook doesn't handle `null`, spreading or mapping `null` throws a runtime error.
**Why it happens:** The store key `"todos"` does not exist on first launch — `get()` returns `null`, not an empty array.
**How to avoid:** Always null-coalesce: `const stored = await store.get<Todo[]>("todos"); setState({ todos: stored ?? [] })`.
**Warning signs:** App crashes immediately after first install on a fresh device; works fine after first add.

[VERIFIED: Context7 docs — `store.get()` returns `null` if key not found; SKILL plugin-reference.md confirms same]

### Pitfall 2: StrictMode Double-Effect Invocation

**What goes wrong:** `useEffect` fires twice in development (React StrictMode). `Store.load()` is called twice, creating two store instances. One may save stale data, overwriting the other's changes.
**Why it happens:** React StrictMode intentionally mounts-unmounts-remounts in development to surface side effects. The second mount fires the effect again.
**How to avoid:** Use a `cancelled` flag in the cleanup function. Also hold the store reference in `useRef`, not in state — the ref persists across the double-mount cycle correctly.
**Warning signs:** Todos added during development disappear immediately or fail to persist in dev mode but work fine in production builds.

[VERIFIED: React StrictMode behavior documented in React docs; pattern confirmed standard in React 18+ community]

### Pitfall 3: `app.tsx` Import Not Updated

**What goes wrong:** `App.tsx` still imports `VerificationScreen` after the file is deleted — TypeScript compile error or runtime crash.
**Why it happens:** Two changes must happen atomically: delete `verification-screen.tsx` and update `App.tsx` import.
**How to avoid:** In the same plan wave: (1) create `TodoApp` component, (2) update `App.tsx` import, (3) delete `verification-screen.tsx`. Never delete first.
**Warning signs:** TypeScript error `Cannot find module '@/components/verification-screen'`.

### Pitfall 4: Empty `generate_handler![]` May Generate Warning

**What goes wrong:** Removing `greet` and leaving `tauri::generate_handler![]` empty may trigger a Rust compiler warning in some Tauri versions.
**Why it happens:** The macro may warn about an empty invocation.
**How to avoid:** If the Rust compiler warns, the alternative is to remove the `.invoke_handler()` call entirely — `tauri::Builder::default()` does not require it. Check compiler output after removing `greet`.
**Warning signs:** `cargo build` prints a warning (not an error) about the empty handler macro.

[ASSUMED: Empty generate_handler![] behavior — not verified against current Tauri 2.x compiler output. Low risk: it either warns or compiles clean; does not break builds.]

### Pitfall 5: `autoSave: false` Must Be Set Explicitly

**What goes wrong:** If `load()` is called without `{ autoSave: false }`, the store auto-saves on every `set()` call. This is not the chosen pattern (D-05) and can cause unexpected disk writes during partial state transitions.
**Why it happens:** The store plugin defaults to auto-save enabled in newer versions.
**How to avoid:** Always pass `{ autoSave: false }` to `load()` — matches Phase 1 verification screen pattern.

[VERIFIED: verification-screen.tsx line 53 — Phase 1 used `{ autoSave: false, defaults: {} }`]
[CITED: Context7 — "Modifications made to the store are automatically saved by default"]

---

## Code Examples

### TodoApp Container

```typescript
// Named export, kebab-case file: todo-app.tsx
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

### Tailwind Classes Reference (from 02-UI-SPEC.md)

Input element:
```
flex-1 h-10 px-3 bg-white border border-gray-200 rounded-md text-base text-gray-900
focus:outline-none focus:ring-2 focus:ring-blue-700
```

Add button:
```
shrink-0 h-10 px-4 bg-blue-700 text-white text-sm font-normal rounded-md
active:opacity-90 disabled:opacity-50
```

Todo row:
```
flex items-center gap-3 px-3 py-3 rounded-lg bg-white border border-gray-200
```

Completed text:
```
flex-1 text-base line-through text-gray-400
```

Toggle button (incomplete):
```
w-6 h-6 shrink-0 rounded-full border-2 border-gray-300 flex items-center justify-center
active:opacity-90
```

Toggle button (completed):
```
w-6 h-6 shrink-0 rounded-full bg-blue-700 border-2 border-blue-700 flex items-center
justify-center active:opacity-90
```

Delete button:
```
w-8 h-8 shrink-0 flex items-center justify-center rounded-md text-gray-400
active:opacity-90 active:text-red-600
```

[VERIFIED: 02-UI-SPEC.md — all classes taken verbatim from finalized UI spec]

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `store.load()` instance method (v1 API) | `load()` named import or `Store.load()` static | Tauri plugin-store v2 | Phase 1 already uses v2 API; no change needed |
| Manual file persistence via FS plugin | `@tauri-apps/plugin-store` | Tauri v2 plugin ecosystem | Store plugin handles path resolution, serialization, cross-platform location |

**No deprecated patterns in use.** Phase 1 established the correct v2 APIs throughout.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `tauri::generate_handler![]` with empty list compiles without error in current Tauri 2.x | Common Pitfalls #4 / Code Examples | If it requires at least one handler, the fix is to omit `.invoke_handler()` entirely — low-risk fallback |
| A2 | `isTauriRuntime()` guard is not needed in `useTodos` — the store plugin works in browser dev mode (may throw, caught by error state) | Architecture Patterns #1 | If store plugin throws in web dev mode (not Android), the error state renders gracefully — no data loss |

---

## Open Questions (RESOLVED)

1. **Empty `generate_handler![]` — warning or clean compile?**
   - What we know: The greet command must be removed (D-09); the builder call exists
   - What's unclear: Whether Tauri 2.x's proc macro warns on empty invocation
   - RESOLVED: Use `tauri::generate_handler![]` with empty list. If the Rust compiler emits a warning, the fallback is to remove the `.invoke_handler()` line entirely from the builder chain. Either outcome is a 1-line fix. Plan 02-01 Task 2 accounts for both paths in its action and acceptance criteria ("warnings about empty handler are acceptable").

2. **Store behavior in web dev mode (`pnpm dev` without Tauri)**
   - What we know: Phase 1 `isTauriRuntime()` guard was used to prevent store calls outside Tauri runtime
   - What's unclear: Whether to replicate this guard in `useTodos` or let the error state catch it
   - RESOLVED: Let the `try/catch` in `useEffect` catch the error and set `{ status: "error", message }`. The UI spec already defines an error state ("Could not load todos. Restart the app and try again."). No `isTauriRuntime()` guard needed in `useTodos` — the error state renders gracefully in web dev mode.

---

## Environment Availability

All external dependencies were validated in Phase 1. No new dependencies introduced in Phase 2.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `@tauri-apps/plugin-store` | PERS-01, PERS-02 | ✓ | 2.4.2 | — |
| `tauri_plugin_store` (Rust) | PERS-01 | ✓ | ^2 (Cargo.toml) | — |
| `store:default` capability | PERS-03 | ✓ | mobile.json | — |
| `crypto.randomUUID()` | TODO-01 (ID gen) | ✓ | Browser native (Chromium WebView) | — |
| Tailwind CSS v4 | UI rendering | ✓ | 4.2.2 | — |

**No missing dependencies.** Phase 2 requires no new installs.

---

## Sources

### Primary (HIGH confidence)
- `/tauri-apps/plugins-workspace` (Context7) — store plugin `load()`, `set()`, `get()`, `save()` API
- `apps/tauri-todo/src/components/verification-screen.tsx` — existing store API usage patterns, confirmed working on Android
- `apps/tauri-todo/src-tauri/capabilities/mobile.json` — `store:default` capability already granted
- `apps/tauri-todo/src-tauri/src/lib.rs` — current Rust state (greet command, plugin registration)
- `apps/tauri-todo/package.json` — confirmed dependency versions
- `.planning/phases/02-todo-app/02-CONTEXT.md` — all locked decisions
- `.planning/phases/02-todo-app/02-UI-SPEC.md` — finalized component layouts, Tailwind classes, copy

### Secondary (MEDIUM confidence)
- `.agents/skills/tauri-v2/SKILL.md` — Tauri v2 patterns and known pitfalls
- `.agents/skills/tauri-v2/references/plugin-reference.md` — store plugin permissions reference
- GitHub: `https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/store/README.md` — store plugin README

### Tertiary (LOW confidence)
- A1: Empty `generate_handler![]` behavior — training knowledge, not verified against compiler output

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all deps verified in package.json and pnpm registry
- Architecture: HIGH — directly derived from locked CONTEXT.md decisions and existing verified Phase 1 code
- Pitfalls: HIGH (pitfalls 1, 2, 3, 5) / LOW (pitfall 4 — unverified compiler behavior)

**Research date:** 2026-04-16
**Valid until:** 2026-05-16 (stable plugin APIs, low churn expected)
