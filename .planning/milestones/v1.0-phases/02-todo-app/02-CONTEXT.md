# Phase 2: Todo App - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Working todo app with add/complete/delete and persistent storage on Android. Users can manage todos that survive app restarts. No mobile UX polish (that's Phase 3) — just functional CRUD with persistence.

</domain>

<decisions>
## Implementation Decisions

### Todo Data Model
- **D-01:** Minimal fields only: `id` (string), `text` (string), `completed` (boolean). No timestamps, priorities, categories, or sort order.
- **D-02:** IDs generated via `crypto.randomUUID()`. Browser-native, no dependencies, available in WebView.
- **D-03:** Todo type defined as a discriminated-union-friendly interface following existing codebase patterns (see `verification-screen.tsx` IpcState/StoreState).

### Storage
- **D-04:** Single key `"todos"` in the Tauri Store holding the full array. Store file: `store.json` (same as Phase 1 verification).
- **D-05:** Save after every mutation — call `store.save()` after each add/toggle/delete. No debouncing. Matches the `autoSave: false` pattern from Phase 1.
- **D-06:** Store plugin already installed and registered (JS: `@tauri-apps/plugin-store`, Rust: `tauri_plugin_store`, capability: `store:default`). No new plugin installation needed.

### Component Architecture
- **D-07:** Separate components: `TodoApp` (container), `TodoInput` (add form), `TodoList` (list wrapper), `TodoItem` (single row). Each in its own file under `src/components/` using kebab-case naming.
- **D-08:** Remove the Phase 1 verification screen (`verification-screen.tsx`). It served its purpose — `App.tsx` renders `TodoApp` directly.
- **D-09:** Remove the `greet` Rust command from `lib.rs`. Phase 2 doesn't need IPC commands — store plugin handles persistence directly from JS.
- **D-10:** `useTodos` custom hook in `src/hooks/use-todos.ts` encapsulates store load/save and CRUD operations. TodoApp stays presentational.

### Interactions
- **D-11:** Add-todo input at the top of the screen with an add button. List below. Input clears after adding.
- **D-12:** Checkbox (or circle) on the left side of each todo to toggle complete/incomplete. Tap checkbox to toggle.
- **D-13:** Completed todos stay in place with strikethrough text and dimmed styling. No reordering or hiding.
- **D-14:** Visible delete button (X or trash icon) on the right side of each todo row. Always visible, no swipe-to-reveal.

### Empty State
- **D-15:** Simple centered text message when no todos exist (e.g., "No todos yet"). No illustrations, icons, or animations.

### Claude's Discretion
- Exact Tailwind utility classes for layout and styling
- Loading state while store initializes on app startup
- Keyboard behavior (auto-focus input, submit on Enter)
- Error handling if store fails to load or save

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Tauri Store Plugin
- Tauri v2 docs at `https://v2.tauri.app/` — Official Tauri v2 documentation
- `https://v2.tauri.app/develop/plugins/` — Plugin usage patterns
- `@tauri-apps/plugin-store` API — `load()`, `store.set()`, `store.get()`, `store.save()` (already verified in Phase 1)

### Project Requirements
- `.planning/REQUIREMENTS.md` — Phase 2 requirements: TODO-01 through TODO-04, PERS-01 through PERS-03
- `.planning/PROJECT.md` — Project constraints, known issues (pnpm `tauri add` bug)
- `.planning/ROADMAP.md` — Phase 2 success criteria (5 items)

### Phase 1 Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Foundation decisions (monorepo integration, styling, conventions)

### Existing Code
- `apps/tauri-todo/src-tauri/src/lib.rs` — Current Rust backend (greet command to remove, store plugin registration to keep)
- `apps/tauri-todo/src-tauri/capabilities/mobile.json` — Store capability already granted
- `apps/tauri-todo/src/components/verification-screen.tsx` — Phase 1 screen to remove (reference for store API usage patterns)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@tauri-apps/plugin-store` already in `package.json` dependencies — `load()`, `set()`, `get()`, `save()` API verified working on Android
- Tailwind CSS configured with `@import "tailwindcss"` in `index.css`
- `@` path alias mapping to `src/` — use `@/components/todo-app` style imports
- Discriminated union pattern already established in `verification-screen.tsx` (IpcState, StoreState types)
- `isTauriRuntime()` guard function — may be useful for graceful degradation during web dev

### Established Patterns
- Named exports only, kebab-case files, PascalCase components
- Light-only color scheme (D-27 from Phase 1)
- System fonts (D-21 from Phase 1)
- React StrictMode enabled
- `active:opacity-90` for button press feedback (not hover states)

### Integration Points
- `App.tsx` — swap `VerificationScreen` import for `TodoApp`
- `lib.rs` — remove `greet` command, keep store plugin registration
- `store.json` — reuse same store file, new `"todos"` key alongside any Phase 1 test data

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

- Swipe-to-delete gesture — v2 scope (ENH-01)
- Inline todo editing — v2 scope (ENH-02)
- Todo categories or tags — v2 scope (ENH-03)
- Haptic feedback on add/delete — Phase 3 (UX-04)
- Dark mode — Phase 3 territory

</deferred>

---

*Phase: 02-todo-app*
*Context gathered: 2026-04-16*
