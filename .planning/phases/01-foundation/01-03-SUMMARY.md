---
phase: 01-foundation
plan: "03"
subsystem: tauri-backend
tags: [tauri, rust, cargo, icons, turbo]
dependency_graph:
  requires: ["01-01"]
  provides: ["src-tauri rust backend", "tauri config", "icon set", "turbo android tasks"]
  affects: ["apps/tauri-todo/src-tauri/", "turbo.json"]
tech_stack:
  added: ["tauri v2", "tauri-plugin-store v2", "serde", "tauri-build"]
  patterns: ["thin main.rs passthrough", "mobile_entry_point cfg_attr", "plugin-before-handler registration"]
key_files:
  created:
    - apps/tauri-todo/src-tauri/Cargo.toml
    - apps/tauri-todo/src-tauri/build.rs
    - apps/tauri-todo/src-tauri/src/main.rs
    - apps/tauri-todo/src-tauri/src/lib.rs
    - apps/tauri-todo/src-tauri/tauri.conf.json5
    - apps/tauri-todo/src-tauri/icons/32x32.png
    - apps/tauri-todo/src-tauri/icons/128x128.png
    - apps/tauri-todo/src-tauri/icons/128x128@2x.png
    - apps/tauri-todo/src-tauri/icons/icon.icns
    - apps/tauri-todo/src-tauri/icons/icon.ico
  modified:
    - turbo.json
decisions:
  - "Used config-json5 feature in both tauri and tauri-build to support JSON5 config format"
  - "Icons generated via sips+iconutil (icns) and ImageMagick (ico) as fallback — Tauri CLI not available without package.json"
  - "android:build depends on ^build in turbo.json per PATTERNS.md (Cargo/Gradle manage own caches)"
metrics:
  duration_seconds: 143
  completed_date: "2026-04-16"
  tasks_completed: 2
  tasks_total: 2
  files_created: 10
  files_modified: 1
---

# Phase 01 Plan 03: Rust Backend and Tauri Config Summary

**One-liner:** Rust backend with greet command and store plugin using Tauri v2 JSON5 config at com.monorepo.tauritodo, plus default icon set and android:dev/android:build Turbo tasks.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create Rust backend files and Tauri config | 6363eaa | Cargo.toml, build.rs, main.rs, lib.rs, tauri.conf.json5 |
| 2 | Generate default icon set and update Turbo config | fd4f1ce | icons/ (5 files), turbo.json |

## What Was Built

### Rust Backend (Task 1)

- `src-tauri/Cargo.toml`: Package named `tauri-todo` with `app_lib` crate, `config-json5` feature in both `tauri` and `tauri-build`, `tauri-plugin-store = "2"`, serde dependencies
- `src-tauri/build.rs`: Single-line `tauri_build::build()` call required by Tauri CLI
- `src-tauri/src/main.rs`: Thin passthrough with `windows_subsystem = "windows"` cfg_attr and `app_lib::run()` call — no app logic
- `src-tauri/src/lib.rs`: `greet` command returning `format!("Hello, {}!", name)`, `#[cfg_attr(mobile, tauri::mobile_entry_point)]` on `pub fn run()`, store plugin registered before invoke_handler
- `src-tauri/tauri.conf.json5`: JSON5 config with identifier `com.monorepo.tauritodo`, devUrl `http://localhost:1420` (matches vite.config.ts port), `mobile-capability` in security capabilities, bundle icon paths matching the generated icon files

### Icon Set (Task 2)

- 3 PNG files at required sizes: 32x32, 128x128, 128x128@2x (256x256)
- `icon.icns`: Generated via macOS `iconutil` from an iconset directory
- `icon.ico`: Generated via ImageMagick from the source PNG
- Icons are placeholder blue-pixel-scaled images per D-20 (default placeholders, no custom branding)

### Turbo Integration (Task 2)

- Added `android:dev` (persistent: true, cache: false) — matches `dev` task pattern for long-running processes
- Added `android:build` (dependsOn: ["^build"], cache: false) — depends on JS build since Tauri wraps Vite; no Turbo caching since Cargo/Gradle manage their own caches
- All 8 original tasks (build, dev, typecheck, lint, format, clean, test, e2e) preserved unchanged

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Tauri CLI unavailable for `pnpm tauri icon` command**
- **Found during:** Task 2 — icon generation
- **Issue:** `apps/tauri-todo` has no `package.json` yet (created in Plan 02), so `pnpm tauri icon` failed with "Command tauri not found"
- **Fix:** Used macOS-native `sips` to resize PNG at required sizes; used `iconutil` with a properly structured `.iconset` directory to generate `.icns`; used ImageMagick `convert`/`magick` (available via Homebrew) to generate `.ico`
- **Files modified:** `apps/tauri-todo/src-tauri/icons/` (all 5 icon files)
- **Commit:** fd4f1ce

**2. [Rule 1 - Bug] sips format conversion failed for icns/ico directly**
- **Found during:** Task 2 — fallback icon generation
- **Issue:** `sips -s format icns` and `sips -s format ico` both failed with "Error 13: unknown error" when writing to temp directory — likely a macOS permission/sandbox issue with sips temp file handling
- **Fix:** Used `iconutil` for `.icns` (proper macOS tooling) and ImageMagick for `.ico` (available via Homebrew)
- **Files modified:** None (alternative approach used)
- **Commit:** fd4f1ce (same task commit)

## Known Stubs

None — no data flow or UI rendering in this plan. All files are Rust source and configuration.

## Threat Flags

No new threat surface beyond what is modeled in the plan's threat register. The `tauri.conf.json5` `mobile-capability` reference is intentional and the capability file will be created in Plan 04.

## Self-Check: PASSED

All created files verified:
- FOUND: apps/tauri-todo/src-tauri/Cargo.toml
- FOUND: apps/tauri-todo/src-tauri/build.rs
- FOUND: apps/tauri-todo/src-tauri/src/main.rs
- FOUND: apps/tauri-todo/src-tauri/src/lib.rs
- FOUND: apps/tauri-todo/src-tauri/tauri.conf.json5
- FOUND: apps/tauri-todo/src-tauri/icons/32x32.png
- FOUND: apps/tauri-todo/src-tauri/icons/128x128.png
- FOUND: apps/tauri-todo/src-tauri/icons/128x128@2x.png
- FOUND: apps/tauri-todo/src-tauri/icons/icon.icns
- FOUND: apps/tauri-todo/src-tauri/icons/icon.ico
- FOUND: turbo.json (modified)

All commits verified:
- FOUND: 6363eaa — feat(01-03): create Rust backend files and Tauri config
- FOUND: fd4f1ce — feat(01-03): generate default icon set and update turbo.json
