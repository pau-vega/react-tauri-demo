# SECURITY — Phase 01 Foundation

**Phase:** 01-foundation
**ASVS Level:** L1
**Audit Date:** 2026-04-17
**Auditor:** gsd-security-auditor
**Threats Closed:** 9 / 9

## Summary

All nine threats declared in Phase 01 plans (01-01 through 01-05) have been verified closed. Three `mitigate` threats have implementation evidence in the repo; six `accept` threats are documented in the accepted risks register below. No open threats.

The Phase 01 project is a Tauri v2 mobile experiment — no backend, no secrets, local-only todo data. The threat surface is small by design.

## Threat Verification Matrix

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| T-01-01 | Information Disclosure | accept | CLOSED | Accepted — see register below. `.planning/phases/01-foundation/01-01-SUMMARY.md` documents env var setup (JAVA_HOME, ANDROID_HOME, NDK_HOME are standard SDK paths, not secrets). No `.env` files exist in repo (per D-12). |
| T-01-02 | Tampering (npm supply chain) | accept | CLOSED | Accepted — see register below. Pinned versions verified in `apps/tauri-todo/package.json:19-21`: `"@tauri-apps/api": "2.10.1"`, `"@tauri-apps/plugin-store": "2.4.2"`, `"@tauri-apps/cli": "2.10.1"`. `pnpm-lock.yaml` present at repo root; `preferFrozenLockfile: true` enforced. |
| T-01-03 | Tampering (greet command input) | accept | CLOSED | Accepted — see register below. Note: the `greet` command has since been removed from `src-tauri/src/lib.rs` (evolved out of the codebase in a later phase). While in place, `format!("Hello, {}!", name)` was safe — Rust's `format!` does not interpret strings as code. The component no longer exists, so the attack surface is nil. |
| T-01-04 | Elevation of Privilege (capabilities reference) | mitigate | CLOSED | Verified in `apps/tauri-todo/src-tauri/tauri.conf.json5:21` — `capabilities: ["mobile-capability"]`. Only one capability identifier is referenced. |
| T-01-05a | Information Disclosure (store.json on disk) | accept | CLOSED | Accepted — see register below. Local todo text, not secrets. No encryption per Phase 01 RESEARCH Security Domain. |
| T-01-05b | Tampering (`__TAURI_INTERNALS__` spoofing) | accept | CLOSED | Accepted — see register below. Detection helper verified in `apps/tauri-todo/src/lib/runtime.ts:2` (`"__TAURI_INTERNALS__" in window`). Used as a DX guard, not a security boundary. Unit tests in `runtime.test.ts` cover all three states. |
| T-01-06 | Elevation of Privilege (mobile capabilities file) | mitigate | CLOSED | Verified in `apps/tauri-todo/src-tauri/capabilities/mobile.json:7-8` — permissions include `core:default` and `store:default`. No `fs`, `shell`, `http`, or `dialog` plugin permissions present. See "Unregistered Flags" below for the additional haptics permissions added in a later phase. |
| T-01-07 | Tampering (store.json on device) | accept | CLOSED | Accepted — see register below. Local-only todo data, no secrets. Android app sandbox protects the file from other apps. |
| T-01-08 | Spoofing (Vite dev server on LAN) | accept | CLOSED | Accepted — see register below. Dev-only concern. `apps/tauri-todo/vite.config.ts` binds `host: host || false` — host is only set when `process.env.TAURI_DEV_HOST` is present (dev mode only). Production builds use bundled frontend via `frontendDist: "../dist"` in `tauri.conf.json5`. |

## Accepted Risks Register

Each entry below represents a risk that has been consciously accepted by the project owner for Phase 01 with documented rationale.

### T-01-01 — Environment variable paths in shell profile
- **Risk:** `JAVA_HOME`, `ANDROID_HOME`, `NDK_HOME` paths may be disclosed via process env dumps or shell history.
- **Rationale:** These are standard Android SDK installation paths, not secrets. No credential values involved.
- **Control:** No `.env` files are present or planned (D-12). Paths are setup documentation only.
- **Accepted by:** Phase 01 plan author (01-01-PLAN.md).

### T-01-02 — npm supply-chain risk
- **Risk:** A malicious update to `@tauri-apps/api`, `@tauri-apps/plugin-store`, `@tauri-apps/cli`, or any transitive dep could introduce backdoors.
- **Rationale:** Standard supply-chain risk accepted for a development experiment. No production deployment or user data at stake.
- **Control:** Tauri packages pinned to exact versions (no caret range). `pnpm-lock.yaml` tracked in git. `preferFrozenLockfile: true` in project config.
- **Accepted by:** Phase 01 plan author (01-02-PLAN.md).

### T-01-03 — `greet` command input tampering
- **Risk:** Crafted input via the `invoke("greet", { name })` IPC call could attempt injection.
- **Rationale:** `format!("Hello, {}!", name)` in Rust does not interpret strings as code. This was a demo command.
- **Control:** Component was removed in a later phase; current `src-tauri/src/lib.rs` has no `#[tauri::command]` handlers. Risk surface has since gone to zero.
- **Accepted by:** Phase 01 plan author (01-03-PLAN.md).

### T-01-05a — `store.json` contents on disk
- **Risk:** Local `store.json` could be read if device is compromised.
- **Rationale:** Contents are local todo text, no secrets. No PII, credentials, or sensitive data written.
- **Control:** Android app sandbox. No encryption required per Phase 01 RESEARCH Security Domain analysis.
- **Accepted by:** Phase 01 plan author (01-03-PLAN.md).

### T-01-05b — `__TAURI_INTERNALS__` property spoofing
- **Risk:** A malicious webpage could spoof `window.__TAURI_INTERNALS__` to bypass the DX guard in `isTauriRuntime()`.
- **Rationale:** The detection is for developer experience (avoid crashing when opened in a plain browser), not a security boundary. A page that can spoof this property already controls the DOM.
- **Control:** Guard returns early with a clear error message; no security decisions are based on the check. Real Tauri runtime attestation happens at the Rust/IPC layer.
- **Accepted by:** Phase 01 plan author (01-05-PLAN.md).

### T-01-07 — `store.json` tampering on device
- **Risk:** A user with device shell access or root could modify `store.json` contents.
- **Rationale:** Local todo data is non-sensitive; mutation only affects the user's own app state.
- **Control:** Android app sandbox isolates the file from other apps. No integrity-sensitive data stored.
- **Accepted by:** Phase 01 plan author (01-04-PLAN.md).

### T-01-08 — Vite dev server on LAN (spoofing)
- **Risk:** Attacker on same LAN could intercept/spoof the Vite dev server and inject code during development.
- **Rationale:** Dev-only concern. Production APK bundles the frontend offline; no LAN connection required at runtime.
- **Control:** `apps/tauri-todo/vite.config.ts` binds `host` only when `TAURI_DEV_HOST` is set. Production builds use `frontendDist: "../dist"`. Debug builds only per D-36.
- **Accepted by:** Phase 01 plan author (01-04-PLAN.md).

## Unregistered Flags

The following were detected during audit but are not part of Phase 01's threat register. Informational only — not a Phase 01 blocker.

- **Additional haptics permissions in `capabilities/mobile.json`:**
  `apps/tauri-todo/src-tauri/capabilities/mobile.json:9-11` grants `haptics:allow-impact-feedback`, `haptics:allow-notification-feedback`, and `haptics:allow-selection-feedback`. These permissions and the corresponding `tauri-plugin-haptics` dependency in `Cargo.toml:20` and `package.json:20` were introduced in a later phase (outside Phase 01 scope). They are narrow, allow-list style permissions for a UI-only plugin (no filesystem, network, or OS access) and are consistent with the minimal-permissions principle (D-35). Should be threat-modeled in the phase that introduced them.
- **CSP added in `tauri.conf.json5`:**
  `apps/tauri-todo/src-tauri/tauri.conf.json5:20` declares `csp: "default-src 'self'; style-src 'self' 'unsafe-inline'"`. Not in Phase 01 plans; additional hardening added later. Positive — no concern.

## Files Audited

- `/Users/pauvelascogarrofe/Documents/react-tauri-demo/apps/tauri-todo/package.json`
- `/Users/pauvelascogarrofe/Documents/react-tauri-demo/apps/tauri-todo/src-tauri/Cargo.toml`
- `/Users/pauvelascogarrofe/Documents/react-tauri-demo/apps/tauri-todo/src-tauri/tauri.conf.json5`
- `/Users/pauvelascogarrofe/Documents/react-tauri-demo/apps/tauri-todo/src-tauri/capabilities/mobile.json`
- `/Users/pauvelascogarrofe/Documents/react-tauri-demo/apps/tauri-todo/src-tauri/src/lib.rs`
- `/Users/pauvelascogarrofe/Documents/react-tauri-demo/apps/tauri-todo/src-tauri/src/main.rs`
- `/Users/pauvelascogarrofe/Documents/react-tauri-demo/apps/tauri-todo/src/lib/runtime.ts`
- `/Users/pauvelascogarrofe/Documents/react-tauri-demo/apps/tauri-todo/src/lib/runtime.test.ts`

---
*Phase: 01-foundation — Security audit complete*
