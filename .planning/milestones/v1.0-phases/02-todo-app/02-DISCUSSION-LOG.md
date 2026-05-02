# Phase 2: Todo App - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 02-todo-app
**Areas discussed:** Todo data model & storage, Component architecture, Add/Complete/Delete interactions, Empty state

---

## Todo Data Model & Storage

| Option | Description | Selected |
|--------|-------------|----------|
| Text + completed only | Minimal: id, text, completed. Matches the simple experiment scope. | ✓ |
| Text + completed + timestamps | Add createdAt field for creation order or date display. | |
| Text + completed + order | Add sortOrder field for manual reordering. | |

**User's choice:** Text + completed only
**Notes:** Minimal fields match the experiment scope — no dates, priorities, or categories.

| Option | Description | Selected |
|--------|-------------|----------|
| crypto.randomUUID() | Browser-native UUID v4. Available in WebView, no dependencies. | ✓ |
| Incrementing counter | Simple numeric IDs. Can collide if store gets corrupted. | |
| Date.now() + random suffix | Timestamp-based with collision guard. | |

**User's choice:** crypto.randomUUID()
**Notes:** Standard approach for client-side IDs.

| Option | Description | Selected |
|--------|-------------|----------|
| Single key with array | One "todos" key holding the full array. Simple to load/save. | ✓ |
| Individual keys per todo | Each todo stored under its own key. More complex for listing. | |

**User's choice:** Single key with array
**Notes:** Store file already verified as "store.json" in Phase 1.

| Option | Description | Selected |
|--------|-------------|----------|
| After every mutation | Call store.save() after each add/toggle/delete. Safest. | ✓ |
| Debounced save | Batch saves with 500ms debounce. Risk of data loss. | |
| You decide | Claude picks the save strategy. | |

**User's choice:** After every mutation
**Notes:** Matches the autoSave:false pattern from Phase 1 verification.

---

## Component Architecture

| Option | Description | Selected |
|--------|-------------|----------|
| Separate components | TodoApp, TodoInput, TodoList, TodoItem. Each in own file. | ✓ |
| Single component | Everything in one todo-app.tsx file. | |
| Two components | TodoApp + TodoItem only. | |

**User's choice:** Separate components
**Notes:** Follows existing kebab-case file convention.

| Option | Description | Selected |
|--------|-------------|----------|
| Remove verification screen | Delete verification-screen.tsx. App.tsx renders TodoApp directly. | ✓ |
| Keep behind a flag | Only render when a debug flag is set. | |
| Keep as a separate route | Add basic routing so both screens coexist. | |

**User's choice:** Remove it
**Notes:** Verification screen served its purpose in Phase 1.

| Option | Description | Selected |
|--------|-------------|----------|
| useTodos hook | Custom hook encapsulating store load/save and CRUD. | ✓ |
| State in TodoApp directly | useState + store logic inline in TodoApp. | |
| You decide | Claude picks the approach. | |

**User's choice:** useTodos hook
**Notes:** Hook lives in src/hooks/. TodoApp stays presentational.

| Option | Description | Selected |
|--------|-------------|----------|
| Remove greet command | Delete from lib.rs. Phase 2 doesn't need IPC commands. | ✓ |
| Keep it | Leave as reference for future Rust commands. | |

**User's choice:** Remove it
**Notes:** Store plugin handles persistence directly from JS — no IPC needed.

---

## Add/Complete/Delete Interactions

| Option | Description | Selected |
|--------|-------------|----------|
| Top of screen | Input + add button at top, list below. | ✓ |
| Bottom of screen | List on top, input pinned to bottom. Chat-app style. | |
| Floating action button | FAB opens an input overlay. Material Design style. | |

**User's choice:** Top of screen
**Notes:** Common pattern for simple todo apps.

| Option | Description | Selected |
|--------|-------------|----------|
| Checkbox tap | Checkbox/circle on the left. Tap to toggle. Strikethrough for completed. | ✓ |
| Tap entire row | Tapping anywhere on the row toggles it. | |
| You decide | Claude picks the toggle interaction. | |

**User's choice:** Checkbox tap
**Notes:** Universal and obvious affordance.

| Option | Description | Selected |
|--------|-------------|----------|
| Visible delete button per item | Small X or trash icon on the right. Always visible. | ✓ |
| Tap-to-reveal delete | Delete button hidden until user taps the item. | |
| You decide | Claude picks the delete interaction. | |

**User's choice:** Visible delete button per item
**Notes:** Simple and discoverable. Swipe-to-delete is Phase 3/v2 scope.

| Option | Description | Selected |
|--------|-------------|----------|
| Stay in place with strikethrough | Completed todos stay where they are with dimmed styling. | ✓ |
| Move to bottom | Completed todos sink to bottom with a divider. | |
| Hide with a toggle | Show/hide completed with a toggle control. | |

**User's choice:** Stay in place with strikethrough
**Notes:** Simplest approach — no reordering logic needed.

---

## Empty State

| Option | Description | Selected |
|--------|-------------|----------|
| Simple text message | Centered message like "No todos yet". Minimal. | ✓ |
| Text + icon | Small icon above the message. Slightly more visual. | |
| You decide | Claude picks the empty state design. | |

**User's choice:** Simple text message
**Notes:** Matches the experiment scope — no illustrations or animations.

---

## Claude's Discretion

- Exact Tailwind utility classes for layout and styling
- Loading state while store initializes
- Keyboard behavior (auto-focus, submit on Enter)
- Error handling if store fails

## Deferred Ideas

- Swipe-to-delete gesture — v2 scope (ENH-01)
- Inline todo editing — v2 scope (ENH-02)
- Todo categories or tags — v2 scope (ENH-03)
- Haptic feedback on add/delete — Phase 3 (UX-04)
- Dark mode — Phase 3 territory
