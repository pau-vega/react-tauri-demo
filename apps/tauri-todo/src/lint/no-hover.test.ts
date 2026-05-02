import { readFile, readdir } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const SRC_DIR = resolve(import.meta.dirname, "..")
const EXTS = [".ts", ".tsx", ".css"]

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

describe("no hover: utilities in apps/tauri-todo/src", () => {
  it("does not contain any Tailwind hover: utility in source files", async () => {
    const files = await collectFiles(SRC_DIR)
    const offenders: string[] = []
    for (const file of files) {
      const content = await readFile(file, "utf8")
      if (/\bhover:/.test(content)) offenders.push(file)
    }
    expect(offenders).toEqual([])
  })
})
