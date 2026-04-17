import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { TodoList } from "@/components/todo-list"

const noop = vi.fn(async () => undefined)

describe("TodoList", () => {
  it("renders the loading copy when state.status is 'loading'", () => {
    render(<TodoList onDelete={noop} onToggle={noop} state={{ status: "loading" }} />)
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("renders the generic error copy when state.status is 'error'", () => {
    render(<TodoList onDelete={noop} onToggle={noop} state={{ status: "error", message: "boom" }} />)
    expect(screen.getByText("Could not load todos. Restart the app and try again.")).toBeInTheDocument()
    // The raw error message must NOT leak to the UI (T-02-08 mitigation)
    expect(screen.queryByText("boom")).not.toBeInTheDocument()
  })

  it("renders the empty state copy when state is 'ready' and the todos array is empty", () => {
    render(<TodoList onDelete={noop} onToggle={noop} state={{ status: "ready", todos: [] }} />)
    expect(screen.getByText("No todos yet")).toBeInTheDocument()
    expect(screen.getByText("Add your first todo above")).toBeInTheDocument()
  })

  it("renders a list item per todo when state is 'ready' with a non-empty todos array", () => {
    render(
      <TodoList
        onDelete={noop}
        onToggle={noop}
        state={{
          status: "ready",
          todos: [
            { id: "1", text: "Buy milk", completed: false },
            { id: "2", text: "Walk dog", completed: true },
          ],
        }}
      />,
    )
    const items = screen.getAllByRole("listitem")
    expect(items).toHaveLength(2)
    expect(screen.getByText("Buy milk")).toBeInTheDocument()
    expect(screen.getByText("Walk dog")).toBeInTheDocument()
    // Empty-state copy must NOT appear when the list is populated
    expect(screen.queryByText("No todos yet")).not.toBeInTheDocument()
  })
})
