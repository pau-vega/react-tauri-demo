# Phase 3: Mobile Polish - Research

**Researched:** 2026-04-17
**Domain:** Mobile-native UX polish for an Android Tauri v2 app — touch targets, haptic feedback, safe-area insets
**Confidence:** HIGH

## Summary

Phase 3 adds four polish items on top of a working Android todo app: 44px touch targets, haptic feedback on add/toggle/delete, safe-area inset padding, and re-verification that hover states and UI-package imports remain absent. All locked decisions in `03-CONTEXT.md` map cleanly to the official `@tauri-apps/plugin-haptics` API (v2.3.2) — `impactFeedback('medium')` for add, `selectionFeedback()` for toggle, `notificationFeedback('warning')` for delete. The plugin follows the familiar Tauri v2 install pattern (manual JS + Cargo + `lib.rs` + capability because of the pnpm-workspace `tauri add` bug), but with one critical deviation from Phase 1's store-plugin shape: haptics is Android/iOS-only, so registration must live inside `.setup(|app| { #[cfg(mobile)] app.handle().plugin(...) })` — not at the `Builder::default()` root chain.

Tailwind v4 has no built-in safe-area utility; the standard, no-plugin form is the arbitrary-value utility `pt-[env(safe-area-inset-top)]` / `pb-[env(safe-area-inset-bottom)]`, applied to the top-level `<main>` in `TodoApp`. The `isTauriRuntime()` guard from Phase 1 was deleted with `verification-screen.tsx` in Phase 2 — it must be re-introduced, promoted to `src/lib/runtime.ts`, and the one-liner `typeof window !== "undefined" && "__TAURI_INTERNALS__" in window` detection reused verbatim.

**Primary recommendation:** Ship a thin `src/lib/haptics.ts` wrapper exporting three named functions (`hapticAdd`, `hapticToggle`, `hapticDelete`) that each call `isTauriRuntime()`, `try/catch`-swallow errors, and `void`-return. Call them from `useTodos` CRUD after `store.save()` resolves. Apply safe-area padding via Tailwind v4 arbitrary values directly on `<main>`. Grow five class strings (`h-10`→`h-11`, `w-6 h-6`→`w-11 h-11`, `w-8 h-8`→`w-11 h-11`). No structural refactors.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Touch Targets (UX-01)**
- **D-01:** Grow all interactive controls to 44px visually — the hit area equals the visible control, no hidden/padded hit-area tricks.
- **D-02:** `TodoInput` input: `h-10` (40px) → `h-11` (44px).
- **D-03:** `TodoInput` Add button: `h-10` (40px) → `h-11` (44px).
- **D-04:** `TodoItem` toggle: `w-6 h-6` (24px) → `w-11 h-11` (44px). The round-dot aesthetic grows into a larger round control; the internal checkmark scales accordingly.
- **D-05:** `TodoItem` delete button: `w-8 h-8` (32px) → `w-11 h-11` (44px). The `×` glyph can stay size-xl; outer container grows.
- **D-06:** Row padding on `TodoItem` (`px-3 py-3`) stays as-is — rows will look slightly taller because the 44px toggle and delete sit inside them; that's intentional breathing room, not a separate spacing change.

**Haptic Feedback (UX-04)**
- **D-07:** Install `@tauri-apps/plugin-haptics` — both JS (`pnpm add`) and Rust side (`Cargo.toml` + `lib.rs` registration). Manual install only, NOT via `tauri add` (pnpm workspace bug from Phase 1 D-46 still applies).
- **D-08:** Add plugin registration to `src-tauri/src/lib.rs` alongside existing `tauri_plugin_store` builder registration.
- **D-09:** Add three haptic capability permissions to `src-tauri/capabilities/mobile.json`:
  - `haptics:allow-impact-feedback`
  - `haptics:allow-notification-feedback`
  - `haptics:allow-selection-feedback`
- **D-10:** Add-todo interaction → `impactFeedback('medium')`. Called on successful add (after `store.save()` resolves), not on button press. If the add is a no-op (empty/whitespace input already filtered by `TodoInput`), no haptic fires.
- **D-11:** Toggle-complete interaction → `selectionFeedback()`. Called on every toggle regardless of direction (complete → incomplete also fires). Extends beyond UX-04's strict add/delete requirement so the three primary interactions feel consistent.
- **D-12:** Delete-todo interaction → `notificationFeedback('warning')`. Signals destructive action with the plugin's multi-pulse warning pattern, distinct from the single-thunk add feel.
- **D-13:** Haptic calls are fire-and-forget — awaited (they return promises) but any rejection is swallowed silently. Haptics must never break a CRUD operation.
- **D-14:** Web / desktop dev runs: haptic calls should degrade gracefully when not on mobile. Wrap calls behind an `isTauriRuntime()`-style guard (pattern already established in Phase 1's `verification-screen.tsx`) or rely on the plugin returning silently off-platform.

**Safe-Area Insets**
- **D-15:** Apply `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` padding to the top-level `<main>` in `TodoApp`. Phase 1 D-25 set `viewport-fit=cover` but that only unlocks the insets — this phase actually applies them.
- **D-16:** Implement via Tailwind v4 arbitrary values. Left/right insets not needed.

**Already Met (Verify Only)**
- **D-17:** UX-02 (no hover states): zero `hover:` classes in `apps/tauri-todo/src`. Re-verify after refactor.
- **D-18:** UX-03 (standalone Tailwind): zero `@monorepo-template/ui` imports. Re-verify after refactor.

**Device Verification**
- **D-19:** Phase ends with on-device verification on the same physical Android device used in Phase 1 and Phase 2 (follows D-29 Phase 1 workflow). Haptics cannot be verified on an emulator reliably.

### Claude's Discretion
- Exact Tailwind token for safe-area inset fallback padding (whether `max()` fallback is 2rem, `py-8`, or something else).
- Where exactly in the component tree the haptic `isTauriRuntime` guard lives (`use-todos.ts` vs `src/lib/haptics.ts` wrapper vs inline).
- Visual scaling of the inner `×` glyph and toggle checkmark after containers grow to 44px.
- Whether the haptics wrapper exports three named functions (`hapticAdd`, `hapticToggle`, `hapticDelete`) or a single function with a discriminated-union `kind` argument.

### Deferred Ideas (OUT OF SCOPE)
- Visual refresh (typography bump, larger rounded corners, press-scale animation, row shadow).
- Loading/empty/error state polish (spinner, friendlier empty-state composition).
- Dark mode / system theme (D-27 Phase 1 light-only still stands).
- Swipe-to-delete (ENH-01), inline editing (ENH-02), categories (ENH-03) — v2 scope.
- iOS support (IOS-01..04) — v2 scope. Capability file entries keep `"iOS"` in `platforms` so it stays iOS-ready, but no iOS install work happens now.
- Haptic on validation failure — UI already prevents submit via disabled button.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-01 | Mobile-native styling with 44px minimum touch targets | Standard Stack (Tailwind v4 arbitrary values) + Pattern 1 (44px class bumps) — no new deps, plain utility swaps |
| UX-02 | No hover states (mobile-only design) | Verification via grep (already met — see `## Validation Architecture` §Requirement Map) |
| UX-03 | Standalone Tailwind CSS styling | Verification via grep (already met — no `@monorepo-template/ui` imports) |
| UX-04 | Haptic feedback on add/delete actions via @tauri-apps/plugin-haptics | Standard Stack (haptics plugin v2.3.2 / crate v2.3.2), Pattern 2 (plugin install/register), Pattern 3 (haptics wrapper), Pitfall 1 (mobile-only cfg guard), Pitfall 2 (fire-and-forget), Pitfall 3 (capability permission required), Pitfall 4 (pnpm `tauri add` bug) |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| 44px touch-target sizing | Browser / Client (Tailwind utility classes) | — | Pure CSS class change on existing React components; no server, no IPC |
| Safe-area inset padding | Browser / Client (CSS `env()`) | — | `env(safe-area-inset-*)` is a WebView feature unlocked by the native `viewport-fit=cover` meta; zero Rust involvement |
| Haptic feedback trigger | Browser / Client (JS calls `invoke`) | API / Backend (Tauri Rust plugin) | Plugin exposes JS functions that marshal to native OS haptics via Rust IPC; client originates the call, Rust fulfils it |
| Plugin registration | API / Backend (Rust `lib.rs`) | — | Every Tauri plugin must register in the Rust `Builder` before JS-side calls work |
| Capability permission grant | API / Backend (capabilities JSON) | — | Tauri v2 denies all plugin commands by default; capability file is the authoritative grant list |
| Runtime environment detection | Browser / Client | — | `window.__TAURI_INTERNALS__` probe runs in the WebView to decide whether to attempt a plugin call |
| Test verification (static asserts) | Browser / Client (Vitest + jsdom) | — | Class-string and import-graph assertions run in the JS toolchain; no device needed |
| Test verification (haptic actually fires) | Device (physical Android hardware) | — | Per plugin docs, vibration hardware and driver quality are device-specific; emulators don't reproduce this faithfully |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@tauri-apps/plugin-haptics` | 2.3.2 | JS bindings for native haptic feedback on mobile | [CITED: `https://v2.tauri.app/plugin/haptics/`] — only first-party way to trigger native haptics from a Tauri v2 WebView |
| `tauri-plugin-haptics` | 2.3.2 | Rust crate that exposes the mobile haptic OS APIs to Tauri | [CITED: `https://crates.io/api/v1/crates/tauri-plugin-haptics`] — matches JS package version; mobile-only via `cfg(any(target_os = "android", target_os = "ios"))` target restriction |
| `@tauri-apps/api` | 2.10.1 (already installed) | Tauri v2 core (for `invoke`, window detection) | Already in `package.json`; haptics package declares `@tauri-apps/api: ^2.8.0` peer — satisfied |
| `tailwindcss` | 4.2.2 (already installed) | Utility-first styling; `pt-[env(...)]` arbitrary values | Already the project's styling layer; v4 supports env-value arbitrary syntax natively with no plugin [VERIFIED: `pnpm view tailwindcss version` → 4.2.2] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@tauri-apps/plugin-store` | 2.4.2 (already installed) | Persistence (from Phase 2) | Haptic fires after `store.save()` resolves — no new usage, just ordering |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@tauri-apps/plugin-haptics` | Web Vibration API (`navigator.vibrate`) | Would skip the Rust plugin install entirely, but Android WebView vibration support is patchy and the Tauri plugin wraps `impactFeedback`/`notificationFeedback`/`selectionFeedback` semantics that the raw Web API can't express. Locked decisions explicitly name the Tauri plugin. Not recommended. |
| Three named wrappers (`hapticAdd`, `hapticToggle`, `hapticDelete`) | Single `haptic(kind: "add"\|"toggle"\|"delete")` discriminated-union function | Discussed in D-14/Claude's Discretion. Three names match the `addTodo`/`toggleTodo`/`deleteTodo` trio in `use-todos.ts`, read as clearly at call sites, and each wrapper internalizes its own intensity choice. Single-function variant saves ~10 LOC but adds a switch at every call site. Recommend three named wrappers. [ASSUMED aesthetic preference based on Phase 2 patterns] |
| Tailwind plugin `tailwindcss-safe-area` (`pt-safe`) | — | Adds a dev dependency for one page's worth of utilities. Tailwind v4 arbitrary values (`pt-[env(safe-area-inset-top)]`) work out of the box. Not worth the plugin. [CITED: `https://tailwindcss.com/docs/padding`] |
| Separate `@theme` tokens for safe-area spacing | Inline arbitrary values | `@theme { --spacing-safe-top: env(safe-area-inset-top) }` centralizes the token. Worth it only if ≥3 components need the value. Only one component (`<main>`) needs it here. Not recommended. |

**Installation:**
```bash
# From apps/tauri-todo
pnpm add @tauri-apps/plugin-haptics
# Then manually edit Cargo.toml (see Pattern 2 below)
```

**Version verification:** [VERIFIED 2026-04-17 via `pnpm view @tauri-apps/plugin-haptics version` → `2.3.2` (published 2026-02-02)] and [VERIFIED via `crates.io/api/v1/crates/tauri-plugin-haptics` → `max_version: 2.3.2`, `updated_at: 2025-10-27`]. JS and crate versions are aligned at 2.3.2 — pin both exactly.

## Architecture Patterns

### System Architecture Diagram

```
 ┌─────────────────────────────────────────────────────────────────────┐
 │                        Android Device WebView                       │
 │                                                                     │
 │   index.html  <meta viewport-fit=cover>  (unlocks env insets)       │
 │        │                                                            │
 │        ▼                                                            │
 │   TodoApp  <main class="... pt-[env(safe-area-inset-top)] ...">     │
 │     │                                                               │
 │     ├── TodoInput  (input h-11, button h-11)                        │
 │     │        │                                                      │
 │     │        │ onAdd(text) ────────────────────┐                    │
 │     │                                          ▼                    │
 │     └── TodoList → TodoItem (toggle w-11 h-11, delete w-11 h-11)    │
 │                      │                                              │
 │                      │ onToggle(id), onDelete(id)                   │
 │                      ▼                                              │
 │   useTodos hook (CRUD)                                              │
 │     ├── addTodo    → store.save() ──resolves──▶ hapticAdd()         │
 │     ├── toggleTodo → store.save() ──resolves──▶ hapticToggle()      │
 │     └── deleteTodo → store.save() ──resolves──▶ hapticDelete()      │
 │                                                      │              │
 │   src/lib/haptics.ts                                 │              │
 │     ├── hapticAdd    → impactFeedback('medium')      │              │
 │     ├── hapticToggle → selectionFeedback()           │              │
 │     └── hapticDelete → notificationFeedback('warning')              │
 │                           │                                         │
 │   isTauriRuntime() guard ─┘   (no-ops off-device)                   │
 │   try/catch swallows errors   (never breaks CRUD)                   │
 │                           │                                         │
 └───────────────────────────┼─────────────────────────────────────────┘
                             │ invoke (Tauri IPC, JSON over channel)
                             ▼
 ┌─────────────────────────────────────────────────────────────────────┐
 │                     Rust / Tauri Host (native)                      │
 │                                                                     │
 │   lib.rs  Builder::default()                                        │
 │     .plugin(tauri_plugin_store::Builder::new().build())   (Ph 2)    │
 │     .setup(|app| {                                                  │
 │         #[cfg(mobile)]                                              │
 │         app.handle().plugin(tauri_plugin_haptics::init());          │
 │         Ok(())                                                      │
 │     })                                                              │
 │         │                                                           │
 │         ▼                                                           │
 │   tauri-plugin-haptics crate                                        │
 │         │                                                           │
 │         ▼                                                           │
 │   capabilities/mobile.json  must grant                              │
 │     haptics:allow-impact-feedback                                   │
 │     haptics:allow-notification-feedback                             │
 │     haptics:allow-selection-feedback                                │
 │         │                                                           │
 │         ▼                                                           │
 │   Android OS VibrationEffect API                                    │
 └─────────────────────────────────────────────────────────────────────┘
```

Read flow: a user tap on Add / toggle / delete calls into `useTodos`, which persists via the store plugin, then fires the matching haptic wrapper. The wrapper short-circuits off-device via `isTauriRuntime()`, otherwise calls the plugin's JS binding, which IPCs to the Rust crate registered under the `#[cfg(mobile)]` block. The capability permissions gate the IPC — missing any of the three grants causes a silent plugin failure that our `try/catch` would swallow.

### Recommended Project Structure
```
apps/tauri-todo/
├── src/
│   ├── lib/
│   │   ├── runtime.ts          # NEW — exports isTauriRuntime()
│   │   └── haptics.ts          # NEW — hapticAdd / hapticToggle / hapticDelete
│   ├── hooks/
│   │   └── use-todos.ts        # MOD — wire haptic calls after save()
│   └── components/
│       ├── todo-app.tsx        # MOD — safe-area padding on <main>
│       ├── todo-input.tsx      # MOD — h-10 → h-11 (input + button)
│       └── todo-item.tsx       # MOD — w-6/w-8 → w-11 h-11
└── src-tauri/
    ├── Cargo.toml              # MOD — add tauri-plugin-haptics with target cfg
    ├── capabilities/mobile.json # MOD — add 3 permission strings
    └── src/lib.rs              # MOD — .setup() with #[cfg(mobile)] haptics init
```

### Pattern 1: 44px Touch Target Class Swap
**What:** Replace undersized Tailwind size utilities with `h-11` / `w-11 h-11` (44px in Tailwind's default spacing scale where `1 = 4px`).
**When to use:** Every interactive control visible on a mobile surface.
**Example:**
```tsx
// todo-input.tsx — BEFORE
<input className="flex-1 h-10 px-3 ..." />
<button className="shrink-0 h-10 px-4 ...">Add</button>

// todo-input.tsx — AFTER
<input className="flex-1 h-11 px-3 ..." />
<button className="shrink-0 h-11 px-4 ...">Add</button>

// todo-item.tsx — BEFORE
const toggleClass = todo.completed
  ? "w-6 h-6 shrink-0 rounded-full ..."
  : "w-6 h-6 shrink-0 rounded-full ..."
<button className="w-8 h-8 shrink-0 ..." aria-label="Delete todo">×</button>

// todo-item.tsx — AFTER
const toggleClass = todo.completed
  ? "w-11 h-11 shrink-0 rounded-full ..."
  : "w-11 h-11 shrink-0 rounded-full ..."
<button className="w-11 h-11 shrink-0 ..." aria-label="Delete todo">×</button>
```
Source: Locked decisions D-02..D-05 in CONTEXT.md. Tailwind spacing scale [CITED: `https://tailwindcss.com/docs/padding`] — `11` resolves to `2.75rem` = `44px` at default root font size (16px).

### Pattern 2: Tauri v2 Mobile-Only Plugin Install (Haptics variant of Phase 1 D-46)
**What:** Install the plugin manually on both sides (JS + Rust + capability), register inside `.setup()` guarded by `#[cfg(mobile)]` because the crate is mobile-only.
**When to use:** Whenever adding an official Tauri plugin to this pnpm-workspace project AND the plugin is mobile-only. (For desktop-available plugins like store, the simpler `Builder::default().plugin(...)` chain at the root still works.)

**Example (verified against official docs):**

```toml
# apps/tauri-todo/src-tauri/Cargo.toml
[dependencies]
tauri = { version = "2", features = ["config-json5"] }
tauri-plugin-store = "2"
serde = { version = "1", features = ["derive"] }
serde_json = "1"

# NEW — target-gated so desktop host builds don't try to compile mobile-only crate
[target.'cfg(any(target_os = "android", target_os = "ios"))'.dependencies]
tauri-plugin-haptics = "2.3.2"
```

```rust
// apps/tauri-todo/src-tauri/src/lib.rs
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())   // Phase 2 — stays at root
        .setup(|app| {
            #[cfg(mobile)]
            app.handle().plugin(tauri_plugin_haptics::init())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

```json
// apps/tauri-todo/src-tauri/capabilities/mobile.json
{
  "$schema": "../gen/schemas/mobile-schema.json",
  "identifier": "mobile-capability",
  "windows": ["main"],
  "platforms": ["iOS", "android"],
  "permissions": [
    "core:default",
    "store:default",
    "haptics:allow-impact-feedback",
    "haptics:allow-notification-feedback",
    "haptics:allow-selection-feedback"
  ]
}
```

Source: [CITED: `https://v2.tauri.app/plugin/haptics/`] for the `.setup() { #[cfg(mobile)] ... }` registration shape. [CITED: `https://github.com/tauri-apps/tauri/issues/12706`] for the pnpm-workspace `tauri add` bug that forces manual install. Phase 1 D-46 established this manual-install pattern for the store plugin; haptics follows the same playbook with one difference — the `#[cfg(mobile)]` guard and the `[target.'cfg(...)']` Cargo section, because unlike store, haptics does not compile on desktop.

### Pattern 3: Haptics Wrapper Module
**What:** Single-responsibility wrapper that (a) detects Tauri runtime, (b) calls the plugin, (c) swallows errors. Three named exports mirror the three CRUD operations.
**When to use:** All haptic call sites — never call the plugin directly from a component or hook.

```tsx
// apps/tauri-todo/src/lib/runtime.ts — NEW
export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}
```

```tsx
// apps/tauri-todo/src/lib/haptics.ts — NEW
import { impactFeedback, notificationFeedback, selectionFeedback } from "@tauri-apps/plugin-haptics"

import { isTauriRuntime } from "@/lib/runtime"

export async function hapticAdd(): Promise<void> {
  if (!isTauriRuntime()) return
  try {
    await impactFeedback("medium")
  } catch {
    // Android vibration support is device-dependent (plugin docs).
    // Never break a CRUD op over a haptic failure.
  }
}

export async function hapticToggle(): Promise<void> {
  if (!isTauriRuntime()) return
  try {
    await selectionFeedback()
  } catch {
    /* swallow */
  }
}

export async function hapticDelete(): Promise<void> {
  if (!isTauriRuntime()) return
  try {
    await notificationFeedback("warning")
  } catch {
    /* swallow */
  }
}
```

```tsx
// apps/tauri-todo/src/hooks/use-todos.ts — MODIFIED (CRUD functions only)
import { hapticAdd, hapticDelete, hapticToggle } from "@/lib/haptics"

// ... existing code ...

async function addTodo(text: string) {
  if (!storeRef.current) return
  const trimmed = text.trim()
  if (trimmed.length === 0) return
  const next: Todo[] = [...todosRef.current, { id: crypto.randomUUID(), text: trimmed, completed: false }]
  await save(next)
  void hapticAdd()   // fire-and-forget; save() has already succeeded
}

async function toggleTodo(id: string) {
  if (!storeRef.current) return
  const next = todosRef.current.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
  await save(next)
  void hapticToggle()
}

async function deleteTodo(id: string) {
  if (!storeRef.current) return
  const next = todosRef.current.filter((t) => t.id !== id)
  await save(next)
  void hapticDelete()
}
```

Sources: [CITED: `https://v2.tauri.app/plugin/haptics/`] for the JS API; [CITED: `https://raw.githubusercontent.com/tauri-apps/plugins-workspace/v2/plugins/haptics/guest-js/bindings.ts`] for exact type signatures — `ImpactFeedbackStyle = 'light' | 'medium' | 'heavy' | 'soft' | 'rigid'`, `NotificationFeedbackType = 'success' | 'warning' | 'error'`. Phase 1 commit `9c899d9` for the verbatim `isTauriRuntime` detection shape. Decision D-10 places the haptic call after `save()` resolves, matching the "successful add" semantic.

> **Alternative considered:** placing `hapticAdd` etc. inline in `use-todos.ts` (no `src/lib/haptics.ts` file). Rejected because it scatters the `isTauriRuntime` + try/catch boilerplate across three functions and forces every call site to remember the intensity mapping. The wrapper is 30 LOC and centralizes the semantic.

### Pattern 4: Safe-Area Inset Padding on `<main>`
**What:** Tailwind v4 arbitrary-value utilities apply CSS `env()` tokens to padding.
**When to use:** Root viewport container in a Tauri mobile app with `viewport-fit=cover` already set.

```tsx
// apps/tauri-todo/src/components/todo-app.tsx — MODIFIED (class only)
<main className="min-h-screen bg-white px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
```

The `max(2rem, env(...))` fallback is recommended: modern Android Chrome WebViews return `0px` for the inset when no notch exists, which would collapse `py-8` (the current value). The `max()` guarantees at least `2rem` vertical padding on devices without insets, and more on devices with them.

Source: [CITED: `https://tailwindcss.com/docs/padding`] for Tailwind v4 arbitrary-value syntax; `env(safe-area-inset-*)` is a WebKit/Blink CSS feature unlocked by the `<meta name="viewport" content="viewport-fit=cover">` already present in `apps/tauri-todo/index.html` (Phase 1 D-25).

### Anti-Patterns to Avoid
- **Don't register haptics at Builder root.** `.plugin(tauri_plugin_haptics::init())` at the `Builder::default().plugin(...)` level fails to compile on desktop targets — the crate doesn't exist for those targets. Must live inside `.setup(|app| { #[cfg(mobile)] app.handle().plugin(...); Ok(()) })`.
- **Don't use `@tauri-apps/api/tauri` for anything.** That's the v1 import path. v2 uses `@tauri-apps/api/core`. Not relevant for haptics directly, but watch for it if any refactor touches `invoke` imports.
- **Don't fire haptics before `store.save()` resolves.** Would fire on the intent, not the outcome — violates D-10's "on successful add" semantic and could vibrate on a failed write.
- **Don't `await` haptic calls in a way that blocks the UI.** Use `void haptic...()` to signal fire-and-forget. Awaiting them in the CRUD path would serialize a 50-150ms haptic latency into the store-save flow on slow devices.
- **Don't reach for a `tailwindcss-safe-area` plugin.** Tailwind v4 arbitrary-value utilities handle this natively.
- **Don't grow the row padding on `TodoItem`.** D-06 explicitly keeps `px-3 py-3`. Growing the toggle/delete to 44px already makes rows taller; adding row padding compounds vertical bloat.
- **Don't skip the capability permission strings.** Tauri v2's permission model denies plugin IPC by default. Without the three `haptics:allow-*` grants, every haptic call will fail silently and our `try/catch` will hide it — nothing will vibrate in QA.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Haptic feedback | Custom `navigator.vibrate(pattern)` call | `@tauri-apps/plugin-haptics` — `impactFeedback`/`notificationFeedback`/`selectionFeedback` | Android WebView's Vibration API support is inconsistent; Tauri's plugin maps to OS-native `VibrationEffect` with per-intensity semantics the web API can't express |
| Mobile runtime detection | Parsing `navigator.userAgent` | `typeof window !== "undefined" && "__TAURI_INTERNALS__" in window` | UA strings lie and drift; Tauri's global is the authoritative signal it's running inside the webview |
| Safe-area inset utilities | Hand-rolled media queries matching notch device aspect ratios | CSS `env(safe-area-inset-*)` + Tailwind arbitrary values | The browser knows the insets; don't reverse-engineer them from device dimensions |
| Touch-target sizing logic | JS that measures viewport and adjusts hit boxes | 44px fixed containers via Tailwind | Apple HIG and Material both converge on 44/48dp as the minimum; static sizing ships at build time, works offline, and is grep-verifiable |

**Key insight:** Every one of these problems has a correct built-in or first-party-plugin answer in this stack. Hand-rolling any of them would add maintenance burden and likely get the edge cases wrong (notch detection, vibration patterns across OEMs).

## Common Pitfalls

### Pitfall 1: Registering Haptics at Builder Root Like the Store Plugin
**What goes wrong:** Developer sees Phase 1's `Builder::default().plugin(tauri_plugin_store::Builder::new().build())` pattern and copies it: `.plugin(tauri_plugin_haptics::init())`. Desktop builds fail with "cannot find crate `tauri_plugin_haptics`" because the crate is gated to Android/iOS targets only.
**Why it happens:** Store plugin is a cross-platform crate; haptics is not. Visual pattern-match between the two looks identical but the crate's target constraint is different.
**How to avoid:** Register inside `.setup(|app| { #[cfg(mobile)] app.handle().plugin(tauri_plugin_haptics::init())?; Ok(()) })`. Also add `[target.'cfg(any(target_os = "android", target_os = "ios"))'.dependencies]` section to `Cargo.toml`.
**Warning signs:** `cargo check` on host machine (non-mobile target) fails with unresolved crate. `android:build` succeeds but `cargo build` in `src-tauri/` fails.

### Pitfall 2: Fire-and-Forget Haptic Becomes Fire-Then-Crash
**What goes wrong:** `await impactFeedback('medium')` in a CRUD handler rejects (device doesn't support haptics, capability not granted, plugin not loaded), propagates as an unhandled promise rejection, crashes the save flow, user loses their todo.
**Why it happens:** Plugin docs explicitly warn: *"There are no standards/requirements for vibration support on Android, so the feedback APIs may not work correctly on more affordable phones."* Failure is expected, not exceptional.
**How to avoid:** Wrap every plugin call in `try { await … } catch { /* swallow */ }` inside the wrapper, then call the wrapper as `void hapticAdd()` at the use site. D-13 mandates this.
**Warning signs:** Saving a todo on a weird device sometimes fails; React error boundary fires after haptic calls; unhandled promise rejection warnings in logcat.

### Pitfall 3: Capability Permission Typo or Omission
**What goes wrong:** Plugin installed and registered correctly, but capability file missing one of the three permission strings (or misspelled, e.g. `haptics:impact-feedback` without `allow-`). Haptic never fires; no visible error because our wrapper swallows.
**Why it happens:** Tauri v2's default-deny security model. Permission strings are exact — the `allow-` prefix is mandatory for these three.
**How to avoid:** Hard-code the three strings (D-09) and grep `capabilities/mobile.json` for each one as a verification step. The plugin README enumerates: `haptics:allow-impact-feedback`, `haptics:allow-notification-feedback`, `haptics:allow-selection-feedback`. (A fourth, `haptics:allow-vibrate`, is not needed — we don't call `vibrate()`.)
**Warning signs:** App runs, no haptic fires, `adb logcat | grep -i tauri` shows permission denied errors.

### Pitfall 4: `tauri add haptics` in pnpm Workspace
**What goes wrong:** Developer runs `pnpm tauri add haptics`, command hangs or writes a malformed `Cargo.toml` entry, and JS side doesn't get the package.
**Why it happens:** Known Tauri CLI bug in pnpm workspaces — `https://github.com/tauri-apps/tauri/issues/12706`. Documented as Phase 1 D-46 and still unfixed.
**How to avoid:** Split the install: `pnpm add @tauri-apps/plugin-haptics` (JS side) + manual `Cargo.toml` edit + manual `lib.rs` edit + manual `capabilities/mobile.json` edit. Same playbook used for store plugin in Phase 1.
**Warning signs:** `tauri add` completes but `cargo build` fails; or `Cargo.toml` has an entry but `lib.rs` wasn't updated; or JS import resolves but Rust plugin isn't registered.

### Pitfall 5: Safe-Area Padding Collapses to Zero on Devices Without Notches
**What goes wrong:** `pt-[env(safe-area-inset-top)]` resolves to `0px` on older Android devices with no notch. Title sits tight against the status bar because the previous `py-8` (2rem = 32px) padding was removed.
**Why it happens:** `env(safe-area-inset-*)` returns `0` when there's no safe area to avoid.
**How to avoid:** Wrap in `max()`: `pt-[max(2rem,env(safe-area-inset-top))]`. Guarantees the pre-existing 2rem floor, adds more when insets demand it.
**Warning signs:** App looks tight on older devices (no notch) but correct on newer ones (notch).

### Pitfall 6: Haptic Fires Before Save Completes
**What goes wrong:** If the haptic is called inside `addTodo` before `await save(next)`, the user feels a confirmation pulse for an add that might still fail in the store layer. Off-spec per D-10 ("on successful add, not on button press").
**Why it happens:** Natural to place it near the click handler rather than after the async chain.
**How to avoid:** Call the wrapper strictly *after* `await save(next)` returns. Test: mock `store.save()` to throw — haptic should not fire.
**Warning signs:** Test assertion that haptic doesn't fire on save failure passes only with the correct ordering.

## Runtime State Inventory

> Phase 3 is a feature-add phase (install a new plugin, add classes, add safe-area padding) — not a rename/refactor/migration. No runtime state inventory required.
> **Nothing found in any category:** verified by inspection — no renames, no string replacements, no storage key changes, no existing service re-registrations.

## Code Examples

Verified patterns from official sources:

### Haptic Feedback Call (exact JS API)
```ts
// Source: https://v2.tauri.app/plugin/haptics/ and
// https://raw.githubusercontent.com/tauri-apps/plugins-workspace/v2/plugins/haptics/guest-js/bindings.ts
import {
  impactFeedback,
  notificationFeedback,
  selectionFeedback,
  vibrate,
} from "@tauri-apps/plugin-haptics"

// Types (auto-generated by tauri-specta):
// type ImpactFeedbackStyle = "light" | "medium" | "heavy" | "soft" | "rigid"
// type NotificationFeedbackType = "success" | "warning" | "error"

await impactFeedback("medium")          // add-todo
await selectionFeedback()               // toggle
await notificationFeedback("warning")   // delete
// vibrate(duration: number) also available but not used in this phase
```

### Plugin Registration in lib.rs (exact Rust shape)
```rust
// Source: https://v2.tauri.app/plugin/haptics/
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .setup(|app| {
            #[cfg(mobile)]
            app.handle().plugin(tauri_plugin_haptics::init())?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Cargo.toml Mobile-Only Dependency (exact target syntax)
```toml
# Source: https://v2.tauri.app/plugin/haptics/ install instructions
# (derived from the recommended `cargo add tauri-plugin-haptics --target 'cfg(...)'` invocation)
[target.'cfg(any(target_os = "android", target_os = "ios"))'.dependencies]
tauri-plugin-haptics = "2.3.2"
```

### Tauri Runtime Guard (promoted from Phase 1)
```ts
// Source: apps/tauri-todo/src/components/verification-screen.tsx @ commit 9c899d9
//         (file deleted in commit 5b84df8; guard must be re-introduced in src/lib/runtime.ts)
export function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window
}
```

### Tailwind v4 Safe-Area Padding (arbitrary value form)
```tsx
// Source: https://tailwindcss.com/docs/padding
<main className="min-h-screen bg-white px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `navigator.vibrate()` Web API | Tauri `@tauri-apps/plugin-haptics` with semantic calls (`impactFeedback`/`notificationFeedback`/`selectionFeedback`) | Tauri v2 stable (Oct 2024) | Matches iOS `UIImpactFeedbackGenerator` and Android `VibrationEffect.createPredefined()` semantics — richer than raw ms-duration pulses |
| Tailwind v3 `tailwind.config.js` with `theme.extend.padding.safe = 'env(...)'` | Tailwind v4 arbitrary values `pt-[env(safe-area-inset-top)]` OR `@theme` CSS-first tokens | Tailwind v4 (Jan 2025) | No JS config file needed; `@theme` CSS block or inline arbitrary values both work |
| `@tauri-apps/api/tauri` import path | `@tauri-apps/api/core` | Tauri v2 stable | v1-era path is removed in v2 |
| `window.__TAURI_METADATA__` / `window.isTauri` | `window.__TAURI_INTERNALS__` | Tauri v2 stable | Internal detection surface changed across v1→v2 |
| `Builder::default().plugin(...)` flat chain for all plugins | `.setup(|app| { #[cfg(mobile)] app.handle().plugin(...) })` for mobile-only plugins | Tauri v2 + mobile-only plugin crates | Prevents desktop-host builds from failing on mobile-only crate resolution |

**Deprecated/outdated:**
- `window.__TAURI__` global — replaced by `__TAURI_INTERNALS__` in v2.
- `@tauri-apps/api/tauri` package subpath — moved to `@tauri-apps/api/core`.
- Tailwind v3 JS config for safe-area padding — v4 CSS-first approach is idiomatic.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Three named wrappers (`hapticAdd`/`hapticToggle`/`hapticDelete`) read more clearly than a single discriminated-union `haptic({ kind: ... })` function. | Standard Stack → Alternatives Considered; Pattern 3 | Low — user may prefer the single-function form. Either is acceptable per D-14 (Claude's discretion). Mitigation: if user wants the union form, swap the three exports for one function with a `switch` inside; the call-site change is mechanical. |
| A2 | The `max(2rem, env(safe-area-inset-top))` fallback is the right floor value. The current `py-8` on `<main>` = 2rem, so preserving 2rem matches pre-phase spacing. | Pattern 4 | Very low — if visually wrong on-device, adjust the floor value only (e.g., `max(1.5rem, env(...))`). No structural change needed. |
| A3 | The haptics crate v2.3.2 remains at 2.3.2 at install time (latest published 2025-10-27). | Standard Stack | Low — if a newer version exists at install time, pin the newer version. Plan should use `pnpm view @tauri-apps/plugin-haptics version` and `cargo search tauri-plugin-haptics` as a pre-install check. |

## Open Questions (RESOLVED)

1. **Does the running `cargo build` on the dev macOS host actually attempt to compile `tauri-plugin-haptics`, or does the `[target.'cfg(...)']` section correctly skip it?** — RESOLVED: plan a post-edit smoke step running `cd apps/tauri-todo/src-tauri && cargo check --target aarch64-linux-android`; no host `cargo check` needed (Phase 1 D-07 keeps Rust out of Turbo).
   - What we know: The `cargo add ... --target 'cfg(any(target_os = "android", target_os = "ios"))'` syntax from the plugin docs implies Cargo respects the target guard and skips the crate on non-matching platforms.
   - What's unclear: Whether `pnpm typecheck` or the Turbo pipeline invokes `cargo check` — Phase 1 D-07 says "Rust code is independent of JS tooling — no `cargo check` in Turbo", which means the macOS host never builds the Rust side at all outside `android:dev` / `android:build`. Low practical risk.
   - Recommendation: Plan a smoke step — after `Cargo.toml` edit, run `cd apps/tauri-todo/src-tauri && cargo check --target aarch64-linux-android` to confirm it compiles mobile-targeted. No host `cargo check` needed.

2. **Does `pnpm add @tauri-apps/plugin-haptics` automatically pick `2.3.2`, or pin at a different latest?** — RESOLVED: exact-pin to `2.3.2` (no caret) to match the crate version; if pnpm lands a different version, edit package.json and re-install.
   - What we know: npm registry reports `2.3.2` as `latest` (dist-tag) as of 2026-04-17.
   - What's unclear: Whether pnpm's internal resolution could select a different version if some workspace constraint forces it. No known constraint at this level.
   - Recommendation: After install, confirm `apps/tauri-todo/package.json` shows `"@tauri-apps/plugin-haptics": "2.3.2"` (no caret) — exact-pin to match the crate version. If pnpm lands a different version, pin by editing the package.json `dependencies` entry and re-running install.

3. **Should the `isTauriRuntime` guard be exported from `src/lib/runtime.ts` or colocated inside `src/lib/haptics.ts`?** — RESOLVED: export it from `src/lib/runtime.ts` — future-proof, three-line module, endorsed by CONTEXT D-14 discretion.
   - What we know: Phase 1 had it inline in `verification-screen.tsx`. Phase 2 deleted that file with the guard. Only one file (`haptics.ts`) needs the guard today.
   - What's unclear: Will future phases need the guard again (e.g., if we add other plugins)?
   - Recommendation: Put it in `src/lib/runtime.ts` anyway — one extra file, future-proof, and the whole module is three lines. The current CONTEXT (D-14 + discretion) endorses either.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| pnpm | Install JS package | ✓ | 10.29.3 (enforced by project) | — |
| Cargo / Rust toolchain | Add crate, compile Rust side | ✓ (Phase 1) | ≥ 1.77.2 required by plugin [CITED] | — |
| Android SDK/NDK | Build Android APK | ✓ (Phase 1 ENV-01) | — | — |
| aarch64-linux-android + other mobile targets | Cross-compile plugin | ✓ (Phase 1 ENV-02) | — | — |
| Physical Android device | Verify haptic actually fires | ✓ (Phase 1/2 D-29 workflow) | — | None — emulators don't faithfully reproduce vibration (haptic driver quality is device-specific); on-device verification is mandatory per D-19 |
| `@tauri-apps/api` ≥ 2.8.0 | Haptics peer dependency | ✓ | 2.10.1 installed | — |

**Missing dependencies with no fallback:** none.

**Missing dependencies with fallback:** none — phase assumes Phase 1 environment is fully in place, confirmed by STATE.md `progress.completed_phases: 2`.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.4 + @testing-library/react 16.3.2 + jsdom 29.0.2 (existing) |
| Config file | `apps/tauri-todo/vitest.config.ts` (verified present) |
| Setup file | `apps/tauri-todo/src/test/setup.ts` (imports `@testing-library/jest-dom`) |
| Quick run command | `pnpm --filter @monorepo-template/tauri-todo test` |
| Full suite command | `pnpm --filter @monorepo-template/tauri-todo test && pnpm --filter @monorepo-template/tauri-todo typecheck && pnpm --filter @monorepo-template/tauri-todo lint` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-01 | `TodoInput` input renders with `h-11` (44px) | unit (DOM className assertion) | `pnpm --filter @monorepo-template/tauri-todo test -- src/components/todo-input.test.tsx` | ✅ extend |
| UX-01 | `TodoInput` Add button renders with `h-11` | unit (DOM className assertion) | same as above | ✅ extend |
| UX-01 | `TodoItem` toggle renders with `w-11 h-11` | unit (DOM className assertion) | `pnpm --filter @monorepo-template/tauri-todo test -- src/components/todo-item.test.tsx` | ✅ extend |
| UX-01 | `TodoItem` delete renders with `w-11 h-11` | unit (DOM className assertion) | same as above | ✅ extend |
| UX-01 | 44px visible (computed) — final pixel size | manual on device | physical Android device check (D-19) | N/A manual |
| UX-02 | Zero `hover:` utility classes in `apps/tauri-todo/src` | unit (filesystem grep inside a Vitest `it`) | `pnpm --filter @monorepo-template/tauri-todo test -- src/lint/no-hover.test.ts` | ❌ Wave 0 |
| UX-03 | Zero `@monorepo-template/ui` imports in `apps/tauri-todo/src` | unit (filesystem grep inside a Vitest `it`) | `pnpm --filter @monorepo-template/tauri-todo test -- src/lint/no-ui-pkg.test.ts` | ❌ Wave 0 |
| UX-04 | `addTodo` calls `hapticAdd` after `save()` resolves | unit (mock `@/lib/haptics`, assert call order) | `pnpm --filter @monorepo-template/tauri-todo test -- src/hooks/use-todos.test.ts` | ✅ extend |
| UX-04 | `toggleTodo` calls `hapticToggle` after `save()` resolves | unit (mock `@/lib/haptics`, assert call order) | same as above | ✅ extend |
| UX-04 | `deleteTodo` calls `hapticDelete` after `save()` resolves | unit (mock `@/lib/haptics`, assert call order) | same as above | ✅ extend |
| UX-04 | Haptic NOT called when `save()` throws | unit (mock `save` rejection, assert no call) | same as above | ✅ extend |
| UX-04 | `hapticAdd`/etc no-op off-Tauri (no import-time errors) | unit (simulate `window` without `__TAURI_INTERNALS__`, assert wrapper returns without throwing) | `pnpm --filter @monorepo-template/tauri-todo test -- src/lib/haptics.test.ts` | ❌ Wave 0 |
| UX-04 | `hapticAdd` calls `impactFeedback('medium')` when in Tauri runtime | unit (mock plugin, stub window global, assert call args) | same as above | ❌ Wave 0 |
| UX-04 | `hapticToggle` calls `selectionFeedback()` when in Tauri runtime | unit | same as above | ❌ Wave 0 |
| UX-04 | `hapticDelete` calls `notificationFeedback('warning')` when in Tauri runtime | unit | same as above | ❌ Wave 0 |
| UX-04 | Haptic errors are swallowed (CRUD still succeeds) | unit (mock plugin rejection, assert wrapper resolves) | same as above | ❌ Wave 0 |
| UX-04 | Capability file contains all 3 haptic permission strings | unit (read + parse `capabilities/mobile.json`, assert each string present) | `pnpm --filter @monorepo-template/tauri-todo test -- src/lint/capabilities.test.ts` | ❌ Wave 0 |
| UX-04 | Rust `lib.rs` registers haptics inside `.setup()` with `#[cfg(mobile)]` | unit (read + regex the file) | same as above | ❌ Wave 0 |
| UX-04 | `Cargo.toml` has `tauri-plugin-haptics` under mobile target cfg | unit (read + regex the file) | same as above | ❌ Wave 0 |
| UX-04 | Haptic actually vibrates on device | manual on device | physical Android device check (D-19) | N/A manual |
| SAFE-1 (internal) | `TodoApp` `<main>` has `pt-[max(2rem,env(safe-area-inset-top))]` and matching `pb-` | unit (DOM className regex assertion) | `pnpm --filter @monorepo-template/tauri-todo test -- src/components/todo-app.test.tsx` | ❌ Wave 0 (file does not yet exist) |
| SAFE-1 | Content actually clears status bar | manual on device | physical Android device check | N/A manual |

### Sampling Rate
- **Per task commit:** `pnpm --filter @monorepo-template/tauri-todo test` (runs all Vitest unit tests, < 10s)
- **Per wave merge:** `pnpm --filter @monorepo-template/tauri-todo test && pnpm --filter @monorepo-template/tauri-todo typecheck && pnpm --filter @monorepo-template/tauri-todo lint`
- **Phase gate:** full suite green + D-19 on-device verification on physical Android (haptics + safe-area visual sanity)

### Wave 0 Gaps
- [ ] `apps/tauri-todo/src/lib/haptics.test.ts` — covers UX-04 wrapper behavior (runtime guard, correct plugin call, error swallow, intensity args). Depends on creating `src/lib/haptics.ts` and `src/lib/runtime.ts`.
- [ ] `apps/tauri-todo/src/lint/no-hover.test.ts` — covers UX-02 (grep `hover:` in `src/**`). Pure FS assertion.
- [ ] `apps/tauri-todo/src/lint/no-ui-pkg.test.ts` — covers UX-03 (grep `@monorepo-template/ui` in `src/**` and `package.json`).
- [ ] `apps/tauri-todo/src/lint/capabilities.test.ts` — covers UX-04 install correctness (read `capabilities/mobile.json`, `lib.rs`, `Cargo.toml`, assert required strings).
- [ ] `apps/tauri-todo/src/components/todo-app.test.tsx` — covers safe-area padding classes on `<main>`. No current test for `TodoApp`.
- [ ] Extend `apps/tauri-todo/src/hooks/use-todos.test.ts` — add mocks for `@/lib/haptics`, assert call-order and no-call-on-failure semantics.
- [ ] Extend `apps/tauri-todo/src/components/todo-input.test.tsx` — assert `h-11` presence.
- [ ] Extend `apps/tauri-todo/src/components/todo-item.test.tsx` — assert `w-11 h-11` on toggle and delete.

No framework install needed — Vitest + Testing Library are already wired.

## Security Domain

> `security_enforcement` is not explicitly set in `.planning/config.json` — defaults treat security as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No users, no auth — local-only todo app per PROJECT.md |
| V3 Session Management | no | No sessions |
| V4 Access Control | yes (minimal) | Tauri v2 capability-based permission model in `capabilities/mobile.json` — only `haptics:allow-*` permissions granted in this phase, no wildcards |
| V5 Input Validation | yes (trivially) | No new user-facing inputs in this phase; existing `TodoInput` trim-guards against whitespace. Plugin inputs (`'medium'`, `'warning'`) are hard-coded string literals inside our wrapper — no user data flows into plugin calls |
| V6 Cryptography | no | No crypto in scope |
| V7 Error Handling | yes | Haptic errors must be swallowed silently (D-13) but not hide CRUD errors — `try/catch` scope stays local to the plugin call inside the wrapper |
| V14 Configuration | yes | Capability file grants are least-privilege — no `haptics:allow-vibrate` (not needed), no `haptics:default` (too broad). Target-cfg gating on `Cargo.toml` prevents desktop builds from linking the crate at all |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Overly broad Tauri capability grant | E (Elevation) | Grant only the three specific `haptics:allow-*` strings we use; do not use `haptics:default` — [VERIFIED: plugin README lists individual permissions] |
| Silent plugin failure masks install bug | T (Tampering / QA gap) | Capabilities test (`src/lint/capabilities.test.ts`) asserts all three permission strings literally exist in `capabilities/mobile.json`; this is a unit-test-enforced configuration check, not a runtime check |
| User data leaked via haptic IPC | I (Information Disclosure) | Haptic calls pass only literal strings (`'medium'`, `'warning'`) — no user todo text, IDs, or state ever crosses the haptics IPC boundary |
| Unhandled promise rejection crashes app | D (Denial of Service) | D-13 mandates try/catch in wrapper; test UX-04 "errors swallowed" asserts this |
| Mobile-only crate leaks into desktop attack surface | E (Elevation) | `[target.'cfg(any(target_os = "android", target_os = "ios"))']` Cargo section ensures desktop hosts never link the haptics crate |

## Project Constraints (from CLAUDE.md)

| Constraint | Applies To | Enforcement |
|------------|-----------|-------------|
| TypeScript strict + `noUncheckedIndexedAccess` | All new TS files (`src/lib/runtime.ts`, `src/lib/haptics.ts`) | `pnpm typecheck` |
| Prettier: `semi: false`, `printWidth: 120` | All edited/created files | `pnpm format` / ESLint Prettier plugin |
| ESLint: `@typescript-eslint/consistent-type-imports` | `import type { ... }` for type-only imports | `pnpm lint` |
| ESLint: `perfectionist/sort-imports` | Alphabetical import sorting | `pnpm lint` |
| Named exports only, no default exports | New modules (`src/lib/haptics.ts`, etc.) | Code review + ESLint |
| kebab-case filenames, PascalCase components, camelCase functions | New files (`haptics.ts`, `runtime.ts`) | Convention |
| Use `import type` (top-level), not inline `import { type X }` | Any type import in new code | `.agents/rules/typescript.md` §Imports & Exports |
| Prefer `interface extends` over `&` | Any new type composition | `.agents/rules/typescript.md` §Types |
| No `any` — use generics or `unknown` | Haptics wrapper signatures | Plugin API is already typed; no `any` should be needed |
| No enums — `as const` objects only | If mapping intensities to constants | Not needed here — plugin accepts string literals directly |
| Package manager: pnpm only (no `npm install`) | All dependency installs | Enforced by pre-tool-use hook (verified: `npm view` was blocked during research) |
| GSD workflow for repo edits | All Phase 3 work | `/gsd-execute-phase` |
| Conventional commits via husky + commitlint | Every commit | Git hook |

**Key directives the planner MUST honor:**
1. Every install must use `pnpm add`, never `npm install` — the pre-tool-use hook actively blocks `npm` invocations.
2. The `isTauriRuntime()` helper must use the exact `typeof window !== "undefined" && "__TAURI_INTERNALS__" in window` form to match the Phase 1 established pattern.
3. Haptics plugin registration MUST use `.setup() + #[cfg(mobile)]` — not the Builder-root form used for store.
4. Capability permissions are literal strings: `haptics:allow-impact-feedback`, `haptics:allow-notification-feedback`, `haptics:allow-selection-feedback`. No typos, no `haptics:default`.
5. Cargo dependency MUST live under `[target.'cfg(any(target_os = "android", target_os = "ios"))'.dependencies]`, not `[dependencies]`.

## Sources

### Primary (HIGH confidence)
- Official plugin docs: `https://v2.tauri.app/plugin/haptics/` — JS API, Rust registration shape, capability permissions, Android caveats
- GitHub source: `https://github.com/tauri-apps/plugins-workspace/blob/v2/plugins/haptics/README.md` — install instructions, version numbers
- GitHub bindings: `https://raw.githubusercontent.com/tauri-apps/plugins-workspace/v2/plugins/haptics/guest-js/bindings.ts` — exact type signatures for `ImpactFeedbackStyle` / `NotificationFeedbackType`
- npm registry: `pnpm view @tauri-apps/plugin-haptics` → version 2.3.2 published 2026-02-02
- crates.io API: `https://crates.io/api/v1/crates/tauri-plugin-haptics` → max_version 2.3.2 updated 2025-10-27
- Tailwind docs: `https://tailwindcss.com/docs/padding` — Tailwind v4 arbitrary value syntax
- Phase 1 commit `9c899d9` — verbatim `isTauriRuntime()` detection shape and usage
- Phase 1 `01-CONTEXT.md` — D-25 (`viewport-fit=cover`), D-46 (manual plugin install), D-47 (haptics deferred), D-29 (physical-device workflow)
- Phase 2 `02-CONTEXT.md` — `active:opacity-90` press pattern, component split, UI-package absence
- `apps/tauri-todo/*` source files (verified read) — current class strings, current `lib.rs`, current `capabilities/mobile.json`, current `Cargo.toml`, test infrastructure

### Secondary (MEDIUM confidence)
- Tauri issue `https://github.com/tauri-apps/tauri/issues/12706` — pnpm-workspace `tauri add` bug (established in Phase 1)
- WebSearch result confirming Tailwind v4 has no built-in `pt-safe` utility — cross-referenced with tailwindcss.com docs

### Tertiary (LOW confidence)
- None — every claim is backed by at least one primary source above.

## Metadata

**Confidence breakdown:**
- Standard stack (haptics plugin versions, APIs, install): HIGH — verified against official docs + npm registry + crates.io
- Architecture (mobile-only `.setup()` registration, target-cfg Cargo section): HIGH — verbatim from plugin docs
- Pitfalls (Builder-root registration fails on desktop, capability typos cause silent fail, pnpm workspace bug): HIGH — documented in official sources and prior phases
- Safe-area Tailwind approach: HIGH — Tailwind v4 docs confirm arbitrary value syntax
- Wrapper organization choice (three named vs union): MEDIUM — `[ASSUMED]` per A1, user discretion per D-14
- Validation test coverage: HIGH — existing Vitest infrastructure audited directly; gaps enumerated from file listing

**Research date:** 2026-04-17
**Valid until:** 2026-05-17 (Tauri v2 ecosystem is stable but plugin versions drift monthly — re-verify `pnpm view @tauri-apps/plugin-haptics` if install happens after this date)
