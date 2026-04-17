---
phase: 03-mobile-polish
plan: 01
subsystem: testing
tags: [vitest, tdd, contract-tests, fs-grep-lint, tauri, haptics, safe-area, touch-target]

requires:
  - phase: 02-todo-app
    provides: "Existing use-todos.test.ts scaffold + React component test setup (testing-library/react + jsdom)"

provides:
  - "Contract tests for isTauriRuntime() — probes __TAURI_INTERNALS__"
  - "Contract tests for hapticAdd / hapticToggle / hapticDelete (runtime-guard + plugin call args + error swallow)"
  - "FS-grep lint tests preventing re-introduction of hover: utilities and @monorepo-template/ui imports"
  - "Config correctness tests for mobile.json / lib.rs / Cargo.toml (capabilities + #[cfg(mobile)] guard + pinned version)"
  - "44px touch-target class assertions for TodoInput / TodoItem / TodoApp"
  - "Safe-area inset padding class assertions for TodoApp main"
  - "Haptic call-order + save-failure-gating assertions extending use-todos.test.ts"

affects: [03-02, 03-03, 03-04, 03-05, future-mobile-phases]

tech-stack:
  added: []
  patterns:
    - "TDD RED wave pattern: failing contract tests landed before implementation (drives UX-01..UX-04 invariants)"
    - "FS-grep lint pattern: unit tests that glob src/ for forbidden substrings (hover:, @monorepo-template/ui)"
    - "String-match config correctness pattern: assertions on capabilities/mobile.json + lib.rs + Cargo.toml literals"

key-files:
  created:
    - apps/tauri-todo/src/lib/runtime.test.ts
    - apps/tauri-todo/src/lib/haptics.test.ts
    - apps/tauri-todo/src/lint/no-hover.test.ts
    - apps/tauri-todo/src/lint/no-ui-package.test.ts
    - apps/tauri-todo/src/lint/capabilities.test.ts
    - apps/tauri-todo/src/components/todo-app.test.tsx
  modified:
    - apps/tauri-todo/src/components/todo-input.test.tsx
    - apps/tauri-todo/src/components/todo-item.test.tsx
    - apps/tauri-todo/src/hooks/use-todos.test.ts

key-decisions:
  - "All assertions use exact string/class match (h-11, w-11 h-11, env(safe-area-inset-top)) — no regex fuzziness so tests fail deterministically when class strings are tweaked"
  - "Haptic module mocked at module level with vi.mock(\"@/lib/haptics\") so call-count + call-order can be asserted without actually invoking the Tauri plugin"
  - "FS-grep lints read the real filesystem instead of a bundler AST — single source of truth, no build-step dependency, catches commented-out reintroductions too"
  - "save-failure tests depend on Plan 04's save() refactor from swallow-and-set-error to throw/surface — captured as a comment in the test so Plan 04 knows which contract to satisfy"

patterns-established:
  - "Nyquist-style RED wave: every must_have truth from PLAN frontmatter has at least one failing test before GREEN wave starts"
  - "FS-grep lint: glob files under src/, read contents, assert forbidden substring absent — cheap, bundler-agnostic invariant guard"
  - "Haptic call-order assertion: toHaveBeenCalledTimes(1) on the matched wrapper plus not.toHaveBeenCalled() on the two siblings — prevents cross-wiring regressions"

requirements-completed:
  - UX-01
  - UX-02
  - UX-03
  - UX-04

duration: ~15min
completed: 2026-04-17
---

# Phase 3 Plan 01: Contract Tests (TDD RED) Summary

**Failing contract tests landed for every UX-01..UX-04 must_have truth — runtime/haptics wrappers, FS-grep lints, config correctness, 44px touch targets, safe-area insets, and save-failure haptic gating — so Plans 02, 03, 04 can implement against a known-red baseline.**

## Performance

- **Duration:** ~15 min (spawned agent run + manual finish of Task 4 commit after permission prompt blocked the subagent)
- **Started:** 2026-04-17T09:40Z
- **Completed:** 2026-04-17T09:55Z
- **Tasks:** 4 / 4
- **Files modified:** 9 (6 created, 3 modified)

## Accomplishments

- **Runtime + haptics contract tests** — isTauriRuntime toggles on `window.__TAURI_INTERNALS__`; hapticAdd/Toggle/Delete short-circuit off-Tauri, call their respective plugin export with the right arg shape on-Tauri, and swallow rejections silently (Pitfall 5 + Pitfall 6 guard)
- **FS-grep lints** — `no-hover.test.ts` and `no-ui-package.test.ts` read every file under `apps/tauri-todo/src/**` and assert zero occurrences of `hover:` utilities or `@monorepo-template/ui` imports; `capabilities.test.ts` asserts mobile.json grants the three least-privilege permissions and that lib.rs wraps `tauri_plugin_haptics::init()` in `#[cfg(mobile)]`
- **UI class assertions** — TodoInput asserts `h-11` on input + Add button; TodoItem asserts `w-11 h-11` on toggle (both states) + delete; TodoApp new test file asserts `pt-[max(2rem,env(safe-area-inset-top))]` + matching `pb-` on `<main>`
- **Haptic call-order + gating** — extended use-todos.test.ts with module-level `vi.mock("@/lib/haptics")`, asserts correct wrapper called exactly once per CRUD op, others not called, and three new tests assert haptics are NOT called when `save()` rejects (depends on Plan 04 boolean-return refactor)

## Task Commits

Each task was committed atomically:

1. **Task 1: Runtime + haptics contract tests** — `d8be549` (test)
2. **Task 2: FS-grep + config lints** — `58ce935` (test)
3. **Task 3: Safe-area + 44px UI assertions** — `c566725` (test)
4. **Task 4: use-todos haptic call-order + save-failure assertions** — `ddf47da` (test)

## Files Created/Modified

- `apps/tauri-todo/src/lib/runtime.test.ts` — contract tests for isTauriRuntime predicate
- `apps/tauri-todo/src/lib/haptics.test.ts` — contract tests for three haptic wrappers (runtime-guarded, error-swallowing, correct plugin args)
- `apps/tauri-todo/src/lint/no-hover.test.ts` — FS-grep lint preventing re-introduction of hover: utilities
- `apps/tauri-todo/src/lint/no-ui-package.test.ts` — FS-grep lint preventing re-introduction of @monorepo-template/ui
- `apps/tauri-todo/src/lint/capabilities.test.ts` — config correctness for mobile.json / lib.rs / Cargo.toml
- `apps/tauri-todo/src/components/todo-app.test.tsx` — new file asserting safe-area inset padding
- `apps/tauri-todo/src/components/todo-input.test.tsx` — added h-11 assertions on input + Add button
- `apps/tauri-todo/src/components/todo-item.test.tsx` — added w-11 h-11 assertions on toggle (both variants) + delete
- `apps/tauri-todo/src/hooks/use-todos.test.ts` — added hapticAdd/Toggle/Delete call-count + call-order assertions + three save-failure tests

## Decisions Made

- Tests were split into exactly the 4 task groupings the plan specified — no re-grouping, no file consolidation
- Haptic module mocked via `vi.mock("@/lib/haptics")` with three `vi.fn` wrappers so implementation file can later be created without breaking tests (Pattern 3 from 03-PATTERNS.md)
- Save-failure tests assert `expect(hapticX).not.toHaveBeenCalled()` after a rejecting save — this forces Plan 04 to refactor save() to surface failure rather than swallow it, closing Pitfall 6

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- The subagent hit a Bash permission prompt on Task 4's final git commit; orchestrator recovered by committing the already-edited `use-todos.test.ts` (identical content to plan step 1–8) directly on `main` as commit `ddf47da`. SUMMARY.md was also written by the orchestrator (the blocked subagent never reached the summary step).

## Next Phase Readiness

- Plan 02's work satisfies `capabilities.test.ts` and the version-pin assertions already (3/3 of the capability-string and lib.rs patterns now match).
- Plan 03 (Wave 2) must flip the three component test files from red → green by bumping h-11 / w-11 h-11 class strings and switching `<main>`'s `py-8` to safe-area insets.
- Plan 04 (Wave 2) must create `src/lib/runtime.ts` + `src/lib/haptics.ts` and refactor `use-todos.ts` save() to surface failure — this closes the 11 currently-red contract assertions.

---
*Phase: 03-mobile-polish*
*Completed: 2026-04-17*
