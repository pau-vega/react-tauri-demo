# Feature Landscape

**Domain:** Tauri v2 mobile todo app (Android + iOS)
**Researched:** 2026-04-15
**Confidence:** HIGH — official Tauri v2 docs, GitHub READMEs, Context7

---

## Tauri v2 Plugin Mobile Compatibility Reference

This is the definitive compatibility table for all official Tauri v2 plugins as of stable release:

| Plugin | Android | iOS | Notes |
|--------|---------|-----|-------|
| `plugin-store` | YES | YES | Key-value file persistence — confirmed via GitHub README |
| `plugin-notification` | YES | YES | Mobile Actions API only available on mobile |
| `plugin-haptics` | YES | YES | Android: may not work on budget phones |
| `plugin-barcode-scanner` | YES | YES | Camera-based QR/barcode scanning |
| `plugin-biometric` | YES | YES | Fingerprint/face auth |
| `plugin-geolocation` | YES | YES | GPS tracking |
| `plugin-nfc` | YES | YES | NFC tag reading |
| `plugin-deep-link` | YES | YES | App Links (Android) + Universal Links (iOS) |
| `plugin-clipboard` | NO | Partial | Desktop-primary; mobile limited |
| `plugin-dialog` | NO | NO | Desktop-only; no native file picker on mobile |
| `plugin-fs` | NO | NO | Desktop-only filesystem access |
| `plugin-global-shortcut` | NO | NO | Desktop-only |
| `plugin-autostart` | NO | NO | Desktop-only |
| `plugin-shell` | NO | NO | Desktop-only |
| `plugin-sql` | NO | NO | Desktop-only in stable; SQLite on mobile is unconfirmed |
| `plugin-updater` | NO | NO | Desktop-only |
| `plugin-window-state` | NO | NO | Desktop-only |
| `plugin-stronghold` | NO | NO | Desktop-only |

**Key finding:** `plugin-store` confirms Android + iOS support in its official README. This is the correct choice for local todo persistence per PROJECT.md.

**localStorage in webview:** Available on Android (System WebView/Chromium) and iOS (WKWebView/WebKit). Functional but has a 3-5MB limit and is not accessible from Rust. Suitable as a fallback but NOT recommended for primary persistence — use `plugin-store` instead for reliable cross-restart data.

---

## Table Stakes

Features users expect from a mobile todo app. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Tauri Mechanism | Notes |
|---------|--------------|------------|-----------------|-------|
| Add a todo item | Core action of any todo app | Low | React state + plugin-store set | Text input + button |
| Mark todo complete | Toggle completion state | Low | React state update + plugin-store set | Checkbox or tap gesture |
| Delete a todo | Remove unwanted items | Low | React state update + plugin-store delete | Swipe or button |
| Persist todos across restarts | Mobile apps must not lose data on close | Medium | `@tauri-apps/plugin-store` | Requires Rust integration + capability config |
| Empty state / onboarding | Blank screen on first launch is confusing | Low | React conditional render | "Add your first todo" callout |
| Visual completion state | Strikethrough or checkmark for done items | Low | CSS class toggle | Standard UX pattern |
| Mobile-native feel | Tap targets, scroll behavior, no hover states | Low | CSS — 44px+ touch targets, no hover | No special plugin needed |
| Responsive full-screen layout | Fill phone screen, no desktop layout | Low | CSS viewport units, flex/grid | Single-column layout |

---

## Differentiators

Features that set the app apart or demonstrate Tauri-specific capabilities. Not required for MVP but valuable for the exploratory goal.

| Feature | Value Proposition | Complexity | Tauri Mechanism | Mobile? | Notes |
|---------|-------------------|------------|-----------------|---------|-------|
| Haptic feedback on actions | Native feel on complete/delete | Low | `@tauri-apps/plugin-haptics` | YES (Android + iOS) | `impactFeedback()` or `notificationFeedback()` — 1-2 lines |
| Reminder notifications | Prompt users to check todos | Medium | `@tauri-apps/plugin-notification` | YES (Android + iOS) | Requires permission prompt + scheduling logic |
| Inline editing | Tap to edit existing todo text | Medium | React controlled input state | N/A (pure frontend) | No Tauri plugin needed |
| Reorder todos | Drag to reprioritize | High | React DnD library | N/A (pure frontend) | Complex mobile touch DnD |
| Swipe-to-delete | Native mobile gesture | Medium | CSS + touch events or React library | N/A (pure frontend) | Feels native without Tauri plugin |
| Deep link support | Open app to specific todo from URL | High | `@tauri-apps/plugin-deep-link` | YES (Android + iOS) | Requires App Links / Universal Links infra setup |
| Biometric lock | Face/fingerprint to open app | High | `@tauri-apps/plugin-biometric` | YES (Android + iOS) | Overkill for a todo experiment |
| Dark mode | System theme respect | Low | CSS `prefers-color-scheme` or Tauri window API | N/A (CSS) | CSS variables approach, no plugin needed |

---

## Anti-Features

Features to deliberately NOT build in this exploratory project.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Categories / labels | Scope creep — the experiment is Tauri mobile, not todo features | Single flat list, out of scope per PROJECT.md |
| Due dates and scheduling | Adds calendar/date picker complexity out of scope | Out of scope per PROJECT.md |
| User authentication | No backend — local app only | Local-only, no login, out of scope per PROJECT.md |
| Cloud sync | Requires backend and auth; antithetical to the experiment | `plugin-store` is local-only; that's the point |
| Priority levels | Unnecessary complexity for the experiment | Keep it simple |
| Desktop builds | The experiment is specifically mobile Tauri | `tauri.conf.json` should only configure Android + iOS targets |
| `@monorepo-template/ui` components | PROJECT.md explicitly forbids this | Standalone CSS with Tailwind CSS or plain CSS |
| In-app updates (`plugin-updater`) | Desktop-only plugin | Out of scope; not a production app |
| SQLite (`plugin-sql`) | Desktop-only in stable; `plugin-store` is sufficient for todos | `plugin-store` key-value is enough for a list of todos |
| Sorting/filtering | Adds state complexity beyond the Tauri exploration goal | Not in PROJECT.md requirements |
| Push notifications from server | No backend | Local scheduled notifications only (if any) |

---

## Feature Dependencies

```
plugin-store installation → Todos persist across restarts
  └── requires: Rust plugin registration in src-tauri/lib.rs
  └── requires: capabilities config with store:default permission
  └── requires: @tauri-apps/plugin-store npm package

Add todo → Mark complete (requires items to exist first)
Add todo → Delete todo (requires items to exist first)

plugin-notification (differentiator) → permission prompt UX
  └── requires: notification:default capability for mobile
  └── requires: user grants permission on first launch

plugin-haptics (differentiator) → no dependencies
  └── requires: haptics:allow-* capability for mobile
  └── Optional; degrades gracefully if not present
```

---

## MVP Recommendation

**Prioritize (Phase 1 — Core Loop):**
1. Add a todo item (text input + submit)
2. Mark todo as complete (checkbox toggle)
3. Delete a todo (delete button)
4. Persist todos across restarts via `plugin-store`
5. Empty state for first-time launch

**Prioritize (Phase 2 — Polish for experiment validity):**
6. Haptic feedback on complete + delete — demonstrates Tauri native plugin integration with minimal complexity
7. Visual completion state (strikethrough, muted color)
8. Mobile-native styling (44px touch targets, full-screen layout, no hover states)

**Defer (nice-to-have if time allows):**
- Notifications (requires permission UX, higher complexity, not in PROJECT.md requirements)
- Inline editing (medium complexity, not in PROJECT.md requirements)
- Swipe-to-delete (complex touch events on mobile)

**The MVP is fully specified in PROJECT.md and is small on purpose** — the value is demonstrating Tauri mobile works, not building a feature-rich todo app.

---

## Tauri Plugin Installation Mechanics (for each plugin)

Every official Tauri plugin follows the same pattern:

```bash
# 1. Add JS bindings
pnpm add @tauri-apps/plugin-store

# 2. Add Rust crate (in src-tauri/)
cargo add tauri-plugin-store

# 3. Register in src-tauri/lib.rs
app.plugin(tauri_plugin_store::Builder::default().build())

# 4. Add capability in src-tauri/capabilities/mobile.json
{
  "platforms": ["iOS", "android"],
  "permissions": ["store:default"]
}
```

This pattern applies identically to `plugin-notification`, `plugin-haptics`, etc. The capability file must explicitly list platforms to scope permissions to mobile.

---

## Sources

- [Tauri v2 Plugin List](https://v2.tauri.app/plugin/) — official plugin catalog
- [plugin-store README (GitHub)](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/store) — confirms Android + iOS support
- [plugin-haptics docs](https://v2.tauri.app/plugin/haptics/) — Android + iOS confirmed
- [plugin-notification docs](https://v2.tauri.app/plugin/notification/) — Android + iOS confirmed
- [plugin-deep-link docs](https://v2.tauri.app/plugin/deep-linking/) — Android + iOS confirmed
- [Persistent state in Tauri apps — Aptabase](https://aptabase.com/blog/persistent-state-tauri-apps) — localStorage vs plugin-store tradeoffs
- [Tauri Mobile Capabilities](https://v2.tauri.app/security/capabilities) — platform targeting for mobile permissions
- [4 Mobile Apps with Tauri: A Retrospective](https://blog.erikhorton.com/2025/10/05/4-mobile-apps-with-tauri-a-retrospective.html) — real-world Tauri mobile experience
- Context7 `/tauri-apps/plugins-workspace` — plugin API documentation (HIGH confidence)
- Context7 `/websites/v2_tauri_app` — official Tauri v2 site content (HIGH confidence)
