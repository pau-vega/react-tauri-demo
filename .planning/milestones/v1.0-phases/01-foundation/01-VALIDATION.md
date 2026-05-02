---
phase: 1
slug: foundation
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-17
reconstructed: true
---

# Phase 1 — Validation Strategy

> Retroactive validation contract for Phase 01 foundation. Reconstructed from PLAN/SUMMARY artifacts on 2026-04-17 (no VALIDATION.md existed at execution time).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.4 |
| **Config file** | `apps/tauri-todo/vitest.config.ts` |
| **Quick run command** | `pnpm --filter @monorepo-template/tauri-todo test` |
| **Full suite command** | `pnpm --filter @monorepo-template/tauri-todo test` |
| **Estimated runtime** | ~6 seconds (14 files, 71 tests) |

Config-shape integration tests live in `apps/tauri-todo/src/lint/` per established project convention (see pre-existing `capabilities.test.ts`, `no-hover.test.ts`, `no-ui-package.test.ts`).

---

## Sampling Rate

- **After every task commit:** `pnpm --filter @monorepo-template/tauri-todo test`
- **After every plan wave:** same (full suite is fast)
- **Before `/gsd-verify-work`:** full suite must be green
- **Max feedback latency:** ~6 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | ENV-01 | T-01-01 / accept | Android SDK/NDK/JDK env vars configured on dev machine | manual | — (dev-machine state) | ❌ | ⬛ manual |
| 01-01-02a | 01 | 1 | ENV-02 | — | 4 Rust Android targets installed | manual | — (rustup state) | ❌ | ⬛ manual |
| 01-01-02b | 01 | 1 | SCAF-05 | — | `gen/` pattern present in root `.gitignore` | unit | `pnpm --filter @monorepo-template/tauri-todo test src/lint/gitignore-gen.test.ts` | ✅ | ✅ green |
| 01-02-01 | 02 | 2 | SCAF-01, SCAF-03 | T-01-02 / accept | Workspace package name, Tauri deps, android scripts, catalog refs | unit | `pnpm --filter @monorepo-template/tauri-todo test src/lint/package-shape.test.ts` | ✅ | ✅ green |
| 01-02-01 | 02 | 2 | SCAF-04 | — | Vite reads TAURI_DEV_HOST, port 1420, strictPort, clearScreen false, envPrefix TAURI_ENV_* | unit | `pnpm --filter @monorepo-template/tauri-todo test src/lint/vite-config.test.ts` | ✅ | ✅ green |
| 01-03-01 | 03 | 2 | SCAF-01 | T-01-03, T-01-04, T-01-05 / accept+mitigate | Rust backend scaffold: app_lib crate, config-json5 feature twice, store plugin, mobile_entry_point, thin main.rs, tauri.conf.json5 identity + devUrl + mobile-capability + icon paths | unit | `pnpm --filter @monorepo-template/tauri-todo test src/lint/tauri-scaffold.test.ts` | ✅ | ✅ green |
| 01-03-02 | 03 | 2 | SCAF-01 (icons) | — | Icon files referenced in `tauri.conf.json5` bundle.icon exist on disk | unit | `pnpm --filter @monorepo-template/tauri-todo test src/lint/tauri-scaffold.test.ts` (icon existence sub-tests) | ✅ | ✅ green |
| 01-04-01a | 04 | 3 | SCAF-02 | — | `tauri android init` generates `src-tauri/gen/android/` and app launches on physical device | manual | — (gitignored output + physical device) | ❌ | ⬛ manual |
| 01-04-01b | 04 | 3 | SCAF-06 | T-01-06 / mitigate | `capabilities/mobile.json` grants `core:default` + `store:default`, declares `mobile-capability` identifier, `main` window, iOS+android platforms | unit | `pnpm --filter @monorepo-template/tauri-todo test src/lint/capabilities.test.ts` (Phase 1 baseline describe block) | ✅ | ✅ green |
| 01-05-01 | 05 | 1 | UAT gap closure | T-01-05 / accept | `isTauriRuntime()` guard detects `__TAURI_INTERNALS__` — used by Phase 2 `TodoApp` after verification-screen was replaced | unit | `pnpm --filter @monorepo-template/tauri-todo test src/lib/runtime.test.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky · ⬛ manual*

---

## Wave 0 Requirements

*Existing infrastructure covers all automatable phase requirements. Five config-shape test files were retroactively generated during validation (2026-04-17) to close Nyquist gaps — see "Validation Audit" below.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Android SDK/NDK 28+/JDK installed and discoverable via `JAVA_HOME`, `ANDROID_HOME`, `NDK_HOME` | ENV-01 | Dev-machine state; cannot be reproducibly verified in CI without provisioning Android Studio | Run: `echo $JAVA_HOME && echo $ANDROID_HOME && echo $NDK_HOME && java -version && adb --version`. All three env vars should print paths; Java should be 17+; adb should report a version. |
| All four Rust Android cross-compilation targets installed (`aarch64-linux-android`, `armv7-linux-androideabi`, `i686-linux-android`, `x86_64-linux-android`) | ENV-02 | Rustup toolchain state is dev-machine-local | Run: `rustup target list --installed \| grep android \| wc -l`. Expected output: `4`. |
| `tauri android init` generated `src-tauri/gen/android/` with valid Gradle project; `pnpm android:dev` launches app on connected Android device without error | SCAF-02 | `gen/` is gitignored (D-10); physical device + 10-30 min Gradle + Rust cross-compilation build required | Connect Android device with USB debugging enabled. From `apps/tauri-todo`, run `pnpm android:dev` (or `pnpm --filter @monorepo-template/tauri-todo android:dev` from monorepo root). App should install and launch on device. Prior human verification on 2026-04-16 passed (documented in 01-04-SUMMARY.md and 01-VERIFICATION.md re-verification at 2026-04-16T19:30Z — on-device confirmation committed in `e9642ac` via phase 03-05). |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or are explicitly marked manual-only with reason
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (only ENV-01/ENV-02/SCAF-02 are manual, all isolated)
- [x] Wave 0 not required — config-shape tests created retroactively
- [x] No watch-mode flags in commands
- [x] Feedback latency < 10s (actual: ~6s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated 2026-04-17

---

## Validation Audit 2026-04-17

| Metric | Count |
|--------|-------|
| Gaps found | 5 |
| Resolved (automated tests generated) | 5 |
| Escalated | 0 |
| Manual-only (unchanged) | 3 |

**Tests generated by `gsd-nyquist-auditor`:**

1. `apps/tauri-todo/src/lint/gitignore-gen.test.ts` — SCAF-05
2. `apps/tauri-todo/src/lint/package-shape.test.ts` — SCAF-03
3. `apps/tauri-todo/src/lint/vite-config.test.ts` — SCAF-04
4. `apps/tauri-todo/src/lint/tauri-scaffold.test.ts` — SCAF-01 (Rust backend + Tauri config + icon existence)
5. `apps/tauri-todo/src/lint/capabilities.test.ts` (extended) — SCAF-06 Phase 1 baseline permissions (existing haptics tests from Phase 2 preserved)

**Post-audit suite:** 14 test files, 71 tests, all green.

**Adapted assertions (aligned with accepted Phase 01 state):**

- `vite.config.ts` target assertion omitted — current impl uses `target: "esnext"` (commit `5b84df8`, Vite 8 / rolldown compatibility), not `safari13` as originally planned. All other vite-config invariants are asserted.
- `src/lib.rs` `greet` command and `generate_handler![greet]` assertions omitted — `greet` was intentionally removed in commit `81a300f` (Phase 02-01 cleanup) and the removal was accepted by Phase 01 UAT close-out (commit `af3052a`). Retained lib.rs invariants that still hold: `mobile_entry_point`, `pub fn run()`, store plugin registration, `generate_context!()`.
