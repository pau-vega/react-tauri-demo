# Domain Pitfalls: Tauri v2 Mobile Development

**Domain:** Tauri v2 mobile apps (Android + iOS) in a pnpm monorepo
**Researched:** 2026-04-15
**Confidence:** HIGH (verified against official docs, GitHub issues, and multiple community sources)

---

## Critical Pitfalls

Mistakes that cause build failures, rewrites, or silent misbehavior.

---

### Pitfall 1: Vite dev server not accessible from mobile device

**What goes wrong:** `tauri android dev` or `tauri ios dev` starts, Vite reports "ready", but the app on the device shows a blank white screen or the CLI hangs at "Waiting for your frontend dev server to start on…". The Vite dev server binds to `localhost` by default, which physical Android devices cannot reach.

**Why it happens:** Physical devices are separate network hosts. `localhost` only resolves on the machine running Vite. Emulators handle this differently (they map `10.0.2.2` → host `localhost`), so the problem may not surface until a real device is tested. For iOS physical devices, an additional `--host` flag and IPv6 address selection are required via `--force-ip-prompt`.

**Consequences:** Dev loop is completely broken on physical devices. Emulator works but real-device validation is blocked.

**Prevention:** Configure `vite.config.ts` to use `TAURI_DEV_HOST` when it is set:

```typescript
const host = process.env.TAURI_DEV_HOST

export default defineConfig({
  clearScreen: false,
  server: {
    host: host || false,
    port: 5173,
    strictPort: true,
    hmr: host
      ? { protocol: "ws", host, port: 1421 }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
})
```

For physical iOS devices, run: `pnpm tauri ios dev --host`

**Detection:** Blank screen on physical device but working on emulator. CLI output stalls at "Waiting for frontend dev server".

**Phase:** Phase 1 (initial Tauri scaffolding). Must be set up before any mobile testing.

**Sources:** [Official Vite config docs](https://v2.tauri.app/start/frontend/vite/), [GitHub issue #11137](https://github.com/tauri-apps/tauri/issues/11137)

---

### Pitfall 2: `tauri add` fails silently in pnpm workspaces (installs via npm instead)

**What goes wrong:** Running `pnpm tauri add @tauri-apps/plugin-store` in the `apps/tauri-todo` subdirectory produces a warning: "no lock files found, defaulting to npm", then fails with `ELIFECYCLE` or `ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`. The Cargo side may succeed but the JS side fails, leaving the project in a partially-installed state.

**Why it happens:** The Tauri CLI looks for `pnpm-lock.yaml` in the current directory to detect pnpm. In a monorepo, the lockfile lives at the workspace root, not in the app subdirectory. The CLI falls back to npm, which conflicts with the pnpm-managed workspace.

**Consequences:** Plugin is partially installed; Rust code has the dependency but JS types/bindings are missing. Build errors follow.

**Prevention:** Two options:
1. Create an empty `pnpm-lock.yaml` in `apps/tauri-todo` before running `tauri add`. This tricks the CLI into detecting pnpm.
2. Install plugins manually: run `pnpm add @tauri-apps/plugin-store` in `apps/tauri-todo`, then add the Rust dependency to `src-tauri/Cargo.toml` manually, then register the plugin in `src-tauri/src/lib.rs`.

Manual installation is more explicit and avoids the detection problem entirely.

**Detection:** Warning message "no lock files found, defaulting to npm" in CLI output.

**Phase:** Phase 1 (plugin installation). Know the workaround before adding `plugin-store`.

**Sources:** [GitHub issue #12706](https://github.com/tauri-apps/tauri/issues/12706), [GitHub issue #11859](https://github.com/tauri-apps/tauri/issues/11859)

---

### Pitfall 3: Missing or misconfigured environment variables block Android init

**What goes wrong:** `tauri android init` or `tauri android dev` fails with errors like "NDK_HOME environment variable isn't set", even after installing the NDK through Android Studio's SDK Manager.

**Why it happens:** Three separate environment variables must all be set correctly: `JAVA_HOME`, `ANDROID_HOME`, and `NDK_HOME`. Android Studio does not automatically export these to the shell. On macOS, environment variable changes in `~/.zshrc` require a new terminal session and will not be picked up by an already-open IDE.

**Required setup (macOS):**

```sh
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export NDK_HOME="$ANDROID_HOME/ndk/$(ls -1 $ANDROID_HOME/ndk)"
```

These must be in `~/.zshrc` (or equivalent), not just set in the terminal session.

**Required Rust targets:**

```sh
rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android
```

**Consequences:** `tauri android init` errors out before generating the Android project. No workaround at runtime.

**Detection:** Error mentions `NDK_HOME` or `ANDROID_HOME` not set. Running `echo $NDK_HOME` in the same terminal returns empty.

**Phase:** Phase 0 (developer machine setup). Must be validated before any code is written.

**Sources:** [Official prerequisites](https://v2.tauri.app/start/prerequisites/), [GitHub issue #11841](https://github.com/tauri-apps/tauri/issues/11841)

---

### Pitfall 4: iOS builds require full Xcode — Command Line Tools are not enough

**What goes wrong:** Installing Xcode Command Line Tools only (via `xcode-select --install`) does not satisfy Tauri's iOS build requirements. The build fails with missing simulator runtimes or missing Xcode project templates.

**Why it happens:** `tauri ios init` and `tauri ios dev` depend on full Xcode for: the iOS SDK, simulator management, and the Xcode project file format. Command Line Tools only provide compiler binaries.

**Additional requirements:**
- Install CocoaPods via Homebrew: `brew install cocoapods`
- Add iOS Rust targets: `rustup target add aarch64-apple-ios x86_64-apple-ios aarch64-apple-ios-sim`
- Download Xcode from [developer.apple.com](https://developer.apple.com/download/all/) rather than the App Store to avoid download corruption issues

**Physical device extra requirement:** iOS 16+ devices require "Developer Mode" enabled in Settings > Privacy & Security > Developer Mode. Xcode must be open and the device trusted before running `tauri ios dev`.

**Consequences:** `tauri ios init` fails or generates a broken Xcode project. No iOS build is possible.

**Detection:** Errors referencing Xcode project tools, `xcodebuild`, or simulator. `which xcodebuild` returns nothing or points to CLI tools only.

**Phase:** Phase 0 (developer machine setup).

**Sources:** [Official prerequisites](https://v2.tauri.app/start/prerequisites/), [DEV.to iOS guide](https://dev.to/adimac93/tauri-mobile-for-ios-4dp6)

---

### Pitfall 5: nvm/fnm-managed Node.js is invisible inside Xcode build phases

**What goes wrong:** `tauri ios dev` or `tauri ios build` fails with "node: command not found" or "cannot find pnpm" even though the correct Node version is active in the terminal.

**Why it happens:** Xcode runs build phase scripts in a restricted environment that does not source `~/.zshrc` or `~/.zprofile`. Version managers like nvm, fnm, and volta inject themselves into the PATH via shell profile hooks, which Xcode never executes.

**Consequences:** The Tauri build phase inside Xcode cannot locate Node, so the frontend build step fails, producing a broken iOS app bundle.

**Prevention:** Use a system-level Node installation (e.g., Homebrew: `brew install node`) or create an `.xcode.env.local` file in the iOS project directory pointing to the absolute node path:

```sh
NODE_BINARY=/opt/homebrew/bin/node
```

Alternatively, install Node via `volta` which creates symlinks in `/usr/local/bin` that Xcode can find.

**Detection:** Error appears inside Xcode output (not in the terminal running `tauri ios dev`) and mentions `node` or `pnpm` not found.

**Phase:** Phase 2 (iOS build setup). Must be validated before first successful iOS build.

**Sources:** Official Tauri dev docs note this limitation; React Native ecosystem has documented the same pattern extensively.

---

### Pitfall 6: Android Gradle / SDK version compatibility warnings block Play Store

**What goes wrong:** The app builds and runs in development, but `tauri android build` emits: "This Android Gradle plugin (8.x.x) was tested up to compileSdk = 34. You are strongly encouraged to update..." The app then fails to install on Android 15+ devices with "this app isn't compatible with the latest version of Android."

**Why it happens:** Tauri generates Android project files with a pinned Gradle plugin version. When Android releases a new SDK version (e.g., SDK 36 for Android 15), the Gradle plugin in the generated project does not automatically upgrade and falls out of compatibility.

**Prevention:** After `tauri android init`, check the generated `src-tauri/gen/android/build.gradle.kts` and `gradle/wrapper/gradle-wrapper.properties`. If targeting Android 15+, add to `gradle.properties`:

```properties
android.suppressUnsupportedCompileSdk=36
```

And update `compileSdk` to 35 or 36 in the generated `app/build.gradle.kts`. Do NOT commit `src-tauri/gen/` to version control without reviewing these values first.

**Detection:** Warning in `tauri android build` output. App installs but shows compatibility warning dialog on device.

**Phase:** Phase 3 (Android release build). Check before building a release APK/AAB.

**Sources:** [GitHub issue #14141](https://github.com/tauri-apps/tauri/issues/14141), [GitHub issue #10712](https://github.com/tauri-apps/tauri/issues/10712)

---

### Pitfall 7: iOS code signing resets to Automatic on every build

**What goes wrong:** After manually configuring "Signing & Capabilities" in Xcode with a specific provisioning profile, running `tauri ios build` resets the signing configuration to Automatic. The IPA fails to build or uses the wrong certificate.

**Why it happens:** Tauri regenerates and synchronizes the `.pbxproj` file during each build, overwriting any manual Xcode configuration changes. This is by design (Tauri owns the generated project), but it breaks manual signing workflows.

**Prevention:** For local development, use Xcode's "Automatically manage signing" (the default). For CI/CD distribution builds, use environment variables to pass signing credentials rather than editing project files. Let Tauri's automatic signing do its job; re-signing after the fact via fastlane or similar tools is the standard pattern.

**Detection:** Build succeeds locally with automatic signing. CI build fails because manual profile is not picked up.

**Phase:** Phase 4 (iOS release build/distribution).

**Sources:** [GitHub issue #10668](https://github.com/tauri-apps/tauri/issues/10668), [GitHub issue #10836](https://github.com/tauri-apps/tauri/issues/10836), [iOS Code Signing docs](https://v2.tauri.app/distribute/sign/ios/)

---

## Moderate Pitfalls

Mistakes that waste significant time but have known fixes.

---

### Pitfall 8: Capabilities not scoped to mobile platforms causes plugin errors

**What goes wrong:** The app works on desktop but on Android/iOS plugins throw "command not allowed on window main" or silently return nothing. Plugin permissions are defined but not applied to mobile targets.

**Why it happens:** Tauri v2 requires platform-specific capability files. A default capability file applies to all platforms but may not explicitly enable plugin permissions for `android` and `iOS`. The capabilities system is an allowlist — everything is denied by default.

**Prevention:** Create a separate `src-tauri/capabilities/mobile.json` for mobile-specific permissions:

```json
{
  "$schema": "../gen/schemas/mobile-schema.json",
  "identifier": "mobile-capability",
  "windows": ["main"],
  "platforms": ["iOS", "android"],
  "permissions": [
    "core:default",
    "store:allow-get",
    "store:allow-set",
    "store:allow-save",
    "store:allow-load"
  ]
}
```

**Detection:** Plugin calls resolve on desktop but fail on device. Console shows "not allowed" errors.

**Phase:** Phase 1 (plugin integration). Configure capabilities when registering each plugin.

**Sources:** [Capabilities docs](https://v2.tauri.app/security/capabilities/), [GitHub issue #9502](https://github.com/tauri-apps/tauri/issues/9502)

---

### Pitfall 9: `plugin-store` uses a relative file path that fails on Android

**What goes wrong:** `StoreBuilder::new("store.json")` or a bare filename panics on Android with "data store error: No such file or directory (os error 2)". The same code works on desktop.

**Why it happens:** On desktop, bare filenames resolve relative to the app data directory automatically. On Android, the data directory path is different and the store plugin may not resolve it correctly when given a relative path.

**Prevention:** Always use `app.path().app_data_dir()` to construct an explicit path when creating the store:

```rust
let store_path = app.path().app_data_dir()
    .expect("cannot get data dir")
    .join("store.json");
```

Or use the JS API which handles paths automatically:

```typescript
import { load } from "@tauri-apps/plugin-store"
const store = await load("store.json", { autoSave: true })
```

The JS API through the plugin abstracts path resolution and is safer across platforms.

**Detection:** App crashes on Android startup with "No such file or directory" in logcat. Works on desktop.

**Phase:** Phase 1 (plugin-store integration). Verify Android behavior explicitly with a device or emulator.

**Sources:** [plugins-workspace issue #987](https://github.com/tauri-apps/plugins-workspace/issues/987), [GitHub issue #1289](https://github.com/tauri-apps/plugins-workspace/issues/1289)

---

### Pitfall 10: `TauriActivity` unresolved reference — intermittent Android build corruption

**What goes wrong:** Android build fails with: `Unresolved reference: TauriActivity` in the generated `MainActivity.kt`. Cleaning build artifacts (`rm -rf src-tauri/gen`) and re-running `tauri android init` does not consistently fix the issue.

**Why it happens:** This is a known intermittent bug in how Tauri's Android project generation interacts with Android Studio's caches and Gradle state. The generated files depend on state outside the repository (Android Studio indexes, Gradle daemon state).

**Prevention:**
1. Never partially commit `src-tauri/gen/` — either commit all of it or none of it
2. When this occurs: close Android Studio completely, run `rm -rf src-tauri/gen ~/.gradle/caches`, re-run `tauri android init`, and reopen Android Studio
3. Prefer running `pnpm tauri android dev` from the terminal rather than via Android Studio's run button

**Detection:** `MainActivity.kt` line 6 shows red underline in Android Studio. Build output contains "Unresolved reference: TauriActivity".

**Phase:** Phase 1 (Android setup) and ongoing. Know the reset procedure.

**Sources:** [GitHub issue #13983](https://github.com/tauri-apps/tauri/issues/13983), [cargo-mobile2 issue #392](https://github.com/tauri-apps/cargo-mobile2/issues/392)

---

### Pitfall 11: First Rust build for mobile targets takes 10-30 minutes

**What goes wrong:** The first `tauri android dev` or `tauri ios dev` appears to hang. No progress is shown for extended periods. Developers kill the process thinking it is stuck.

**Why it happens:** Tauri must compile the Rust codebase (and all its dependencies) for multiple mobile CPU architectures simultaneously. Android requires 4 targets (aarch64, armv7, i686, x86_64) compiled concurrently. Dependencies like `tauri`, `serde`, and `tokio` are large. This is expected and normal.

**Prevention:** Set expectations and configure Cargo for faster development builds in `src-tauri/Cargo.toml`:

```toml
[profile.dev]
incremental = true
opt-level = 0

[profile.dev.package."*"]
opt-level = 0
```

Subsequent builds after the first are fast due to incremental compilation. Consider starting the Android build early in setup to let it compile while configuring other things.

**Detection:** This is not actually a bug. Terminal shows Cargo compilation progress (slowly). Wait it out — it can take 20+ minutes on first run.

**Phase:** Phase 1 (initial setup). Document this in the team's setup guide.

---

### Pitfall 12: Xcode stable-only — beta Xcode versions break Tauri iOS

**What goes wrong:** After installing the latest Xcode beta, `tauri ios dev` fails with toolchain errors, missing simulator runtimes, or Swift compile failures. The error messages point to internal Xcode APIs that changed in the beta.

**Why it happens:** Tauri's iOS tooling (via `cargo-mobile2`) is tested against Xcode stable releases only. Beta Xcode versions frequently change internal toolchain interfaces.

**Prevention:** Always use the latest stable Xcode release. Download from [developer.apple.com/download/all/](https://developer.apple.com/download/all/) to get stable-only releases. Avoid the Xcode Beta listed in the App Store.

**Detection:** iOS build breaks after Xcode update. Check `xcode-select -p` to verify which Xcode is active.

**Phase:** Phase 2 (iOS setup). Verify Xcode version before starting.

**Sources:** [DEV.to iOS guide](https://dev.to/adimac93/tauri-mobile-for-ios-4dp6), [GitHub issue #14233](https://github.com/tauri-apps/tauri/issues/14233)

---

## Minor Pitfalls

Mistakes with straightforward fixes once identified.

---

### Pitfall 13: Bundle identifier must be set before `tauri android/ios init`

**What goes wrong:** The default identifier `com.example` (or the package name from `create-tauri-app`) is used for `tauri android init`. The Android and iOS project files are generated with this identifier baked in. Changing it later requires deleting and regenerating `src-tauri/gen/` entirely.

**Prevention:** Set a real identifier in `tauri.conf.json` before running init commands:

```json
{
  "identifier": "com.yourteam.tauritodo"
}
```

Use only alphanumeric characters, hyphens, and periods. The identifier must comply with both Android package name rules and iOS bundle ID rules.

**Phase:** Phase 1, before `tauri android init` or `tauri ios init`.

---

### Pitfall 14: Turbo cannot cache `tauri android dev` / `tauri ios dev` correctly

**What goes wrong:** Turbo marks `tauri android dev` as a cacheable task and either skips it (thinking a previous run was equivalent) or fails because it tries to cache a long-running dev server process.

**Prevention:** In `turbo.json`, configure Tauri mobile tasks as persistent/non-cacheable:

```json
{
  "tasks": {
    "tauri:android:dev": {
      "cache": false,
      "persistent": true
    },
    "tauri:ios:dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Phase:** Phase 1 (monorepo integration).

---

### Pitfall 15: `src-tauri/gen/` contains generated files that differ per developer machine

**What goes wrong:** `src-tauri/gen/android/` and `src-tauri/gen/ios/` contain generated files with absolute paths, developer-specific signing configuration, and Xcode project state. Committing these causes conflicts for other developers and breaks CI.

**Prevention:** Add to `.gitignore`:

```
src-tauri/gen/android/
src-tauri/gen/ios/
```

Each developer and CI environment should run `tauri android init` / `tauri ios init` as part of their setup. Document this in the project README.

**Detection:** Merge conflicts in `.pbxproj` or `build.gradle.kts`. CI fails because absolute paths from developer A don't exist on developer B's machine.

**Phase:** Phase 1. Add to `.gitignore` before first commit of `src-tauri/`.

---

### Pitfall 16: Apple Silicon Macs need ARM64 package variants

**What goes wrong:** On M1/M2/M3 Macs, `pnpm install` may install x64 variants of `@tauri-apps/cli` or Rollup plugins, causing "Cannot find module @tauri-apps/cli-darwin-x64" errors.

**Prevention:** Ensure the lockfile is generated on an ARM Mac (not committed from an Intel Mac). If encountering the error, delete `node_modules` and `pnpm-lock.yaml` and reinstall on the ARM machine. Homebrew-installed tools (node, cocoapods) are natively ARM64 and preferred over nvm-managed versions.

**Phase:** Phase 0 (developer setup), only relevant for mixed Intel/ARM team.

**Sources:** [GitHub issue #13771](https://github.com/tauri-apps/tauri/issues/13771)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Developer machine setup | Missing env vars (ANDROID_HOME, NDK_HOME, JAVA_HOME) | Validate with `echo $ANDROID_HOME` before init |
| Developer machine setup | Full Xcode not installed (only CLI tools) | Install full Xcode from developer.apple.com |
| Tauri scaffolding in monorepo | `tauri add` failing to detect pnpm | Use empty `pnpm-lock.yaml` trick or manual install |
| First Android dev run | 10-30 min Rust compile appears hung | Expected; wait, document for teammates |
| First iOS dev run | nvm-managed node invisible to Xcode | Use Homebrew node or set NODE_BINARY |
| Vite + mobile integration | Blank screen on physical device | Set `TAURI_DEV_HOST` in vite.config.ts |
| plugin-store integration | Android path panic | Use JS API, not raw Rust path |
| Capabilities setup | Plugin commands silently denied | Create mobile-specific capability file |
| Android release build | Gradle/SDK version warning | Bump compileSdk, check gradle.properties |
| iOS release build | Signing overwritten on rebuild | Use automatic signing; re-sign in CI post-build |
| Version control | Generated files with absolute paths committed | Gitignore `src-tauri/gen/` |
| Turbo task config | Dev server cached or skipped | Mark dev tasks as `cache: false, persistent: true` |

---

## Sources

- [Tauri v2 Prerequisites](https://v2.tauri.app/start/prerequisites/) — HIGH confidence
- [Tauri v2 Develop (mobile dev commands)](https://v2.tauri.app/develop/) — HIGH confidence
- [Tauri v2 Vite frontend config](https://v2.tauri.app/start/frontend/vite/) — HIGH confidence
- [Tauri v2 Capabilities](https://v2.tauri.app/security/capabilities/) — HIGH confidence
- [Tauri v2 Store plugin](https://v2.tauri.app/plugin/store/) — HIGH confidence
- [GitHub #11859 — Tauri CLI fails in pnpm workspace](https://github.com/tauri-apps/tauri/issues/11859) — HIGH confidence
- [GitHub #12706 — `tauri add` doesn't detect pnpm](https://github.com/tauri-apps/tauri/issues/12706) — HIGH confidence
- [GitHub #11137 — Android real device can't connect to localhost](https://github.com/tauri-apps/tauri/issues/11137) — HIGH confidence
- [GitHub #11841 — NDK_HOME not set](https://github.com/tauri-apps/tauri/issues/11841) — HIGH confidence
- [GitHub #14141 — Gradle 8.5.1 / compileSdk 36](https://github.com/tauri-apps/tauri/issues/14141) — HIGH confidence
- [GitHub #13983 — Unresolved reference TauriActivity](https://github.com/tauri-apps/tauri/issues/13983) — HIGH confidence
- [GitHub #10668 — iOS signing reset on build](https://github.com/tauri-apps/tauri/issues/10668) — HIGH confidence
- [plugins-workspace #987 — store mobile support](https://github.com/tauri-apps/plugins-workspace/issues/987) — HIGH confidence
- [plugins-workspace #1289 — store Android permission error](https://github.com/tauri-apps/plugins-workspace/issues/1289) — MEDIUM confidence (closed as "not planned")
- [DEV.to — Tauri mobile for iOS](https://dev.to/adimac93/tauri-mobile-for-ios-4dp6) — MEDIUM confidence
- [Erik Horton — 4 Mobile Apps with Tauri retrospective](https://blog.erikhorton.com/2025/10/05/4-mobile-apps-with-tauri-a-retrospective.html) — MEDIUM confidence
- [Melvin Oostendorp — Tauri v2 + Next.js monorepo guide](https://melvinoostendorp.nl/blog/tauri-v2-nextjs-monorepo-guide) — MEDIUM confidence
