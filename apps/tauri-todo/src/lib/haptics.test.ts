import { impactFeedback, notificationFeedback, selectionFeedback } from "@tauri-apps/plugin-haptics"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { hapticAdd, hapticDelete, hapticToggle } from "@/lib/haptics"

vi.mock("@tauri-apps/plugin-haptics", () => ({
  impactFeedback: vi.fn(async () => undefined),
  notificationFeedback: vi.fn(async () => undefined),
  selectionFeedback: vi.fn(async () => undefined),
}))

type WindowWithTauri = { __TAURI_INTERNALS__?: unknown }

beforeEach(() => {
  vi.clearAllMocks()
  delete (window as unknown as WindowWithTauri).__TAURI_INTERNALS__
})
afterEach(() => {
  delete (window as unknown as WindowWithTauri).__TAURI_INTERNALS__
})

describe("haptics wrappers - off-Tauri no-op", () => {
  it("hapticAdd does not call impactFeedback when __TAURI_INTERNALS__ is absent", async () => {
    await hapticAdd()
    expect(impactFeedback).not.toHaveBeenCalled()
  })
  it("hapticToggle does not call selectionFeedback when __TAURI_INTERNALS__ is absent", async () => {
    await hapticToggle()
    expect(selectionFeedback).not.toHaveBeenCalled()
  })
  it("hapticDelete does not call notificationFeedback when __TAURI_INTERNALS__ is absent", async () => {
    await hapticDelete()
    expect(notificationFeedback).not.toHaveBeenCalled()
  })
})

describe("haptics wrappers - in Tauri runtime", () => {
  beforeEach(() => {
    ;(window as unknown as WindowWithTauri).__TAURI_INTERNALS__ = {}
  })

  it("hapticAdd calls impactFeedback medium exactly once and does not call the others", async () => {
    await hapticAdd()
    expect(impactFeedback).toHaveBeenCalledExactlyOnceWith("medium")
    expect(selectionFeedback).not.toHaveBeenCalled()
    expect(notificationFeedback).not.toHaveBeenCalled()
  })

  it("hapticToggle calls selectionFeedback exactly once with no args", async () => {
    await hapticToggle()
    expect(selectionFeedback).toHaveBeenCalledExactlyOnceWith()
    expect(impactFeedback).not.toHaveBeenCalled()
    expect(notificationFeedback).not.toHaveBeenCalled()
  })

  it("hapticDelete calls notificationFeedback warning exactly once", async () => {
    await hapticDelete()
    expect(notificationFeedback).toHaveBeenCalledExactlyOnceWith("warning")
    expect(impactFeedback).not.toHaveBeenCalled()
    expect(selectionFeedback).not.toHaveBeenCalled()
  })
})

describe("haptics wrappers - errors swallowed", () => {
  beforeEach(() => {
    ;(window as unknown as WindowWithTauri).__TAURI_INTERNALS__ = {}
  })

  it("hapticAdd resolves without rethrowing when impactFeedback rejects", async () => {
    vi.mocked(impactFeedback).mockRejectedValueOnce(new Error("boom"))
    await expect(hapticAdd()).resolves.toBeUndefined()
  })
  it("hapticToggle resolves without rethrowing when selectionFeedback rejects", async () => {
    vi.mocked(selectionFeedback).mockRejectedValueOnce(new Error("boom"))
    await expect(hapticToggle()).resolves.toBeUndefined()
  })
  it("hapticDelete resolves without rethrowing when notificationFeedback rejects", async () => {
    vi.mocked(notificationFeedback).mockRejectedValueOnce(new Error("boom"))
    await expect(hapticDelete()).resolves.toBeUndefined()
  })
})
