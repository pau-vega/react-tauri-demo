import { readFile, readdir } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const SRC_DIR = resolve(import.meta.dirname, "..")
const PKG_JSON = resolve(import.meta.dirname, "../../package.json")
const EXTS = [".ts", ".tsx", ".css"]
const FORBIDDEN = "@monorepo-template/ui"

async function collectFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })
  const out: string[] = []
  for (const entry of entries) {
    if (!entry.isFile()) continue
    if (!EXTS.some((ext) => entry.name.endsWith(ext))) continue
    if (entry.name.endsWith(".test.ts") || entry.name.endsWith(".test.tsx")) continue
    const parent = entry.parentPath ?? dir
    out.push(resolve(parent, entry.name))
  }
  return out
}

describe("no @monorepo-template/ui imports or deps in apps/tauri-todo", () => {
  it("does not import @monorepo-template/ui anywhere in src/", async () => {
    const files = await collectFiles(SRC_DIR)
    const offenders: string[] = []
    for (const file of files) {
      const content = await readFile(file, "utf8")
      if (content.includes(FORBIDDEN)) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })

  it("does not declare @monorepo-template/ui in dependencies or devDependencies", async () => {
    const raw = await readFile(PKG_JSON, "utf8")
    const pkg = JSON.parse(raw) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
    const allKeys = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})]
    expect(allKeys).not.toContain(FORBIDDEN)
  })
})
