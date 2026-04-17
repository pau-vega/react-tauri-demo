---
phase: 02
slug: todo-app
status: approved
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-17
---

# Phase 02 — Validation Strategy

> Retroactive validation contract for Phase 2 (todo-app). Phase was executed under
> `nyquist_validation: false`; gaps were filled via `/gsd-validate-phase` on 2026-04-17.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 (jsdom environment) |
| **Config file** | `apps/tauri-todo/vitest.config.ts` |
| **Setup file** | `apps/tauri-todo/src/test/setup.ts` (registers `@testing-library/jest-dom` matchers) |
| **Quick run command** | `cd apps/tauri-todo && pnpm test` |
| **Full suite command** | `cd apps/tauri-todo && pnpm test` |
| **Watch mode (dev only)** | `cd apps/tauri-todo && pnpm test:watch` |
| **Estimated runtime** | ~2 seconds (4 files, 22 tests) |
| **Test libs** | `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` (all via pnpm catalog) |
| **Mocking strategy** | `vi.mock("@tauri-apps/plugin-store", ...)` with in-memory `StoreDouble` — avoids real Tauri IPC in jsdom |

---

## Sampling Rate

- **After every task commit:** `cd apps/tauri-todo && pnpm test`
- **After every plan wave:** same (full suite is fast — ~2s)
- **Before `/gsd-verify-work`:** full suite must be green
- **Max feedback latency:** ~2 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Test File | Automated Command | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-----------|-------------------|--------|
| 02-01-01 | 01 | 1 | TODO-01, TODO-02, TODO-03 | T-02-02 | Error narrowing surfaces `err.message`; UI renders generic copy | unit (hook) | `src/hooks/use-todos.test.ts` | `cd apps/tauri-todo && pnpm test` | ✅ green |
| 02-01-02 | 01 | 1 | PERS-01 | T-02-04 | Store plugin registration; no greet command residue | static | `apps/tauri-todo/src-tauri/src/lib.rs` | `cd apps/tauri-todo/src-tauri && cargo check` | ✅ green |
| 02-02-01 | 02 | 2 | TODO-01 | T-02-07 | React JSX auto-escape on `todo.text` | integration (component) | `src/components/todo-input.test.tsx` | `cd apps/tauri-todo && pnpm test` | ✅ green |
| 02-02-01 | 02 | 2 | TODO-02, TODO-03 | T-02-07 | Controlled onClick; aria-labels switch on `completed` | integration (component) | `src/components/todo-item.test.tsx` | `cd apps/tauri-todo && pnpm test` | ✅ green |
| 02-02-01 | 02 | 2 | TODO-04 | T-02-08 | Discriminated-union branching; generic error copy (no `err.message` leak) | integration (component) | `src/components/todo-list.test.tsx` | `cd apps/tauri-todo && pnpm test` | ✅ green |
| 02-02-02 | 02 | 2 | TODO-01..04, PERS-02 | T-02-10 | `app.tsx` wires `TodoApp`; no forbidden `@monorepo-template/ui` import | static | `apps/tauri-todo/src/app.tsx` | `cd apps/tauri-todo && pnpm typecheck && pnpm lint` | ✅ green |
| 02-03-01 | 03 | 3 | TODO-01..04, PERS-02 | T-02-15 | On-device preflight + Android device detection | smoke | _no test file — manual checkpoint_ | `adb devices && cd apps/tauri-todo && pnpm android:dev` | ✅ green (2026-04-16) |
| 02-03-02 | 03 | 3 | TODO-01..04, PERS-02 | T-02-13..18 | 7-check human-verify checklist on real device | manual checkpoint | _see 02-03-PLAN.md `<how-to-verify>`_ | user reply "approved" | ✅ green (2026-04-16) |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

### Requirement → Test Cross-Reference

| Requirement | Test Coverage |
|-------------|---------------|
| **TODO-01** (add) | Hook: `use-todos.test.ts` → "adds a new todo with trimmed text…", "is a no-op when addTodo receives whitespace-only text", "is a no-op when addTodo receives an empty string". Component: `todo-input.test.tsx` → submit-via-click, submit-via-Enter, no-op-when-empty |
| **TODO-02** (toggle) | Hook: `use-todos.test.ts` → "toggles only the matching todo's completed flag…", "toggles back to incomplete when called twice on the same id". Component: `todo-item.test.tsx` → onClick invokes `onToggle(todo.id)`; aria-label flips on `completed` |
| **TODO-03** (delete) | Hook: `use-todos.test.ts` → "deletes only the matching todo, leaving other todos unchanged and in order". Component: `todo-item.test.tsx` → onClick invokes `onDelete(todo.id)` without confirmation |
| **TODO-04** (empty state) | Component: `todo-list.test.tsx` → renders loading copy, renders generic error copy, renders "No todos yet / Add your first todo above" when `state.todos.length === 0`, renders one `<li>` per todo when populated |
| **PERS-01** (plugin installed/registered) | Static — grep + `cargo check` (see Manual-Only section) |
| **PERS-02** (persistence across restart) | Platform-level — cannot be automated; Plan 03 Check 7 approved 2026-04-16 |
| **PERS-03** (store:default capability granted) | Static — grep on `capabilities/mobile.json` (see Manual-Only section) |

---

## Wave 0 Requirements

- [x] `apps/tauri-todo/src/hooks/use-todos.test.ts` — useTodos hook behaviors (TODO-01..03, error branch)
- [x] `apps/tauri-todo/src/components/todo-input.test.tsx` — TodoInput form semantics (TODO-01)
- [x] `apps/tauri-todo/src/components/todo-item.test.tsx` — TodoItem toggle + delete (TODO-02, TODO-03)
- [x] `apps/tauri-todo/src/components/todo-list.test.tsx` — TodoList discriminated-union branches (TODO-04)
- [x] `apps/tauri-todo/src/test/setup.ts` — jest-dom matcher registration
- [x] `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` added as devDeps (pnpm catalog)
- [x] `vitest.config.ts` updated with `setupFiles: ["./src/test/setup.ts"]`

All Wave 0 items complete — existing infrastructure plus the seven items above covers every automatable Phase 2 requirement.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `@tauri-apps/plugin-store` installed and registered in Rust entry point | PERS-01 | Static configuration — validated by filesystem + compiler checks, not a behavioral test. A runtime test would require booting Tauri IPC which jsdom cannot do. | 1. `grep -q "tauri_plugin_store::Builder::new().build()" apps/tauri-todo/src-tauri/src/lib.rs`<br>2. `grep -q "@tauri-apps/plugin-store" apps/tauri-todo/package.json`<br>3. `grep -q "tauri-plugin-store" apps/tauri-todo/src-tauri/Cargo.toml`<br>4. `cd apps/tauri-todo/src-tauri && cargo check` exits 0 with zero warnings |
| Todos persist across full app process kill and cold restart | PERS-02 | Requires real Android app lifecycle: OS process termination, filesystem round-trip through Tauri `app_data_dir`, cold-start IPC bridge re-init. No jsdom or Node environment can simulate this. Plan 03 human-verify checkpoint is the load-bearing evidence. | See `02-03-PLAN.md` Check 7: add 2 todos, swipe the app off Android recents, relaunch from the drawer, confirm both todos reappear with preserved completed state. Requires a connected Android device or emulator. User reply "approved" signs off. Approved 2026-04-16 (recorded in `02-03-SUMMARY.md`). |
| `store:default` capability granted for mobile platform | PERS-03 | Static JSON configuration — granting the capability is what allows the JS-side `@tauri-apps/plugin-store` IPC to reach the Rust-side `tauri_plugin_store`. Verifiable by file inspection only. | 1. `grep -q '"store:default"' apps/tauri-todo/src-tauri/capabilities/mobile.json`<br>2. Confirm `"platforms": ["iOS", "android"]` is declared for that capability set |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (22 automated tests + 3 static checks + 1 human-verify)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (every plan-wave has at least one green gate)
- [x] Wave 0 covers all MISSING references (TODO-01..04 now have behavioral coverage)
- [x] No watch-mode flags (`pnpm test` uses `vitest run`, not `vitest` watch)
- [x] Feedback latency < 2 seconds
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-04-17

## Validation Audit 2026-04-17

| Metric | Count |
|--------|-------|
| Gaps found | 4 (TODO-01, TODO-02, TODO-03, TODO-04) |
| Resolved | 4 (all automated via Vitest + React Testing Library) |
| Escalated | 0 |
| Manual-only (by nature) | 3 (PERS-01, PERS-02, PERS-03) |
| Tests passing | 22 / 22 |
