---
phase: 02-todo-app
plan: 02
subsystem: ui-components
tags: [react, tauri, components, ui, tailwind, discriminated-union]

# Dependency graph
requires:
  - phase: 02-todo-app
    plan: 01
    provides: useTodos hook (state + addTodo/toggleTodo/deleteTodo), Todo and TodosState types
provides:
  - TodoApp container component (self-contained, calls useTodos)
  - TodoInput presentational component (controlled form, trim+empty guard, onAdd callback)
  - TodoList presentational component (loading/error/empty/populated branches, discriminated-union switch)
  - TodoItem presentational component (toggle + delete rows, aria-labels for accessibility)
  - app.tsx wired to TodoApp (Phase 1 verification screen removed)
affects: [02-03 Android device verification (will exercise the full UI on a device)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Discriminated-union state consumption via early-return if chain (RESEARCH lines 321-356)
    - Controlled-input form with trim-and-no-op submit and autoFocus for mobile keyboard open
    - Raw Tailwind ternary className pattern (no clsx, no cva — standalone per D-14)
    - Circular toggle with glyph-inside-button (aria-label mode switching based on state)
    - Parent-owns-state / children-are-pure presentational drill (callbacks flow down, state up via hook)

key-files:
  created:
    - apps/tauri-todo/src/components/todo-input.tsx
    - apps/tauri-todo/src/components/todo-item.tsx
    - apps/tauri-todo/src/components/todo-list.tsx
    - apps/tauri-todo/src/components/todo-app.tsx
  modified:
    - apps/tauri-todo/src/app.tsx
    - apps/tauri-todo/vite.config.ts
  deleted:
    - apps/tauri-todo/src/components/verification-screen.tsx

key-decisions:
  - "Leaf-first file creation order (todo-input -> todo-item -> todo-list -> todo-app): keeps every intermediate compile state valid; each parent always sees its children already on disk before it references them."
  - "Delete verification-screen.tsx strictly AFTER updating app.tsx (Pitfall 4): reverse order would leave an intermediate state where app.tsx imports a file that no longer exists and typecheck would fail between the two actions."
  - "Raw Tailwind string ternaries for toggleClass/textClass (no clsx): matches D-14 standalone-styling decision and keeps the components dependency-free inside apps/tauri-todo/."
  - "Rule 3 Vite target fix (safari13 -> esnext): build failure is pre-existing in Phase 1 baseline (same error against the pre-change VerificationScreen code). Root cause is Vite 8 + rolldown internally injecting 2 target overrides that narrow below what esbuild 0.27.7 can transpile for parameter destructuring. Tauri mobile runtimes are modern Chrome/WebKit where esnext is safe."

patterns-established:
  - "Pattern: discriminated-union consumer. TodoList consumes state: TodosState via early returns in the canonical state.status order (loading, error, empty-ready, populated-ready). No switch, no nested ternary ladder."
  - "Pattern: two-way Tailwind toggle class. Boolean state (todo.completed) selects between two full class strings assigned once to a const; JSX references the const. Avoids inline string concatenation and keeps both variants readable side-by-side."
  - "Pattern: mobile-friendly form submit. <form onSubmit> + <button type=\"submit\"> enables both tap-Add and Enter-key submit; e.preventDefault handles the default form submission; autoFocus opens the soft keyboard on cold start."

requirements-completed: [TODO-01, TODO-02, TODO-03, TODO-04, PERS-02]

# Metrics
duration: 6min 4s
completed: 2026-04-16
---

# Phase 02 Plan 02: UI Components and app.tsx wiring Summary

**Four pure presentational React components (TodoApp, TodoInput, TodoList, TodoItem) consuming Plan 01's useTodos hook; app.tsx swapped from Phase 1 VerificationScreen to TodoApp and verification-screen.tsx deleted.**

## Performance

- **Duration:** 6 min 4 s
- **Started:** 2026-04-16T19:00:17Z
- **Completed:** 2026-04-16T19:06:21Z
- **Tasks:** 2
- **Files modified:** 6 (4 created, 2 modified, 1 deleted)

## Accomplishments
- Added four presentational components under `apps/tauri-todo/src/components/`: `todo-input.tsx` (39 lines), `todo-item.tsx` (37 lines), `todo-list.tsx` (44 lines), `todo-app.tsx` (17 lines). All use named exports only and `import type` for type-only imports.
- `TodoInput` renders a controlled form with `autoFocus`, trims input on submit, no-ops on empty, and clears the field after `onAdd` resolves. Button disabled whenever parent passes `disabled=true` or the trimmed text is empty.
- `TodoList` branches on `state.status` via an early-return if chain (loading / error / empty / populated), rendering generic error copy ("Could not load todos. Restart the app and try again.") so raw `err.message` from the hook is not exposed to the UI (T-02-08 mitigation).
- `TodoItem` exposes accessible toggle (aria-label flips between "Mark as complete" and "Mark as incomplete") and delete ("Delete todo") buttons; circular toggle fills blue-700 with white checkmark when completed, empty white circle with gray-300 border when not.
- `TodoApp` composes `useTodos` + `TodoInput` + `TodoList` with the locked layout (`min-h-screen bg-white px-4 py-8` outer, `w-full max-w-md mx-auto flex flex-col gap-6` inner) and heading "Tauri Todo".
- `app.tsx` updated to import `TodoApp` instead of `VerificationScreen`; `App` export name preserved so `main.tsx`'s `import { App } from "./app"` continues to resolve.
- `verification-screen.tsx` (125 lines) deleted from filesystem and git. Zero residual references to `VerificationScreen` or `verification-screen` across `apps/tauri-todo/src/`.
- `pnpm typecheck`, `pnpm lint`, and `pnpm build` all exit 0.

## Task Commits

Each task was committed atomically with `--no-verify` per parallel-executor protocol:

1. **Task 1: Create TodoApp TodoInput TodoList TodoItem components** — `1b3ad54` (feat)
2. **Task 2: Swap app entry to TodoApp, delete verification-screen, unblock vite build** — `5b84df8` (feat)

## Files Created / Modified / Deleted

### Created
- `apps/tauri-todo/src/components/todo-input.tsx` (39 lines) — Controlled form component; consumes `onAdd` async callback and `disabled` boolean prop.
- `apps/tauri-todo/src/components/todo-item.tsx` (37 lines) — Single-row component with circular toggle and delete button; consumes `todo`, `onToggle`, `onDelete`.
- `apps/tauri-todo/src/components/todo-list.tsx` (44 lines) — Discriminated-union branching wrapper; consumes `state: TodosState`, `onToggle`, `onDelete`.
- `apps/tauri-todo/src/components/todo-app.tsx` (17 lines) — Container; calls `useTodos`, passes callbacks to children, provides layout shell and heading.

### Modified
- `apps/tauri-todo/src/app.tsx` (5 non-empty lines preserved) — Swapped import and JSX: `VerificationScreen` -> `TodoApp`. `App` function export name preserved.
- `apps/tauri-todo/vite.config.ts` (1-line build target change + comment) — `target: "safari13"` -> `target: "esnext"` to unblock Vite 8 / rolldown / esbuild 0.27.7 build chain (Rule 3 auto-fix — see Deviations).

### Deleted
- `apps/tauri-todo/src/components/verification-screen.tsx` (-125 lines) — Phase 1 foundation artifact; served its purpose (D-08).

## Decisions Made
- **Leaf-first file creation order** (`todo-input` -> `todo-item` -> `todo-list` -> `todo-app`): guarantees that at every intermediate step the imports already resolve. The alternative (top-down) would temporarily have `todo-app.tsx` referencing `todo-input.tsx` / `todo-list.tsx` that did not yet exist.
- **Update app.tsx BEFORE deleting verification-screen.tsx** (Pitfall 4 in RESEARCH): prevents an intermediate state where `app.tsx` imports a file that has already been removed from the filesystem.
- **Raw Tailwind ternaries, no `clsx` / `cn`**: matches D-14 standalone-styling decision. Both variants of `toggleClass` / `textClass` are full strings assigned to a `const`; the JSX references the const once. Keeps the components zero-dependency inside `apps/tauri-todo`.
- **`App` function export name preserved**: `main.tsx` imports `App` by name; changing it would have broken the entry point. The task scope is strictly an internal component swap, not a rename.
- **No return type annotations on components** (per `.agents/rules/typescript.md`): JSX components and custom hooks are exempt from the explicit-return-type rule; adding them would be noise.
- **Vite target `esnext`** (instead of `safari13`): the pre-existing build failure is rooted in rolldown injecting two internal target overrides that narrow below what esbuild 0.27.7 can transpile for parameter destructuring. Tauri v2 mobile runs modern Android WebView (Chrome) and iOS WebKit — both support ES2020+ natively, so opting out of transpilation is safe. This one-line config change was the minimum required to make `pnpm build` exit 0.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Bootstrapped worktree dependencies before first verification**
- **Found during:** Plan start (before any task)
- **Issue:** Fresh worktree had no `node_modules` and no built `packages/eslint-config/dist`. `pnpm typecheck` would have failed with `Cannot find module '@monorepo-template/eslint-config'` (identical root cause to Plan 01's deviation #1).
- **Fix:** Ran `pnpm install --frozen-lockfile` at worktree root, then `cd packages/eslint-config && pnpm build`. No source files modified; only artifacts under `node_modules` and `packages/eslint-config/dist` produced.
- **Files modified:** none tracked.
- **Verification:** subsequent `pnpm typecheck` exited 0.
- **Committed in:** N/A — no source changes.

---

**2. [Rule 3 — Blocking] Changed `vite.config.ts` build target from `safari13` to `esnext` to unblock `pnpm build`**
- **Found during:** Task 2 final verification (`pnpm build`)
- **Issue:** Build failed with `ERROR: Transforming destructuring to the configured target environment ("safari13" + 2 overrides) is not supported yet` — esbuild 0.27.7 (bundled by Vite 8 / rolldown 1.0.0-rc.15) refuses to transpile parameter destructuring for the effective target. The "2 overrides" come from rolldown's internal defaults narrowing the user-supplied `safari13` target below what esbuild can handle for parameter destructuring. Verified by pre-plan baseline check: the same error occurs when building the untouched Plan 01 output against `VerificationScreen`, proving this is pre-existing and NOT caused by the new components.
- **Attempted fix #1:** `target: ["es2020", "chrome105", "safari14"]` — still failed with the same "2 overrides" suffix, confirming the overrides are internal to rolldown and not driven by user target config.
- **Final fix:** `target: "esnext"` — skips transpilation entirely. Safe for Tauri v2 mobile (Android WebView is modern Chrome, iOS WebView is modern Safari; both support ES2020+).
- **Files modified:** `apps/tauri-todo/vite.config.ts` (3-line target change including explanatory comment).
- **Verification:** `pnpm build` now exits 0; `dist/` produced cleanly (index.html + CSS 9.18 kB + JS 200.24 kB).
- **Scope note:** This strictly exceeds the plan's stated `files_modified` list (which did not include `vite.config.ts`). Applied under Rule 3 because the plan's acceptance criteria explicitly require `pnpm build` exits 0, and without this fix no version of the plan's output — including the pristine Plan 01 baseline — could satisfy that criterion. The upstream infrastructure issue is worth tracking; a follow-up could swap Vite/rolldown/esbuild versions or pin a wider compatibility matrix, but that's out of scope here.
- **Committed in:** `5b84df8` (grouped with Task 2's app.tsx swap + verification-screen deletion, since all three changes form the "make the app render TodoApp end-to-end" outcome).

---

**Total deviations:** 2 auto-fixed (2 blocking setup / infra fixes)
**Impact on plan:** None on user-facing plan scope. The two deviations are strictly infrastructure unblockers — bootstrapping the worktree and a one-line Vite config nudge so the pre-existing build chain could complete. No component code, prop contract, or behavior deviates from the plan's specification.

## Issues Encountered
- **Cold worktree bootstrap:** matched Plan 01's pattern exactly — `pnpm install` + `pnpm --filter @monorepo-template/eslint-config build` makes typecheck and lint immediately work. Logged as deviation #1 for completeness; not tracked in any source file.
- **Pre-existing Vite 8 / rolldown build failure:** surfaced once `pnpm build` was run, identical against both the Plan 01 baseline and the new components. Not unique to this plan's code changes; root cause is in the bundler chain. Documented as deviation #2.
- **ESLint `--fix` auto-formatting:** the `pnpm lint` script runs `eslint . --fix` which auto-formatted two component files (collapsed a ternary onto one line in `todo-item.tsx`; reordered imports in `todo-list.tsx` so `import type` precedes the value import per perfectionist rule). Both changes are mechanical and preserve the file's behavior and named exports; verified after fix.

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or trust-boundary schema changes introduced. T-02-07 (XSS via todo text) is mitigated by React's default JSX escaping (no `dangerouslySetInnerHTML` anywhere — verified empty grep). T-02-08 (error disclosure) is mitigated by TodoList rendering generic copy, not `state.message`. T-02-10 (forbidden module) verified via acceptance grep — zero `@monorepo-template/ui` imports in the new components.

## Known Stubs

None. Every UI branch is wired to a real data source:
- Loading copy shown while `useTodos` reads from `store.json`
- Error copy shown when store load or save throws
- Empty state shown when `state.todos.length === 0`
- Populated list maps over `state.todos`

## Next Phase Readiness

Plan 03 (Android device verification) can now launch the app via `tauri android dev` and exercise the full flow: cold-start load (Loading... -> empty state or populated list), add, toggle, delete, and persistence across restart. The `useTodos` hook and four components collectively satisfy TODO-01 / TODO-02 / TODO-03 / TODO-04 and the rendering half of PERS-02.

## Self-Check: PASSED

Verified post-write:

### Files
- FOUND: `apps/tauri-todo/src/components/todo-input.tsx` (39 lines)
- FOUND: `apps/tauri-todo/src/components/todo-item.tsx` (37 lines)
- FOUND: `apps/tauri-todo/src/components/todo-list.tsx` (44 lines)
- FOUND: `apps/tauri-todo/src/components/todo-app.tsx` (17 lines)
- FOUND: `apps/tauri-todo/src/app.tsx` modified (imports `TodoApp`, returns `<TodoApp />`, `App` export name preserved)
- FOUND: `apps/tauri-todo/vite.config.ts` modified (target `esnext`)
- NOT FOUND (expected): `apps/tauri-todo/src/components/verification-screen.tsx` — deleted and tracked as `D` by git

### Commits
- FOUND: commit `1b3ad54` (Task 1: feat 4 components)
- FOUND: commit `5b84df8` (Task 2: feat app.tsx swap + delete + vite unblock)

### Verification passes
- PASS: `pnpm typecheck` exits 0
- PASS: `pnpm lint` exits 0
- PASS: `pnpm build` exits 0 (dist generated: index.html + 9.18 kB CSS + 200.24 kB JS)
- PASS: zero residual `VerificationScreen` / `verification-screen` references in `apps/tauri-todo/src/`
- PASS: `main.tsx` still imports `App` (name preserved)

### Acceptance criteria spot-checks (all passing)
- Named exports: all four `^export function <Name>` present, zero `^export default` in `todo-*.tsx`
- No `any`, no `hover:`, no `@monorepo-template/ui` imports in `todo-*.tsx`
- `import type` used for type-only imports in `todo-item.tsx` and `todo-list.tsx`
- TodoApp layout Tailwind strings present (`min-h-screen bg-white px-4 py-8`, `w-full max-w-md mx-auto flex flex-col gap-6`, `text-xl font-semibold text-gray-900`)
- TodoInput form wiring: `onSubmit={handleSubmit}`, `autoFocus`, `placeholder="Add a todo..."`, `type="submit"`, `e.preventDefault()`, `setText("")`
- TodoList branches: `state.status === "loading"`, `state.status === "error"`, `state.todos.length === 0`, `state.todos.map`, `key={todo.id}`, all four copy strings
- TodoItem wiring: aria-labels, `onClick={() => onToggle(todo.id)}`, `onClick={() => onDelete(todo.id)}`, `type="button"`, `line-through`, `bg-blue-700`, `active:text-red-600`, `×`, `✓`
- app.tsx: 4 non-empty lines, `import { TodoApp } from "@/components/todo-app"`, `return <TodoApp />`, `export function App()`

---
*Phase: 02-todo-app*
*Completed: 2026-04-16*
