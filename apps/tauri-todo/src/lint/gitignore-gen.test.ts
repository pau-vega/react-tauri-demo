import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const REPO_ROOT = resolve(import.meta.dirname, "../../../..")

describe("root .gitignore excludes Tauri gen/ directory", () => {
  it("contains an uncommented gen/ pattern line", async () => {
    const raw = await readFile(resolve(REPO_ROOT, ".gitignore"), "utf8")
    const lines = raw.split("\n")
    const matches = lines.filter((line) => !line.trimStart().startsWith("#") && /^gen\/?$/.test(line.trim()))
    expect(matches.length).toBeGreaterThan(0)
  })
})
