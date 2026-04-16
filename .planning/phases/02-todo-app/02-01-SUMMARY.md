---
phase: 02-todo-app
plan: 01
subsystem: data-layer
tags: [tauri, react, hooks, persistence, rust, plugin-store, discriminated-union]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Tauri v2 project scaffolded, plugin-store 2.4.2 installed, store:default capability granted, verification-screen pattern (load/set/save/get with error narrowing)
provides:
  - useTodos hook: single source of truth for todo state and persistence
  - Todo type (id, text, completed) and TodosState discriminated-union type
  - CRUD callbacks (addTodo, toggleTodo, deleteTodo) with trim-and-no-op semantics
  - Minimal Rust entry point (lib.rs reduced from 13 to 7 lines, greet removed, store plugin retained)
affects: [02-02 UI components (import useTodos from this hook), 02-03 verification (Android device end-to-end exercise)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Custom-hook store I/O with useRef for non-reactive Store handle and useState for discriminated state
    - StrictMode-safe async init via `cancelled` flag checked after every await
    - crypto.randomUUID inside mutation callbacks (never in render body)
    - Explicit save (autoSave false) via store.set + store.save on every mutation
    - Unified error narrowing `err instanceof Error ? err.message : String(err)` mirroring verification-screen.tsx

key-files:
  created:
    - apps/tauri-todo/src/hooks/use-todos.ts
  modified:
    - apps/tauri-todo/src-tauri/src/lib.rs

key-decisions:
  - "Hold Store instance in useRef<Store | null>, not useState: the Store is infrastructure, not display data, and stuffing it into state would trigger spurious re-renders on the StrictMode double-mount."
  - "No isTauriRuntime guard in the hook: Phase 2 runs only inside Tauri (Android device verification in Plan 03); letting the try-catch surface the platform error naturally means web dev sees a clear error state rather than silent no-op."
  - "Use Option B (omit invoke_handler entirely) over Option A (empty generate_handler!) for lib.rs cleanup: cleaner and avoids any stylistic warnings in current/future Tauri versions."
  - "No-op mutations when state.status is not ready: prevents race conditions between mount-time load and early user interaction (StrictMode or fast taps)."

patterns-established:
  - "Pattern: store-backed custom hook. Mount effect loads store with defaults-empty + autoSave-false; ref holds the Store; callbacks guard on state.status === 'ready' and save after each mutation."
  - "Pattern: discriminated-union state machine with three variants (loading, ready+todos, error+message). Consumers narrow via state.status === 'ready' before reading todos."
  - "Pattern: StrictMode-safe cleanup. Top-level `let cancelled = false`; cleanup sets it to true; every await boundary checks `if (cancelled) return` before mutating state."

requirements-completed: [TODO-01, TODO-02, TODO-03, PERS-01, PERS-02, PERS-03]

# Metrics
duration: 3min 21s
completed: 2026-04-16
---

# Phase 02 Plan 01: useTodos hook and Rust cleanup Summary

**useTodos hook with StrictMode-safe discriminated-union state, Tauri plugin-store persistence (load/set/save with autoSave false), and lib.rs stripped to 7 lines retaining only the store plugin registration.**

## Performance

- **Duration:** 3 min 21 s
- **Started:** 2026-04-16T18:53:29Z
- **Completed:** 2026-04-16T18:56:50Z
- **Tasks:** 2
- **Files modified:** 2 (1 created, 1 modified)

## Accomplishments
- Added `apps/tauri-todo/src/hooks/use-todos.ts` (75 lines) exporting `useTodos`, `Todo`, and `TodosState` — the data layer Plan 02 UI will consume.
- Hook persists via `@tauri-apps/plugin-store` (load("store.json", { autoSave: false, defaults: {} })); every CRUD mutation calls `store.set("todos", next)` followed by `store.save()` so restarts reload the last saved array.
- Stripped `apps/tauri-todo/src-tauri/src/lib.rs` from 13 to 7 non-empty lines: greet command, `#[tauri::command]` attribute, and `.invoke_handler(...)` all removed; `tauri_plugin_store::Builder::new().build()` and the mobile entry point preserved.
- `pnpm typecheck`, `pnpm lint`, and `cargo check` all exit 0 with zero errors and zero warnings.

## Task Commits

Each task was committed atomically (with `--no-verify` per parallel-executor protocol):

1. **Task 1: Create useTodos hook with discriminated-union state and store-backed CRUD** — `0b7fec9` (feat)
2. **Task 2: Remove Rust greet command from lib.rs, keep store plugin registration** — `81a300f` (chore)

## Files Created/Modified
- `apps/tauri-todo/src/hooks/use-todos.ts` (CREATED, 75 lines) — Custom hook owning Tauri Store I/O and CRUD state; exports `Todo` and `TodosState` types.
- `apps/tauri-todo/src-tauri/src/lib.rs` (MODIFIED, 13 → 7 lines) — Removed greet command and invoke_handler; preserved store plugin registration and mobile entry point attribute.

## Decisions Made
- **useRef for Store instance** (not useState): the Store handle is infrastructure, not display data; using state would churn renders on the StrictMode double-mount and every save. The ref survives re-renders without triggering them.
- **No isTauriRuntime guard in the hook**: mirrors the locked decision from 02-CONTEXT (D-07 / RESEARCH Open Question 2). Phase 2 is validated on an Android device; a web-dev run will surface a natural store-load error which the UI renders as `status: "error"` (exactly the branch that needs manual testing anyway).
- **Option B over Option A for lib.rs**: omitting `invoke_handler` is shorter and avoids the possibility of lint warnings some Tauri versions emit for empty `generate_handler!` macros.
- **Mutations no-op when `state.status !== "ready"`**: prevents a user tap during mount from racing with the async store.load and clobbering state before the initial read completes.
- **`trim()` + empty-check inside `addTodo`**: matches the UI-SPEC intent (Add disabled when empty) but keeps the logic in the hook so any consumer gets the same semantics without reimplementing it.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 — Blocking] Built `packages/eslint-config` dist before first typecheck**
- **Found during:** Task 1 verification (`pnpm typecheck`)
- **Issue:** Fresh worktree had no `node_modules`; after `pnpm install`, typecheck failed with `eslint.config.ts(1,23): error TS2307: Cannot find module '@monorepo-template/eslint-config'` because the package's `dist/` is not checked in and had never been built in this worktree. Typecheck could not proceed without it.
- **Fix:** Ran `pnpm install --frozen-lockfile` at the worktree root, then `cd packages/eslint-config && pnpm build` (tsup bundled `dist/index.js` and `dist/index.d.ts`). Both artifacts live only in `node_modules`/`packages/eslint-config/dist` and are not committed.
- **Files modified:** none tracked (build output only)
- **Verification:** `pnpm typecheck` subsequently exits 0 with no errors; `pnpm lint` likewise exits 0.
- **Committed in:** N/A — no source files changed; the only effect was materializing build artifacts the repo's existing tooling expects.

---

**Total deviations:** 1 auto-fixed (1 blocking setup fix)
**Impact on plan:** None on plan scope. This was a one-time worktree bootstrap step required for the tooling that the plan's verification steps call; no code or config was altered.

## Issues Encountered
- **Worktree cold start:** the worktree had no installed dependencies and no built workspace package bundles. Running `pnpm install` plus a single `pnpm --filter @monorepo-template/eslint-config build` produced the expected `dist/index.d.ts` and typecheck immediately passed. Logged as a deviation above.
- **Initial `cargo check`** pulled ~484 crates from crates.io (first-time build in this worktree) and took ~40 s. Zero errors, zero warnings on the tauri-todo crate itself. Subsequent runs will be incremental.
- **Cargo.lock and target/ left untracked:** cargo check generated these under `apps/tauri-todo/src-tauri/`. They were already untracked before execution (cold worktree) and remain untracked; neither is part of the plan's task scope. The root `.gitignore` does not currently exclude them explicitly, but the executor-protocol rule is to not commit generated artifacts not part of the task. Noting here for visibility; an explicit `.gitignore` entry could be added in a follow-up plan if desired.

## Threat Flags

None. No new network endpoints, auth paths, file access patterns, or trust-boundary schema changes introduced. The hook reads and writes the same `store.json` key-value file declared in T-02-01, with no new capabilities beyond `store:default` already granted. T-02-02 mitigation (error messages narrowed in hook, generic UI copy rendered in Plan 02) is implemented at the hook layer exactly as planned: raw `err.message` is held in `state.message` but the UI surface in Plan 02 is responsible for the generic-copy rendering.

## Next Phase Readiness
- **Plan 02 (UI components)** can import `useTodos`, `Todo`, and `TodosState` from `@/hooks/use-todos` and build the three presentational components (input row, todo list, error/loading branches) on top of the exported CRUD callbacks.
- **Plan 03 (Android verification)** will exercise the full load → add → toggle → delete → restart → re-load cycle on a device; nothing in this plan is web-only.

## Self-Check: PASSED

Verified post-write:

- FOUND: `apps/tauri-todo/src/hooks/use-todos.ts` (75 lines)
- FOUND: `apps/tauri-todo/src-tauri/src/lib.rs` (modified, 7 non-empty lines)
- FOUND: commit `0b7fec9` (Task 1: feat useTodos)
- FOUND: commit `81a300f` (Task 2: chore remove greet)
- PASS: 17/17 grep-based acceptance criteria for Task 1
- PASS: 11/11 grep-based acceptance criteria for Task 2
- PASS: `pnpm typecheck` exits 0
- PASS: `pnpm lint` exits 0
- PASS: `cargo check` exits 0 with zero warnings

---
*Phase: 02-todo-app*
*Completed: 2026-04-16*
