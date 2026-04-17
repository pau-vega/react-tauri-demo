---
phase: 03-mobile-polish
reviewed: 2026-04-17T00:00:00Z
depth: standard
files_reviewed: 19
files_reviewed_list:
  - apps/tauri-todo/package.json
  - apps/tauri-todo/src-tauri/Cargo.toml
  - apps/tauri-todo/src-tauri/src/lib.rs
  - apps/tauri-todo/src-tauri/capabilities/mobile.json
  - apps/tauri-todo/src/lib/runtime.ts
  - apps/tauri-todo/src/lib/runtime.test.ts
  - apps/tauri-todo/src/lib/haptics.ts
  - apps/tauri-todo/src/lib/haptics.test.ts
  - apps/tauri-todo/src/lint/no-hover.test.ts
  - apps/tauri-todo/src/lint/no-ui-package.test.ts
  - apps/tauri-todo/src/lint/capabilities.test.ts
  - apps/tauri-todo/src/components/todo-app.tsx
  - apps/tauri-todo/src/components/todo-app.test.tsx
  - apps/tauri-todo/src/components/todo-input.tsx
  - apps/tauri-todo/src/components/todo-input.test.tsx
  - apps/tauri-todo/src/components/todo-item.tsx
  - apps/tauri-todo/src/components/todo-item.test.tsx
  - apps/tauri-todo/src/hooks/use-todos.ts
  - apps/tauri-todo/src/hooks/use-todos.test.ts
findings:
  critical: 0
  warning: 2
  info: 3
  total: 5
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-04-17
**Depth:** standard
**Files Reviewed:** 19
**Status:** issues_found

## Summary

All Phase 3 deliverables are structurally correct and align with the locked decisions in `03-CONTEXT.md` and `03-RESEARCH.md`. The Tauri/Rust side (`Cargo.toml`, `lib.rs`, `capabilities/mobile.json`) follows the mobile-only `#[cfg(mobile)]` guard pattern exactly. The haptics wrapper (`haptics.ts` + `runtime.ts`) satisfies D-13 (errors swallowed silently) and D-14 (runtime guard). The `use-todos.ts` haptic gating is more correct than the research pattern — haptics fire only after `save()` returns `true`, satisfying D-10/Pitfall 6. Safe-area padding uses the `max(2rem, env(...))` form called for by D-15/D-16/Pitfall 5.

Two warnings are raised: a missing negative-capability assertion in the capabilities test (security gap), and duplicated `collectFiles` helper across two lint tests (maintenance risk). Three info items cover minor style/accessibility points with no runtime impact.

No critical issues found.

## Warnings

### WR-01: `capabilities.test.ts` does not assert that `haptics:default` is absent

**File:** `apps/tauri-todo/src/lint/capabilities.test.ts:8`
**Issue:** The test asserts all three `haptics:allow-*` strings are present in `capabilities/mobile.json`, but it does not assert that the broader `haptics:default` grant is absent. Per the security analysis in `03-RESEARCH.md` ("Grant only the three specific `haptics:allow-*` strings we use; do not use `haptics:default` — too broad") and the CLAUDE.md Tauri v2 convention ("least-privilege capability grants — no `haptics:default`"), a future editor adding `haptics:default` would not be caught by this test. The current file is clean, but the guard is missing.
**Fix:**
```ts
it("capabilities/mobile.json does not contain the overly-broad haptics:default grant", async () => {
  const raw = await readFile(resolve(SRC_TAURI, "capabilities/mobile.json"), "utf8")
  const json = JSON.parse(raw) as { permissions: string[] }
  expect(json.permissions).not.toContain("haptics:default")
})
```

### WR-02: `collectFiles` helper is duplicated across two lint test files

**File:** `apps/tauri-todo/src/lint/no-hover.test.ts:8` and `apps/tauri-todo/src/lint/no-ui-package.test.ts:10`
**Issue:** Both files contain an identical `collectFiles(dir: string): Promise<string[]>` implementation. The two copies include the same exclusion logic (`EXTS` filter, `.test.ts`/`.test.tsx` exclusion, `entry.parentPath ?? dir` fallback). If the exclusion logic needs to change (e.g., adding a new extension, skipping a directory), both files must be updated in sync. A divergence between the two would cause one lint invariant to scan a different set of files than the other.
**Fix:** Extract the helper to a shared test utility, e.g. `apps/tauri-todo/src/lint/collect-files.ts`, and import it from both tests:
```ts
// src/lint/collect-files.ts
import { readdir } from "node:fs/promises"
import { resolve } from "node:path"

const EXTS = [".ts", ".tsx", ".css"]

export async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })
  const out: string[] = []
  for (const entry of entries) {
    if (!entry.isFile()) continue
    if (!EXTS.some((ext) => entry.name.endsWith(ext))) continue
    if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) continue
    const parent = entry.parentPath ?? dir
    out.push(resolve(parent, entry.name))
  }
  return out
}
```
Note: if `collect-files.ts` lives under `src/lint/`, the `no-hover.test.ts` scanner will pick it up and scan it for `hover:` utilities — its content is benign, but you may want to place it outside the scanned directory or add an explicit exclusion for the file itself. An alternative is to keep the duplication but add a comment documenting the intentional copy.

## Info

### IN-01: `<input>` in `TodoInput` has no accessible label

**File:** `apps/tauri-todo/src/components/todo-input.tsx:25`
**Issue:** The `<input>` element has a `placeholder` attribute but no `aria-label`, `aria-labelledby`, or associated `<label>` element. WCAG 2.1 SC 1.3.1 requires a programmatic label. `placeholder` alone is not a label substitute — it disappears when the user types and is not reliably exposed by all screen reader / voice control combinations. On a touch-only mobile device, voice control users who say "tap Add a todo" may not be able to target the field by spoken text if only a placeholder is present.
**Fix:**
```tsx
<input
  aria-label="New todo text"
  autoFocus
  className="flex-1 h-11 px-3 bg-white border border-gray-200 rounded-md text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
  onChange={(e) => setText(e.target.value)}
  placeholder="Add a todo..."
  value={text}
/>
```
Alternatively, wrap the input in a `<label>` (visually hidden or visible). The `placeholder` can stay as a hint in addition to the label.

### IN-02: `use-todos.ts` — `todosRef` can become temporarily inconsistent with the plugin-store in-memory state on a partial save failure

**File:** `apps/tauri-todo/src/hooks/use-todos.ts:51`
**Issue:** Inside `save()`, `store.set("todos", next)` is called first (line 51), then `store.save()` (line 52). If `store.save()` throws after `store.set()` resolves, the plugin's in-memory store already holds `next`, but `todosRef.current` is not updated (it remains the old array) and `setState({ status: "error" })` fires. The in-memory plugin store is now ahead of `todosRef.current`. On the error recovery path (not currently implemented in the app), a retry built on top of `todosRef.current` would compute diffs from the old base, potentially producing a double-application of the failed operation.

This is not a current runtime bug because the error state is terminal (no retry logic, and the `TodoInput` is disabled when `state.status !== "ready"`), but it is a latent inconsistency that would surface if recovery is added in a later phase.
**Fix:** If recovery ever becomes in scope, `todosRef.current` should be rolled back to the pre-mutation snapshot inside the catch block, or `store.set` should be called only after `store.save()` commits (swap the call order, if the plugin API supports it). No action required in Phase 3.

### IN-03: `no-hover.test.ts` lint test will scan `no-hover.test.ts`'s companion shared file if `collect-files.ts` is ever created under `src/lint/`

**File:** `apps/tauri-todo/src/lint/no-hover.test.ts:5`
**Issue:** `SRC_DIR` is set to the parent directory of `src/lint/` (i.e., `src/`). `collectFiles` recursively scans all `.ts`/`.tsx`/`.css` files under `src/`, excluding `.test.*` suffixes. Any new non-test `.ts` file added to `src/lint/` (such as a shared helper) will be included in the hover-class and UI-package scan. Currently no such file exists, so there are no false positives. This is worth noting if WR-02 is addressed.
**Fix:** Either place any shared lint helpers outside `src/` (e.g., `src/test/collect-files.ts` which is still scanned but has no forbidden patterns), or add an explicit exclusion for the `lint/` directory in `collectFiles`. No action required if WR-02 is not addressed.

---

_Reviewed: 2026-04-17_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
