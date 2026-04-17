import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const SRC_TAURI = resolve(import.meta.dirname, "../../src-tauri")

describe("Phase 1 baseline capabilities", () => {
  it("capabilities/mobile.json uses the mobile-capability identifier", async () => {
    const raw = await readFile(resolve(SRC_TAURI, "capabilities/mobile.json"), "utf8")
    const json = JSON.parse(raw) as { identifier: string }
    expect(json.identifier).toBe("mobile-capability")
  })

  it("capabilities/mobile.json targets the main window on both mobile platforms", async () => {
    const raw = await readFile(resolve(SRC_TAURI, "capabilities/mobile.json"), "utf8")
    const json = JSON.parse(raw) as { windows: string[]; platforms: string[] }
    expect(json.windows).toEqual(["main"])
    expect(json.platforms).toContain("iOS")
    expect(json.platforms).toContain("android")
  })

  it("capabilities/mobile.json grants core:default and store:default permissions", async () => {
    const raw = await readFile(resolve(SRC_TAURI, "capabilities/mobile.json"), "utf8")
    const json = JSON.parse(raw) as { permissions: string[] }
    expect(json.permissions).toContain("core:default")
    expect(json.permissions).toContain("store:default")
  })
})

describe("haptics install integrity", () => {
  it("capabilities/mobile.json grants all three haptics:allow-* permissions", async () => {
    const raw = await readFile(resolve(SRC_TAURI, "capabilities/mobile.json"), "utf8")
    const json = JSON.parse(raw) as { permissions: string[] }
    expect(json.permissions).toContain("haptics:allow-impact-feedback")
    expect(json.permissions).toContain("haptics:allow-notification-feedback")
    expect(json.permissions).toContain("haptics:allow-selection-feedback")
  })

  it("lib.rs registers tauri_plugin_haptics inside a mobile-gated .setup() block", async () => {
    const rs = await readFile(resolve(SRC_TAURI, "src/lib.rs"), "utf8")
    expect(rs).toMatch(/\.setup\(\s*\|app\|/)
    expect(rs).toMatch(/#\[cfg\(mobile\)\]/)
    expect(rs).toMatch(/tauri_plugin_haptics::init\(\)/)
  })

  it("Cargo.toml declares tauri-plugin-haptics 2.3.2 under a mobile target cfg section", async () => {
    const toml = await readFile(resolve(SRC_TAURI, "Cargo.toml"), "utf8")
    expect(toml).toContain(`[target.'cfg(any(target_os = "android", target_os = "ios"))'.dependencies]`)
    expect(toml).toMatch(/tauri-plugin-haptics\s*=\s*"2\.3\.2"/)
  })
})
