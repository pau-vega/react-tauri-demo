import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const VITE_CONFIG = resolve(import.meta.dirname, "../../vite.config.ts")

describe("vite.config.ts is wired for Tauri dev mode", () => {
  it("declares Tauri dev host binding and fixed port", async () => {
    const raw = await readFile(VITE_CONFIG, "utf8")
    expect(raw).toContain("process.env.TAURI_DEV_HOST")
    expect(raw).toContain("port: 1420")
    expect(raw).toContain("strictPort: true")
  })

  it("keeps Tauri-managed output quiet and ignores src-tauri/ from watch", async () => {
    const raw = await readFile(VITE_CONFIG, "utf8")
    expect(raw).toContain("clearScreen: false")
    expect(raw).toContain("**/src-tauri/**")
  })

  it("exposes VITE_ and TAURI_ENV_* env prefixes", async () => {
    const raw = await readFile(VITE_CONFIG, "utf8")
    expect(raw).toContain("envPrefix")
    expect(raw).toContain('"VITE_"')
    expect(raw).toContain('"TAURI_ENV_*"')
  })
})
