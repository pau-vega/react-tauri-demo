---
phase: 02-todo-app
fixed_at: 2026-04-16T21:55:16Z
review_path: .planning/phases/02-todo-app/02-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 02: Code Review Fix Report

**Fixed at:** 2026-04-16T21:55:16Z
**Source review:** .planning/phases/02-todo-app/02-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3 (Warning severity)
- Fixed: 3
- Skipped: 0
- Out of scope (Info): 4 — IN-01, IN-02, IN-03, IN-04 not addressed per `critical_warning` fix scope

## Fixed Issues

### WR-01: Stale-state race on rapid taps in `useTodos`

**Files modified:** `apps/tauri-todo/src/hooks/use-todos.ts`
**Commit:** 5b7bd96
**Applied fix:** Added a `todosRef` that tracks the latest committed todos list. The `init()` effect and `save()` both update `todosRef.current` alongside `setState`, so subsequent callbacks always read from the ref instead of the render-time `state.todos` closure. Replaced the `state.status !== "ready"` guards in `addTodo`/`toggleTodo`/`deleteTodo` with `!storeRef.current` checks to keep the "store must be loaded" gating while dropping the stale-state dependency. Rapid-tap scenarios (toggle + delete before first commit) now serialize correctly: the second handler reads the just-updated ref and writes a consistent `next` array.

### WR-02: Inline `type` import violates project TypeScript rules

**Files modified:** `apps/tauri-todo/src/hooks/use-todos.ts`
**Commit:** ba88920
**Applied fix:** Split `import { load, type Store } from "@tauri-apps/plugin-store"` into two top-level imports — `import type { Store } from "@tauri-apps/plugin-store"` followed by `import { load } from "@tauri-apps/plugin-store"`. Matches the pattern already established in `apps/tauri-todo/src/components/todo-list.tsx` and satisfies `.agents/rules/typescript.md` (top-level `import type`, no inline form). TypeScript compile clean.

### WR-03: `TAURI_ENV_DEBUG` truthiness check treats string `"false"` as truthy

**Files modified:** `apps/tauri-todo/vite.config.ts`
**Commit:** a36fe13
**Applied fix:** Introduced `const isDebug = process.env.TAURI_ENV_DEBUG === "true"` and rewrote the two build options to use the boolean directly: `minify: isDebug ? false : "esbuild"` and `sourcemap: isDebug`. This removes the `!`/`!!` negations that previously treated the literal string `"false"` as truthy, and makes release behavior deterministic regardless of how downstream tooling sets or unsets the env var.

## Skipped Issues

None — all in-scope findings were fixed successfully. (Info findings IN-01 through IN-04 were out of scope for this fix pass.)

---

_Fixed: 2026-04-16T21:55:16Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
