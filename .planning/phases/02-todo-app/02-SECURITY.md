---
phase: 02
slug: todo-app
status: verified
threats_open: 0
asvs_level: 1
created: 2026-04-17
---

# Phase 02 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| User input to JS state | User-typed todo text enters React state via controlled onChange; never executed as code | Plain text strings (todo titles) |
| JS hook to Tauri Store plugin | store.set crosses IPC to Rust-side plugin, which writes JSON to Android app_data_dir | Todo array (id, text, completed) |
| Store plugin to filesystem | store.json written to Tauri-sandboxed app data directory (Android private storage) | JSON serialised todo array |
| WebView to Android OS lifecycle | Android can kill the app process at any time; Tauri Store persists state before kill | None — read-only boundary for the app |

All boundaries are within the app sandbox. No network, no auth, no external services.

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-02-01 | Tampering | store.json on-device file | accept | File lives in Tauri-sandboxed Android app_data_dir. Tampering requires root access. Out of scope for single-user local app. | closed |
| T-02-02 | Information Disclosure | Error messages from err narrowing | mitigate | Raw err.message held in state.message; TodoList error branch renders generic copy only. Verified: state.message absent from todo-list.tsx; generic copy present at line 23. | closed |
| T-02-03 | Denial of Service | Repeated addTodo with large text | accept | No input length cap (D-01 minimal fields). Single-user local app — self-inflicted DoS only. | closed |
| T-02-04 | Elevation of Privilege | Tauri capabilities breadth | mitigate | mobile.json grants exactly 2 permissions: core:default and store:default. No wildcards, no filesystem or shell access. Verified: capabilities/mobile.json lines 7-8. | closed |
| T-02-05 | Spoofing | N/A | accept | No authentication, no user identities. Single-user local app. | closed |
| T-02-06 | Repudiation | N/A | accept | No audit log required. User is sole actor. | closed |
| T-02-07 | Tampering | XSS via todo text in TodoItem | mitigate | React auto-escapes JSX expression interpolation. {todo.text} renders text content, never HTML. Zero dangerouslySetInnerHTML in all 4 components. Verified: grep returns 0 matches across components/. | closed |
| T-02-08 | Information Disclosure | Error state message rendering | mitigate | TodoList error branch (todo-list.tsx line 20-26) renders "Could not load todos. Restart the app and try again." — does NOT interpolate state.message. Verified: grep for state.message returns 0 matches in components/. | closed |
| T-02-09 | Denial of Service | Infinite render loops | mitigate | useTodos useEffect has empty dep array (use-todos.ts line 43: }, []). TodoInput useState is self-contained. No memoization bombs. Verified: use-todos.ts line 43. | closed |
| T-02-10 | Elevation of Privilege | Forbidden module imports (@monorepo-template/ui) | mitigate | Zero imports from @monorepo-template/ui across all todo-*.tsx components. Verified: grep returns 0 matches in components/. | closed |
| T-02-11 | Spoofing | N/A | accept | No authentication, no impersonation surface. | closed |
| T-02-12 | Repudiation | N/A | accept | No audit log required. Single user on a single device. | closed |
| T-02-13 | Tampering | Device in non-trusted state (rooted/debug) | accept | Dev-only verification step. Tester is the developer running their own local build. Out of scope for this experiment. | closed |
| T-02-14 | Information Disclosure | adb logcat output during verification | accept | adb logcat visible only to the developer. No PII or secrets in any error path — app has none. | closed |
| T-02-15 | Denial of Service | First-compile 10-30 min blocking checkpoint | mitigate | STATE.md and Plan 03 Task 1 Step 3 both pre-warn about first compile duration. User explicitly informed so the delay is not misinterpreted as a hang. Verified: STATE.md and 02-03-PLAN.md contain the pre-warning. | closed |
| T-02-16 | Elevation of Privilege | adb install leaves app on device after verification | accept | Developer can uninstall via Settings > Apps or adb uninstall. No persistent privilege granted beyond the app's own sandbox. | closed |
| T-02-17 | Spoofing | N/A | accept | No authentication. | closed |
| T-02-18 | Repudiation | N/A | accept | User is sole actor; audit log unnecessary. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-02-01 | T-02-01 | store.json lives in Android app_data_dir (private storage). Tampering requires root access. No integrity signing needed for a single-user local todo experiment with no PII. | gsd-security-auditor | 2026-04-17 |
| AR-02-02 | T-02-03 | No input length cap in Phase 2 (D-01: minimal fields only). Single-user, no network — any DoS via large text is self-inflicted and not a meaningful threat. Can be revisited if Phase 3 adds sharing. | gsd-security-auditor | 2026-04-17 |
| AR-02-03 | T-02-05 | No authentication model. App is a single-user, local, offline todo list with no identity surface. | gsd-security-auditor | 2026-04-17 |
| AR-02-04 | T-02-06 | No audit log. User is the sole actor on a personal device. | gsd-security-auditor | 2026-04-17 |
| AR-02-05 | T-02-11 | No authentication, no impersonation surface (mirrors T-02-05 rationale for UI layer). | gsd-security-auditor | 2026-04-17 |
| AR-02-06 | T-02-12 | No audit log at the UI layer. Same rationale as T-02-06. | gsd-security-auditor | 2026-04-17 |
| AR-02-07 | T-02-13 | Verification is a dev-only checkpoint. Rooted or debug-mode device is the developer's own hardware. Out of scope for a local experiment. | gsd-security-auditor | 2026-04-17 |
| AR-02-08 | T-02-14 | adb logcat is visible only to the developer running verification. The app carries no PII, secrets, or credentials in any code path. | gsd-security-auditor | 2026-04-17 |
| AR-02-09 | T-02-16 | App installed via adb is confined to its own Android sandbox. Developer can uninstall at any time. No elevated privilege persists. | gsd-security-auditor | 2026-04-17 |
| AR-02-10 | T-02-17 | No authentication model (mirrors T-02-05 / T-02-11 rationale for Plan 03 verification layer). | gsd-security-auditor | 2026-04-17 |
| AR-02-11 | T-02-18 | No audit log. User is sole actor. Same rationale as T-02-06 / T-02-12. | gsd-security-auditor | 2026-04-17 |

*Accepted risks do not resurface in future audit runs.*

---

## Mitigate Threat Evidence Summary

| Threat ID | File(s) Verified | Evidence |
|-----------|-----------------|----------|
| T-02-02 | apps/tauri-todo/src/components/todo-list.tsx | Line 23: generic copy rendered; grep for state.message returns 0 matches in components/ |
| T-02-04 | apps/tauri-todo/src-tauri/capabilities/mobile.json | Lines 7-8: exactly ["core:default", "store:default"] — 2 permissions only |
| T-02-07 | apps/tauri-todo/src/components/ (all todo-*.tsx) | grep for dangerouslySetInnerHTML returns 0 matches across all 4 component files |
| T-02-08 | apps/tauri-todo/src/components/todo-list.tsx | Lines 20-26: error branch hard-codes generic copy; grep for state.message returns 0 matches in components/ |
| T-02-09 | apps/tauri-todo/src/hooks/use-todos.ts | Line 43: }, [] — empty dependency array confirmed |
| T-02-10 | apps/tauri-todo/src/components/ (all todo-*.tsx) | grep for @monorepo-template/ui returns 0 matches across all 4 component files |
| T-02-15 | .planning/STATE.md, .planning/phases/02-todo-app/02-03-PLAN.md | Both files contain the "10-30 minutes" first-compile pre-warning |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-04-17 | 18 | 18 | 0 | gsd-security-auditor (claude-sonnet-4-6) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-04-17
