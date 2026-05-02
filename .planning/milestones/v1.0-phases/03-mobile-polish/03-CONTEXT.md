# Phase 3: Mobile Polish - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Mobile-native UX polish for the existing Phase 2 todo app so it feels native on Android — proper touch targets, touch-only interactions, standalone Tailwind, and haptic feedback on the three primary interactions (add, toggle, delete). No backend, no new features, no dark mode, no iOS work (IOS-01..04 remain v2 scope).

</domain>

<decisions>
## Implementation Decisions

### Touch Targets (UX-01)
- **D-01:** Grow all interactive controls to 44px visually — the hit area equals the visible control, no hidden/padded hit-area tricks.
- **D-02:** `TodoInput` input: `h-10` (40px) → `h-11` (44px).
- **D-03:** `TodoInput` Add button: `h-10` (40px) → `h-11` (44px).
- **D-04:** `TodoItem` toggle: `w-6 h-6` (24px) → `w-11 h-11` (44px). The round-dot aesthetic grows into a larger round control; the internal checkmark scales accordingly.
- **D-05:** `TodoItem` delete button: `w-8 h-8` (32px) → `w-11 h-11` (44px). The `×` glyph can stay size-xl; outer container grows.
- **D-06:** Row padding on `TodoItem` (`px-3 py-3`) stays as-is — rows will look slightly taller because the 44px toggle and delete sit inside them; that's intentional breathing room, not a separate spacing change.

### Haptic Feedback (UX-04)
- **D-07:** Install `@tauri-apps/plugin-haptics` — both JS (`pnpm add`) and Rust side (`Cargo.toml` + `lib.rs` registration). Manual install only, NOT via `tauri add` (pnpm workspace bug from Phase 1 D-46 still applies).
- **D-08:** Add plugin registration to `src-tauri/src/lib.rs` alongside existing `tauri_plugin_store` builder registration.
- **D-09:** Add three haptic capability permissions to `src-tauri/capabilities/mobile.json`:
  - `haptics:allow-impact-feedback`
  - `haptics:allow-notification-feedback`
  - `haptics:allow-selection-feedback`
- **D-10:** Add-todo interaction → `impactFeedback('medium')`. Called on successful add (after `store.save()` resolves), not on button press. If the add is a no-op (empty/whitespace input already filtered by `TodoInput`), no haptic fires.
- **D-11:** Toggle-complete interaction → `selectionFeedback()`. Called on every toggle regardless of direction (complete → incomplete also fires). Extends beyond UX-04's strict add/delete requirement so the three primary interactions feel consistent.
- **D-12:** Delete-todo interaction → `notificationFeedback('warning')`. Signals destructive action with the plugin's multi-pulse warning pattern, distinct from the single-thunk add feel.
- **D-13:** Haptic calls are fire-and-forget — awaited (they return promises) but any rejection is swallowed silently. Haptics must never break a CRUD operation. This handles devices where haptic support is flaky per Tauri plugin docs ("no standards or requirements for vibration support on Android").
- **D-14:** Web / desktop dev runs: haptic calls should degrade gracefully when not on mobile. Wrap calls behind an `isTauriRuntime()`-style guard (pattern already established in Phase 1's `verification-screen.tsx`) or rely on the plugin returning silently off-platform.

### Safe-Area Insets
- **D-15:** Apply `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` padding to the top-level `<main>` in `TodoApp` so the title clears the Android status bar and the list doesn't sit behind the gesture/navigation bar. Phase 1 D-25 set `viewport-fit=cover` but that only unlocks the insets — this phase actually applies them.
- **D-16:** Implement via Tailwind v4 arbitrary values: `pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]` or equivalent `supports-[...]`-guarded utilities. Left/right insets not needed (Android typically doesn't have horizontal notches and the content already has `px-4`).

### Already Met (Verified, No Work)
- **D-17:** UX-02 (no hover states): codebase-wide grep confirms zero `hover:` classes in `apps/tauri-todo/src`. All press feedback uses `active:opacity-90` per Phase 2 established pattern. No changes required — just re-verify after refactor lands.
- **D-18:** UX-03 (standalone Tailwind): codebase-wide grep confirms zero `@monorepo-template/ui` imports in `apps/tauri-todo`. Only `tailwindcss` + plain Tailwind utilities in play. No changes required — just re-verify after refactor lands.

### Device Verification
- **D-19:** Phase 3 ends with an on-device verification step on the same physical Android device used in Phase 1 and Phase 2 (follows D-29 Phase 1 workflow). Haptics cannot be verified on an emulator reliably — a physical device is required.

### Claude's Discretion
- Exact Tailwind token for safe-area inset fallback padding (whether `max()` fallback is 2rem, `py-8`, or something else).
- Where exactly in the component tree the haptic `isTauriRuntime` guard lives (could be in `use-todos.ts` alongside the CRUD ops, or a thin `src/lib/haptics.ts` wrapper, or inline in each handler).
- Visual scaling of the inner `×` glyph and toggle checkmark after containers grow to 44px — should look balanced but exact size/weight is aesthetic.
- Whether the haptics wrapper exports three named functions (`hapticAdd`, `hapticToggle`, `hapticDelete`) or a single function with a discriminated-union `kind` argument.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Tauri Haptics Plugin
- `https://v2.tauri.app/plugin/haptics` — Official haptics plugin docs: JS API (`vibrate`, `impactFeedback`, `notificationFeedback`, `selectionFeedback`), capability permission names, npm/cargo install commands, Android support caveats.
- `@tauri-apps/plugin-haptics` npm package — JS bindings to install.
- `tauri-plugin-haptics` cargo crate — Rust plugin to register.

### Known Workspace Issue (Same Fix as Phase 1 / Phase 2)
- `https://github.com/tauri-apps/tauri/issues/12706` — `tauri add` broken in pnpm workspaces. Install both JS and Rust sides manually, matching the store-plugin install pattern from Phase 1 D-46.

### Project Requirements
- `.planning/REQUIREMENTS.md` §Mobile UX — UX-01, UX-02, UX-03, UX-04.
- `.planning/ROADMAP.md` §"Phase 3: Mobile Polish" — goal, depends-on, success criteria (4 items).
- `.planning/PROJECT.md` — Mobile-only constraint, no-backend constraint, iOS deferred to v2.

### Prior Phase Context (Carry Forward)
- `.planning/phases/01-foundation/01-CONTEXT.md` — Foundation decisions: D-21 system fonts, D-25 `viewport-fit=cover`, D-27 light-only color scheme, D-28 Android SDK 24 minimum, D-29 physical-device dev workflow, D-46/D-47 manual plugin install + haptics deferred to Phase 3.
- `.planning/phases/02-todo-app/02-CONTEXT.md` — Todo app decisions: D-07 component split, `active:opacity-90` press pattern, confirmation that UI package is not used.

### Existing Code (Must Read Before Editing)
- `apps/tauri-todo/src/components/todo-input.tsx` — Current `h-10` input/button sizes to bump to `h-11`.
- `apps/tauri-todo/src/components/todo-item.tsx` — Current `w-6 h-6` toggle and `w-8 h-8` delete to bump to `w-11 h-11`; where haptic calls for toggle and delete wire in.
- `apps/tauri-todo/src/components/todo-app.tsx` — Top-level `<main>` that receives safe-area-inset padding.
- `apps/tauri-todo/src/hooks/use-todos.ts` — `addTodo`, `toggleTodo`, `deleteTodo` functions; candidate location for haptic calls or for a haptics wrapper import.
- `apps/tauri-todo/src-tauri/src/lib.rs` — Add `tauri_plugin_haptics::init()` to the Builder chain.
- `apps/tauri-todo/src-tauri/Cargo.toml` — Add `tauri-plugin-haptics` dependency (version aligned with `@tauri-apps/plugin-haptics` JS package).
- `apps/tauri-todo/src-tauri/capabilities/mobile.json` — Add the three `haptics:allow-*` permissions.
- `apps/tauri-todo/package.json` — Add `@tauri-apps/plugin-haptics` to `dependencies`.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `isTauriRuntime()` guard established in Phase 1 (`verification-screen.tsx`) — reuse for haptic no-op on web/desktop dev. Worth promoting to `src/lib/runtime.ts` if not already extracted.
- Tailwind v4 with `@import "tailwindcss"` — arbitrary-value utilities (`pt-[env(...)]`) work out of the box, no plugin needed.
- `active:opacity-90` press pattern — continue using it on the newly-grown 44px controls, no new pattern required.
- Store plugin install (Phase 1) is the blueprint for haptics plugin install — same shape: JS package, Rust crate, `lib.rs` registration, capability permission, manual via `pnpm add` + `Cargo.toml` edit.

### Established Patterns
- Discriminated-union state types (`TodosState` in `use-todos.ts`) — if haptics wrapper needs state, follow the same shape.
- Named exports, kebab-case files, camelCase functions, `@/` alias (all Phase 1/2 conventions).
- Light-only color scheme — touch-target sizing does not imply color/theme changes.
- Fire-and-forget async in `use-todos.ts` — `addTodo`, `toggleTodo`, `deleteTodo` already return promises; haptic calls layer in naturally without reshaping the API.

### Integration Points
- `capabilities/mobile.json` gets three new permission strings appended to existing `core:default` + `store:default`.
- `lib.rs` gets one new `.plugin(tauri_plugin_haptics::Builder::new().build())` call (or equivalent init signature — confirm exact API in plugin docs during planning).
- `Cargo.toml` gets one new dep line; `package.json` gets one new dep line.
- `TodoApp` `<main>` className gets safe-area inset padding tokens added.
- `TodoInput` / `TodoItem` className strings get height/width bumps; no structural JSX changes.
- `use-todos.ts` (or a new `src/lib/haptics.ts`) gets the three haptic calls wired into the mutation functions.

</code_context>

<specifics>
## Specific Ideas

- Haptics must be differentiated, not uniform: the "add = medium impact / delete = warning notification" pairing was chosen specifically so users feel a semantic difference between creation and destruction, not just any vibration.
- Toggle haptic deliberately uses `selectionFeedback` rather than a second `impact` — it's the plugin's semantically-correct call for a binary state change and feels lighter than the add/delete pulses, which matches the lower-stakes nature of toggling.
- Safe-area insets are intentionally a "minimum" addition rather than a broader visual refresh — the value is preventing content from hiding under system UI, not redesigning the app.
- Implementation must gracefully handle devices where haptics are unsupported or unreliable (docs note "no standards or requirements for vibration support on Android") — swallow errors silently, never break CRUD.

</specifics>

<deferred>
## Deferred Ideas

- Visual refresh (typography bump, larger rounded corners, press-scale animation, row shadow) — not required for "feels native"; revisit if post-phase testing reveals it still feels web-y.
- Loading/empty/error state polish (spinner instead of "Loading…", friendlier empty-state composition) — current text-only states meet requirements; cosmetic.
- Dark mode / system theme — explicitly deferred from Phase 1 (D-27 light-only), still deferred.
- Swipe-to-delete (ENH-01), inline editing (ENH-02), categories (ENH-03) — v2 scope.
- iOS support (IOS-01..04) — v2 scope; three of the haptic capability entries we're adding already list `"iOS"` in `platforms` so capability file stays iOS-ready, but no iOS install work happens now.
- Haptic on validation failure (e.g., warning pulse on empty-input add attempt) — UI already prevents submit via disabled button, so no haptic is needed; add later if input validation ever becomes lenient.

</deferred>

---

*Phase: 03-mobile-polish*
*Context gathered: 2026-04-17*
