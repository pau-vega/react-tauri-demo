import { access, readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const SRC_TAURI = resolve(import.meta.dirname, "../../src-tauri")

// Strip JSON5 comments while preserving string literal contents (so // inside a URL stays intact).
// Walks the source once, toggling a "string" flag on unescaped " or ' characters and skipping
// comment bytes when outside strings.
function stripJson5Comments(raw: string): string {
  let out = ""
  let i = 0
  let stringQuote: string | null = null
  while (i < raw.length) {
    const ch = raw[i]
    const next = raw[i + 1]
    if (stringQuote) {
      out += ch
      if (ch === "\\" && next !== undefined) {
        out += next
        i += 2
        continue
      }
      if (ch === stringQuote) stringQuote = null
      i += 1
      continue
    }
    if (ch === '"' || ch === "'") {
      stringQuote = ch
      out += ch
      i += 1
      continue
    }
    if (ch === "/" && next === "/") {
      while (i < raw.length && raw[i] !== "\n") i += 1
      continue
    }
    if (ch === "/" && next === "*") {
      i += 2
      while (i < raw.length && !(raw[i] === "*" && raw[i + 1] === "/")) i += 1
      i += 2
      continue
    }
    out += ch
    i += 1
  }
  return out
}

// Extract the bundle.icon array as string literals. Returns raw path strings.
function extractIconPaths(body: string): string[] {
  const match = body.match(/icon\s*:\s*\[([\s\S]*?)\]/)
  if (!match?.[1]) return []
  return [...match[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1] as string)
}

describe("Tauri v2 scaffold integrity", () => {
  describe("tauri.conf.json5", () => {
    it("declares the expected product identity and dev wiring", async () => {
      const raw = await readFile(resolve(SRC_TAURI, "tauri.conf.json5"), "utf8")
      const body = stripJson5Comments(raw)
      expect(body).toMatch(/productName\s*:\s*["']Tauri Todo["']/)
      expect(body).toMatch(/identifier\s*:\s*["']com\.monorepo\.tauritodo["']/)
      expect(body).toMatch(/devUrl\s*:\s*["']http:\/\/localhost:1420["']/)
      expect(body).toMatch(/frontendDist\s*:\s*["']\.\.\/dist["']/)
    })

    it("references the mobile-capability in app.security.capabilities", async () => {
      const raw = await readFile(resolve(SRC_TAURI, "tauri.conf.json5"), "utf8")
      const body = stripJson5Comments(raw)
      expect(body).toMatch(/capabilities\s*:\s*\[[^\]]*["']mobile-capability["'][^\]]*\]/)
    })

    it("declares a bundle.icon array with at least 5 entries that all exist on disk", async () => {
      const raw = await readFile(resolve(SRC_TAURI, "tauri.conf.json5"), "utf8")
      const body = stripJson5Comments(raw)
      const icons = extractIconPaths(body)
      expect(icons.length).toBeGreaterThanOrEqual(5)
      for (const iconPath of icons) {
        await expect(access(resolve(SRC_TAURI, iconPath))).resolves.toBeUndefined()
      }
    })
  })

  describe("Cargo.toml", () => {
    it("declares the package name and app_lib crate with mobile-compatible crate types", async () => {
      const toml = await readFile(resolve(SRC_TAURI, "Cargo.toml"), "utf8")
      expect(toml).toContain(`name = "tauri-todo"`)
      expect(toml).toContain(`name = "app_lib"`)
      expect(toml).toContain(`crate-type = ["staticlib", "cdylib", "rlib"]`)
    })

    it("enables the config-json5 feature on both tauri-build and tauri", async () => {
      const toml = await readFile(resolve(SRC_TAURI, "Cargo.toml"), "utf8")
      expect(toml).toMatch(/tauri-build\s*=.*features\s*=\s*\["config-json5"\]/)
      expect(toml).toMatch(/\ntauri\s*=.*features\s*=\s*\["config-json5"\]/)
    })

    it("declares the tauri-plugin-store v2 dependency", async () => {
      const toml = await readFile(resolve(SRC_TAURI, "Cargo.toml"), "utf8")
      expect(toml).toContain(`tauri-plugin-store = "2"`)
    })
  })

  describe("src/lib.rs", () => {
    it("exposes the mobile_entry_point attribute on pub fn run()", async () => {
      const rs = await readFile(resolve(SRC_TAURI, "src/lib.rs"), "utf8")
      expect(rs).toMatch(/#\[cfg_attr\(mobile,\s*tauri::mobile_entry_point\)\]/)
      expect(rs).toMatch(/pub fn run\(\)/)
    })

    it("registers the tauri-plugin-store builder", async () => {
      const rs = await readFile(resolve(SRC_TAURI, "src/lib.rs"), "utf8")
      expect(rs).toMatch(/tauri_plugin_store::Builder::new\(\)\.build\(\)/)
    })

    it("calls tauri::generate_context!() to boot the Tauri runtime", async () => {
      const rs = await readFile(resolve(SRC_TAURI, "src/lib.rs"), "utf8")
      expect(rs).toMatch(/tauri::generate_context!\(\)/)
    })
  })

  describe("src/main.rs", () => {
    it("applies the windows_subsystem cfg_attr and delegates to app_lib::run", async () => {
      const rs = await readFile(resolve(SRC_TAURI, "src/main.rs"), "utf8")
      expect(rs).toMatch(/#!\[cfg_attr\(not\(debug_assertions\),\s*windows_subsystem\s*=\s*"windows"\)\]/)
      expect(rs).toContain("app_lib::run()")
    })

    it("is a thin passthrough — no tauri:: calls in main.rs (mobile builds require logic in lib.rs)", async () => {
      const rs = await readFile(resolve(SRC_TAURI, "src/main.rs"), "utf8")
      expect(rs).not.toMatch(/\btauri::/)
    })
  })
})
