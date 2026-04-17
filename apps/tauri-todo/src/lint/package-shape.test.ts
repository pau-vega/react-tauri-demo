import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const PKG_JSON = resolve(import.meta.dirname, "../../package.json")

type PackageJson = {
  name?: string
  private?: boolean
  type?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

async function readPkg(): Promise<PackageJson> {
  const raw = await readFile(PKG_JSON, "utf8")
  return JSON.parse(raw) as PackageJson
}

describe("apps/tauri-todo package.json workspace shape", () => {
  it("declares the expected workspace package identity", async () => {
    const pkg = await readPkg()
    expect(pkg.name).toBe("@monorepo-template/tauri-todo")
    expect(pkg.private).toBe(true)
    expect(pkg.type).toBe("module")
  })

  it("exposes dev/build/typecheck and android:* scripts", async () => {
    const pkg = await readPkg()
    const scripts = pkg.scripts ?? {}
    expect(scripts.dev).toBeTruthy()
    expect(scripts.build).toBeTruthy()
    expect(scripts.typecheck).toBeTruthy()
    expect(scripts["android:dev"]).toBeTruthy()
    expect(scripts["android:build"]).toBeTruthy()
  })

  it("lists the Tauri runtime and CLI packages", async () => {
    const pkg = await readPkg()
    const deps = pkg.dependencies ?? {}
    const devDeps = pkg.devDependencies ?? {}
    expect(deps).toHaveProperty("@tauri-apps/api")
    expect(deps).toHaveProperty("@tauri-apps/plugin-store")
    expect(devDeps).toHaveProperty("@tauri-apps/cli")
  })

  it("wires shared toolchain packages through the pnpm catalog", async () => {
    const pkg = await readPkg()
    const deps = pkg.dependencies ?? {}
    const devDeps = pkg.devDependencies ?? {}
    expect(deps.react).toBe("catalog:")
    expect(deps["react-dom"]).toBe("catalog:")
    expect(devDeps.typescript).toBe("catalog:")
    expect(devDeps.vite).toBe("catalog:")
    expect(devDeps.vitest).toBe("catalog:")
  })
})
