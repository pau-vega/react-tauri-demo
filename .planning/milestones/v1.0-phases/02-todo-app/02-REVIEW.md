---
phase: 02-todo-app
reviewed: 2026-04-16T19:40:58Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - apps/tauri-todo/src-tauri/src/lib.rs
  - apps/tauri-todo/src/app.tsx
  - apps/tauri-todo/src/components/todo-app.tsx
  - apps/tauri-todo/src/components/todo-input.tsx
  - apps/tauri-todo/src/components/todo-item.tsx
  - apps/tauri-todo/src/components/todo-list.tsx
  - apps/tauri-todo/src/hooks/use-todos.ts
  - apps/tauri-todo/vite.config.ts
findings:
  critical: 0
  warning: 3
  info: 4
  total: 7
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-16T19:40:58Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Phase 02 ships a small, readable, well-factored set of React components and a `useTodos` hook that wraps the Tauri Store plugin. Discriminated-union state handling, accessibility labels, and the Rust shell all look good. No critical security issues (XSS is mitigated by JSX escaping, error copy is generic so raw error messages are not leaked, no hardcoded secrets, no dangerous APIs).

Three warnings are worth attention:

1. **Stale-state race in `useTodos`.** `addTodo`/`toggleTodo`/`deleteTodo` all read `state.todos` from the render-time closure. Rapid double-taps on mobile (a realistic scenario for Phase 02's acceptance checklist: "tap the left-side circle on a todo toggles its completed visual state") can race two concurrent saves and silently drop one mutation.
2. **Inline `type`-import violates project rules.** `import { load, type Store } from "@tauri-apps/plugin-store"` breaks the `.agents/rules/typescript.md` rule that prefers top-level `import type`. The rule exists because some bundlers leave empty side-effect imports after transpilation.
3. **Env-var truthiness in `vite.config.ts`.** `!!process.env.TAURI_ENV_DEBUG` and `!process.env.TAURI_ENV_DEBUG` treat the string `"false"` as truthy. If a tooling change ever sets `TAURI_ENV_DEBUG=false` instead of unsetting it, sourcemaps enable and minification disables for release builds.

Info items cover cosmetic / maintenance polish (unused `message` field in error state, redundant trim, `import type` ordering stylistic suggestion, missing `<label>` for the input).

## Warnings

### WR-01: Stale-state race on rapid taps in `useTodos`

**File:** `apps/tauri-todo/src/hooks/use-todos.ts:54-72`
**Issue:** `addTodo`, `toggleTodo`, and `deleteTodo` all read `state.todos` directly from the closure captured at render time. If the user taps two actions before React commits the first `setState` (a realistic scenario on a touch device — the phase's own verification checklist exercises rapid toggle / delete), both handlers read the same baseline `state.todos`, build two `next` arrays off that baseline, and call `save()` sequentially. The second `save()` overwrites the first — one mutation is silently lost.

Concrete scenario (Phase 02 Check 5 in `02-03-PLAN.md`): user toggles "Walk dog" completed, then immediately taps the X on "Buy milk" before React re-renders. Both handlers see `state.todos = [milk, dog_incomplete, book]`. Toggle fires first and saves `[milk, dog_completed, book]`. Delete fires next and saves `[dog_incomplete, book]` — the toggle is lost.

**Fix:** Maintain the source of truth in a ref so callbacks always see the latest committed list, and update the ref inside `save()`:

```ts
export function useTodos() {
  const [state, setState] = useState<TodosState>({ status: "loading" })
  const storeRef = useRef<Store | null>(null)
  const todosRef = useRef<Todo[]>([])

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const store = await load("store.json", { autoSave: false, defaults: {} })
        if (cancelled) return
        storeRef.current = store
        const stored = await store.get<Todo[]>("todos")
        if (cancelled) return
        todosRef.current = stored ?? []
        setState({ status: "ready", todos: todosRef.current })
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
      todosRef.current = next
      setState({ status: "ready", todos: next })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setState({ status: "error", message })
    }
  }

  async function addTodo(text: string) {
    if (!storeRef.current) return
    const trimmed = text.trim()
    if (trimmed.length === 0) return
    const next: Todo[] = [...todosRef.current, { id: crypto.randomUUID(), text: trimmed, completed: false }]
    await save(next)
  }

  async function toggleTodo(id: string) {
    if (!storeRef.current) return
    const next = todosRef.current.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    await save(next)
  }

  async function deleteTodo(id: string) {
    if (!storeRef.current) return
    const next = todosRef.current.filter((t) => t.id !== id)
    await save(next)
  }

  return { state, addTodo, toggleTodo, deleteTodo }
}
```

Alternative: serialize writes behind a promise chain (`const pending = pending.then(() => save(next))`). The ref approach is simpler and sufficient for this app's single-writer model.

### WR-02: Inline `type` import violates project TypeScript rules

**File:** `apps/tauri-todo/src/hooks/use-todos.ts:1`
**Issue:** `.agents/rules/typescript.md` explicitly requires top-level `import type` and calls out the inline form:

> Always use top-level `import type` — not inline `import { type ... }`. Without this, some bundlers leave behind an empty import side-effect.

The current line mixes a value import (`load`) with an inline type import (`type Store`):

```ts
import { load, type Store } from "@tauri-apps/plugin-store"
```

**Fix:** Split into two imports. The `perfectionist/sort-imports` ESLint rule used project-wide will order them correctly (type imports go in the `type` group):

```ts
import type { Store } from "@tauri-apps/plugin-store"

import { load } from "@tauri-apps/plugin-store"
```

This matches the pattern already used in `apps/tauri-todo/src/components/todo-list.tsx:1-3`.

### WR-03: `TAURI_ENV_DEBUG` truthiness check treats string `"false"` as truthy

**File:** `apps/tauri-todo/vite.config.ts:33-34`
**Issue:** Both build options gate on a raw `process.env` value:

```ts
minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
sourcemap: !!process.env.TAURI_ENV_DEBUG,
```

Env vars are strings. If anything ever sets `TAURI_ENV_DEBUG=false` (a reasonable thing to write in a CI config or `.env` file), both checks flip the wrong way: `minify` becomes `false` and `sourcemap` becomes `true` for what was meant to be a release build. Tauri today only sets the var during debug builds and leaves it unset otherwise, so the bug is latent — but the shape is fragile.

**Fix:** Compare explicitly, or use the boolean-coerced pattern Tauri's own templates use:

```ts
const isDebug = process.env.TAURI_ENV_DEBUG === "true"

// ...
minify: isDebug ? false : "esbuild",
sourcemap: isDebug,
```

This also improves readability — the current `!` / `!!` negations are hard to scan.

## Info

### IN-01: Unused `message` field in error state

**File:** `apps/tauri-todo/src/hooks/use-todos.ts:13` and `apps/tauri-todo/src/components/todo-list.tsx:20-26`
**Issue:** The error branch of `TodosState` carries a `message: string`, set from the caught error's message, but `TodoList` renders a static generic copy (`"Could not load todos. Restart the app and try again."`) and never reads `state.message`. The field is dead data. Phase 02's threat model (T-02-08) intentionally rejects showing raw error messages in the UI, so that part is correct — but the state field is orphaned.

**Fix:** Either (a) drop `message` from the error variant since nothing reads it:

```ts
export type TodosState =
  | { status: "loading" }
  | { status: "ready"; todos: Todo[] }
  | { status: "error" }
```

…or (b) keep it for future use (e.g., logging/telemetry) and add a one-line `console.error(message)` at the point of capture so the value is at least observable in `adb logcat` during Android verification.

### IN-02: Redundant trim in `addTodo`

**File:** `apps/tauri-todo/src/hooks/use-todos.ts:54-60` and `apps/tauri-todo/src/components/todo-input.tsx:11-16`
**Issue:** `TodoInput.handleSubmit` already trims and guards against empty:

```ts
const trimmed = text.trim()
if (trimmed.length === 0) return
await onAdd(trimmed)
```

`useTodos.addTodo` repeats the same trim-and-guard. Not a bug — defensive duplication is sensible for a public hook API — but worth noting so a future reader does not assume one end is authoritative. If the hook is meant to be the trust boundary (since it owns persistence), keep `addTodo`'s check and simplify the component; if the component is the boundary, drop the re-trim in the hook. Pick one and document it.

**Fix:** No change required. If consolidating, prefer keeping the hook's validation (since it is the public API surface) and simplifying the component:

```ts
// todo-input.tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  if (text.trim().length === 0) return // still guard UX, but trust hook for persistence validation
  await onAdd(text)
  setText("")
}
```

### IN-03: Input has no associated `<label>` element

**File:** `apps/tauri-todo/src/components/todo-input.tsx:22-29`
**Issue:** The text input relies on a `placeholder` for its accessible name. Screen readers will announce "edit text" with no context beyond the placeholder (which some AT configurations strip). For a mobile todo app targeting Android TalkBack / iOS VoiceOver, an explicit label is preferable.

**Fix:** Either add a visible label or a visually-hidden one:

```tsx
<label htmlFor="todo-text" className="sr-only">
  New todo
</label>
<input
  id="todo-text"
  aria-label="New todo"
  autoFocus
  ...
/>
```

`aria-label="New todo"` alone is sufficient if you don't want to introduce a label element. Low priority for a proof-of-concept experiment but trivial to add.

### IN-04: `host || false` silently coerces empty string to `false`

**File:** `apps/tauri-todo/vite.config.ts:12`
**Issue:** `host: host || false` accepts the intended shape (`string | boolean`) but collapses `""` and `undefined` to the same value. This is intentional for Vite's config (both disable external exposure), so no bug — but the `||` pattern is a common source of subtle env-var bugs when someone later adds a non-string type. A more explicit form documents intent:

```ts
host: host ?? false,  // treat only `undefined` as "not set", keep empty string untouched
```

Either works for today's behavior; choose based on whether an empty string should be treated as "unset" (`||`) or as "explicitly empty" (`??`).

**Fix:** No change required. Documenting here so the next person reading this config knows the distinction exists.

---

_Reviewed: 2026-04-16T19:40:58Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
