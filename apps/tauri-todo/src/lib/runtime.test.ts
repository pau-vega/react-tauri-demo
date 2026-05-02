import { afterEach, beforeEach, describe, expect, it } from "vitest"

import { isTauriRuntime } from "@/lib/runtime"

type WindowWithTauri = { __TAURI_INTERNALS__?: unknown }

describe("isTauriRuntime", () => {
  beforeEach(() => {
    delete (window as unknown as WindowWithTauri).__TAURI_INTERNALS__
  })
  afterEach(() => {
    delete (window as unknown as WindowWithTauri).__TAURI_INTERNALS__
  })

  it("returns false when window.__TAURI_INTERNALS__ is absent", () => {
    expect(isTauriRuntime()).toBe(false)
  })

  it("returns true when window.__TAURI_INTERNALS__ is present", () => {
    ;(window as unknown as WindowWithTauri).__TAURI_INTERNALS__ = {}
    expect(isTauriRuntime()).toBe(true)
  })

  it("returns false again after __TAURI_INTERNALS__ is removed", () => {
    ;(window as unknown as WindowWithTauri).__TAURI_INTERNALS__ = {}
    expect(isTauriRuntime()).toBe(true)
    delete (window as unknown as WindowWithTauri).__TAURI_INTERNALS__
    expect(isTauriRuntime()).toBe(false)
  })
})
