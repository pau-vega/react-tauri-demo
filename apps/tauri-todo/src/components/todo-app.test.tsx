import type { Store } from "@tauri-apps/plugin-store"

import { load } from "@tauri-apps/plugin-store"
import { render, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { TodoApp } from "@/components/todo-app"

vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn(),
}))

function createStoreDouble() {
  const data: Record<string, unknown> = {}
  return {
    get: vi.fn(async (key: string) => data[key]),
    set: vi.fn(async (key: string, value: unknown) => {
      data[key] = value
    }),
    save: vi.fn(async () => undefined),
  }
}

describe("TodoApp safe-area padding", () => {
  it("renders main with max(2rem, env(safe-area-inset-*)) top and bottom padding", async () => {
    vi.mocked(load).mockResolvedValue(createStoreDouble() as unknown as Store)

    const { container } = render(<TodoApp />)
    await waitFor(() => {
      expect(container.querySelector("main")).not.toBeNull()
    })

    const main = container.querySelector("main")
    if (!main) throw new Error("expected main element")

    expect(main.className).toContain("pt-[max(2rem,env(safe-area-inset-top))]")
    expect(main.className).toContain("pb-[max(2rem,env(safe-area-inset-bottom))]")
    expect(main.className).not.toMatch(/\bpy-8\b/)
  })
})
