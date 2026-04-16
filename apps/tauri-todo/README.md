# Tauri Todo

A simple todo list app built with React and Tauri v2, targeting Android as a native mobile app.

## Prerequisites

- Node.js 24+
- pnpm 10.x
- Rust (via rustup)
- Android Studio with SDK Platform 34, Build-Tools, NDK 28+
- Rust Android targets: `rustup target add aarch64-linux-android armv7-linux-androideabi i686-linux-android x86_64-linux-android`

### Environment Variables

Add to your shell profile (`~/.zshrc`):

```sh
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export NDK_HOME="$ANDROID_HOME/ndk/$(ls $ANDROID_HOME/ndk/ | sort -V | tail -1)"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin"
```

## Development

### Web (browser)

```sh
pnpm dev
```

Opens at http://localhost:1420. Tauri IPC calls will fail in browser — this is expected.

### Android (device)

Connect a device via USB with USB debugging enabled, then:

```sh
pnpm android:dev
```

First build takes 10-30 minutes (Gradle + Rust cross-compilation). Subsequent builds are fast.

HMR is automatic when `TAURI_DEV_HOST` is set (Tauri sets this for you).

> Running from app directory (`apps/tauri-todo`). See [Running from monorepo root](#running-from-monorepo-root) for root-level usage.

### Running from monorepo root

Per project convention, there are no root-level convenience scripts. Use `--filter` to target this app from anywhere in the monorepo:

```sh
# Development (Android device)
pnpm --filter @monorepo-template/tauri-todo android:dev

# Build (Android APK)
pnpm --filter @monorepo-template/tauri-todo android:build

# Web dev server
pnpm --filter @monorepo-template/tauri-todo dev

# Type checking
pnpm --filter @monorepo-template/tauri-todo typecheck
```

> **Note:** The `--filter` flag must come BEFORE the command name. `pnpm android:dev --filter ...` will fail.

### Other commands

| Command | Description |
|---------|-------------|
| `pnpm build` | Production frontend build |
| `pnpm android:build` | Android APK build |
| `pnpm lint` | ESLint check and fix |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test` | Run Vitest unit tests |
| `pnpm format` | Prettier formatting |

## Troubleshooting

### Device not detected

```sh
adb devices
```

Should list your device. If empty:
- Enable USB debugging: Settings > Developer options > USB debugging
- Try a different USB cable (data cable, not charge-only)
- Run `adb kill-server && adb start-server`

### Gradle sync fails

```sh
cd src-tauri/gen/android && ./gradlew --stop && ./gradlew clean
```

Then retry `pnpm android:dev`.

### First build appears stuck

Normal. First build downloads Gradle dependencies and cross-compiles Rust for 4 architectures. Watch CPU usage — if it is high, compilation is progressing. Do not cancel.

### White screen on device

- Check that Vite dev server is running (port 1420)
- Verify `TAURI_DEV_HOST` is set to your machine's LAN IP
- Check logcat for errors (see below)

### pnpm workspace quirks

`tauri add` is broken in pnpm workspaces (GitHub issue #12706). Install plugins manually:

```sh
# JS side (from apps/tauri-todo)
pnpm add @tauri-apps/plugin-<name>

# Rust side (from apps/tauri-todo/src-tauri)
cargo add tauri-plugin-<name>
```

Then register the plugin in `src-tauri/src/lib.rs` and add the permission to `src-tauri/capabilities/mobile.json`.

## Logcat Guide

Filter Tauri and WebView logs:

```sh
adb logcat -s tauri RustStdoutStderr chromium
```

Common filters:

| Filter | Shows |
|--------|-------|
| `adb logcat -s tauri` | Tauri framework messages |
| `adb logcat -s RustStdoutStderr` | Rust println! and panic output |
| `adb logcat -s chromium` | WebView console.log and JS errors |
| `adb logcat \| grep -i "error\|panic\|fatal"` | All errors across the system |

Clear logcat before testing:

```sh
adb logcat -c
```
