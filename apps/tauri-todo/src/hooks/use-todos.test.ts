import type { Store } from "@tauri-apps/plugin-store"

import { load } from "@tauri-apps/plugin-store"
import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { useTodos } from "@/hooks/use-todos"

vi.mock("@tauri-apps/plugin-store", () => ({
  load: vi.fn(),
}))

type StoreDouble = {
  store: Record<string, unknown>
  get: ReturnType<typeof vi.fn>
  set: ReturnType<typeof vi.fn>
  save: ReturnType<typeof vi.fn>
}

function createStoreDouble(initial: Record<string, unknown> = {}): StoreDouble {
  const data: Record<string, unknown> = { ...initial }
  return {
    store: data,
    get: vi.fn(async (key: string) => data[key]),
    set: vi.fn(async (key: string, value: unknown) => {
      data[key] = value
    }),
    save: vi.fn(async () => undefined),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe("useTodos", () => {
  it("loads an empty list from a fresh store and transitions to ready", async () => {
    const double = createStoreDouble()
    vi.mocked(load).mockResolvedValue(double as unknown as Store)

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.state.status).toBe("ready")
    })
    if (result.current.state.status !== "ready") throw new Error("expected ready")
    expect(result.current.state.todos).toEqual([])
  })

  it("adds a new todo with trimmed text, fresh id, and completed=false, persisting to the store", async () => {
    const double = createStoreDouble()
    vi.mocked(load).mockResolvedValue(double as unknown as Store)

    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.state.status).toBe("ready"))

    await act(async () => {
      await result.current.addTodo("  Buy milk  ")
    })

    if (result.current.state.status !== "ready") throw new Error("expected ready")
    expect(result.current.state.todos).toHaveLength(1)
    const [todo] = result.current.state.todos
    if (!todo) throw new Error("expected a todo")
    expect(todo.text).toBe("Buy milk")
    expect(todo.completed).toBe(false)
    expect(typeof todo.id).toBe("string")
    expect(todo.id.length).toBeGreaterThan(0)

    expect(double.set).toHaveBeenCalledWith(
      "todos",
      expect.arrayContaining([expect.objectContaining({ text: "Buy milk" })]),
    )
    expect(double.save).toHaveBeenCalled()
  })

  it("is a no-op when addTodo receives whitespace-only text", async () => {
    const double = createStoreDouble()
    vi.mocked(load).mockResolvedValue(double as unknown as Store)

    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.state.status).toBe("ready"))

    await act(async () => {
      await result.current.addTodo("   ")
    })

    if (result.current.state.status !== "ready") throw new Error("expected ready")
    expect(result.current.state.todos).toEqual([])
    expect(double.set).not.toHaveBeenCalled()
    expect(double.save).not.toHaveBeenCalled()
  })

  it("is a no-op when addTodo receives an empty string", async () => {
    const double = createStoreDouble()
    vi.mocked(load).mockResolvedValue(double as unknown as Store)

    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.state.status).toBe("ready"))

    await act(async () => {
      await result.current.addTodo("")
    })

    if (result.current.state.status !== "ready") throw new Error("expected ready")
    expect(result.current.state.todos).toEqual([])
    expect(double.set).not.toHaveBeenCalled()
  })

  it("toggles only the matching todo's completed flag, leaving other todos unchanged", async () => {
    const existing = [
      { id: "id-a", text: "a", completed: false },
      { id: "id-b", text: "b", completed: false },
      { id: "id-c", text: "c", completed: true },
    ]
    const double = createStoreDouble({ todos: existing })
    vi.mocked(load).mockResolvedValue(double as unknown as Store)

    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.state.status).toBe("ready"))

    await act(async () => {
      await result.current.toggleTodo("id-b")
    })

    if (result.current.state.status !== "ready") throw new Error("expected ready")
    const byId = Object.fromEntries(result.current.state.todos.map((t) => [t.id, t.completed]))
    expect(byId).toEqual({ "id-a": false, "id-b": true, "id-c": true })
    expect(double.save).toHaveBeenCalled()
  })

  it("toggles back to incomplete when called twice on the same id", async () => {
    const existing = [{ id: "id-a", text: "a", completed: false }]
    const double = createStoreDouble({ todos: existing })
    vi.mocked(load).mockResolvedValue(double as unknown as Store)

    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.state.status).toBe("ready"))

    await act(async () => {
      await result.current.toggleTodo("id-a")
    })
    await act(async () => {
      await result.current.toggleTodo("id-a")
    })

    if (result.current.state.status !== "ready") throw new Error("expected ready")
    expect(result.current.state.todos[0]?.completed).toBe(false)
  })

  it("deletes only the matching todo, leaving other todos unchanged and in order", async () => {
    const existing = [
      { id: "id-a", text: "a", completed: false },
      { id: "id-b", text: "b", completed: false },
      { id: "id-c", text: "c", completed: false },
    ]
    const double = createStoreDouble({ todos: existing })
    vi.mocked(load).mockResolvedValue(double as unknown as Store)

    const { result } = renderHook(() => useTodos())
    await waitFor(() => expect(result.current.state.status).toBe("ready"))

    await act(async () => {
      await result.current.deleteTodo("id-b")
    })

    if (result.current.state.status !== "ready") throw new Error("expected ready")
    expect(result.current.state.todos.map((t) => t.id)).toEqual(["id-a", "id-c"])
    expect(double.set).toHaveBeenCalledWith("todos", [
      { id: "id-a", text: "a", completed: false },
      { id: "id-c", text: "c", completed: false },
    ])
    expect(double.save).toHaveBeenCalled()
  })

  it("transitions to error status when the initial store load fails", async () => {
    vi.mocked(load).mockRejectedValue(new Error("load failed"))

    const { result } = renderHook(() => useTodos())

    await waitFor(() => {
      expect(result.current.state.status).toBe("error")
    })
    if (result.current.state.status !== "error") throw new Error("expected error")
    expect(result.current.state.message).toBe("load failed")
  })
})
