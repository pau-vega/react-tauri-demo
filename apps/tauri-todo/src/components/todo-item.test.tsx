import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import type { Todo } from "@/hooks/use-todos"

import { TodoItem } from "@/components/todo-item"

function makeTodo(partial: Partial<Todo> = {}): Todo {
  return { id: "id-1", text: "Buy milk", completed: false, ...partial }
}

describe("TodoItem", () => {
  it("invokes onToggle with the todo id when the toggle button is clicked", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn(async () => undefined)
    const onDelete = vi.fn(async () => undefined)
    render(<TodoItem onDelete={onDelete} onToggle={onToggle} todo={makeTodo({ id: "todo-42" })} />)

    await user.click(screen.getByRole("button", { name: /mark as complete/i }))

    expect(onToggle).toHaveBeenCalledExactlyOnceWith("todo-42")
    expect(onDelete).not.toHaveBeenCalled()
  })

  it("invokes onDelete with the todo id when the delete button is clicked, with no confirmation", async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn(async () => undefined)
    const onDelete = vi.fn(async () => undefined)
    render(<TodoItem onDelete={onDelete} onToggle={onToggle} todo={makeTodo({ id: "todo-99" })} />)

    await user.click(screen.getByRole("button", { name: /delete todo/i }))

    expect(onDelete).toHaveBeenCalledExactlyOnceWith("todo-99")
    expect(onToggle).not.toHaveBeenCalled()
  })

  it("renders the toggle aria-label as 'Mark as complete' for an incomplete todo", () => {
    render(
      <TodoItem
        onDelete={vi.fn(async () => undefined)}
        onToggle={vi.fn(async () => undefined)}
        todo={makeTodo({ completed: false })}
      />,
    )
    expect(screen.getByRole("button", { name: "Mark as complete" })).toBeInTheDocument()
  })

  it("renders the toggle aria-label as 'Mark as incomplete' for a completed todo", () => {
    render(
      <TodoItem
        onDelete={vi.fn(async () => undefined)}
        onToggle={vi.fn(async () => undefined)}
        todo={makeTodo({ completed: true })}
      />,
    )
    expect(screen.getByRole("button", { name: "Mark as incomplete" })).toBeInTheDocument()
  })

  it("renders the todo text content", () => {
    render(
      <TodoItem
        onDelete={vi.fn(async () => undefined)}
        onToggle={vi.fn(async () => undefined)}
        todo={makeTodo({ text: "Walk the dog" })}
      />,
    )
    expect(screen.getByText("Walk the dog")).toBeInTheDocument()
  })

  it("renders the toggle at 44px (w-11 h-11) when todo is incomplete", () => {
    render(
      <TodoItem
        onDelete={vi.fn(async () => undefined)}
        onToggle={vi.fn(async () => undefined)}
        todo={makeTodo({ completed: false })}
      />,
    )
    const toggle = screen.getByRole("button", { name: "Mark as complete" })
    expect(toggle.className).toMatch(/\bw-11\b/)
    expect(toggle.className).toMatch(/\bh-11\b/)
    expect(toggle.className).not.toMatch(/\bw-6\b/)
    expect(toggle.className).not.toMatch(/\bh-6\b/)
  })

  it("renders the toggle at 44px (w-11 h-11) when todo is completed", () => {
    render(
      <TodoItem
        onDelete={vi.fn(async () => undefined)}
        onToggle={vi.fn(async () => undefined)}
        todo={makeTodo({ completed: true })}
      />,
    )
    const toggle = screen.getByRole("button", { name: "Mark as incomplete" })
    expect(toggle.className).toMatch(/\bw-11\b/)
    expect(toggle.className).toMatch(/\bh-11\b/)
  })

  it("renders the delete button at 44px (w-11 h-11) and not w-8/h-8", () => {
    render(
      <TodoItem
        onDelete={vi.fn(async () => undefined)}
        onToggle={vi.fn(async () => undefined)}
        todo={makeTodo()}
      />,
    )
    const del = screen.getByRole("button", { name: /delete todo/i })
    expect(del.className).toMatch(/\bw-11\b/)
    expect(del.className).toMatch(/\bh-11\b/)
    expect(del.className).not.toMatch(/\bw-8\b/)
    expect(del.className).not.toMatch(/\bh-8\b/)
  })
})
