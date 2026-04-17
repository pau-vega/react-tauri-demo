import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TodoInput } from "@/components/todo-input"

describe("TodoInput", () => {
  it("submits the trimmed text and clears the input after the Add button is clicked", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn(async () => undefined)
    render(<TodoInput disabled={false} onAdd={onAdd} />)

    const input = screen.getByPlaceholderText("Add a todo...")
    const button = screen.getByRole("button", { name: /add/i })

    await user.type(input, "  Buy milk  ")
    await user.click(button)

    expect(onAdd).toHaveBeenCalledExactlyOnceWith("Buy milk")
    expect(input).toHaveValue("")
  })

  it("submits the trimmed text when the user presses Enter", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn(async () => undefined)
    render(<TodoInput disabled={false} onAdd={onAdd} />)

    const input = screen.getByPlaceholderText("Add a todo...")
    await user.type(input, "Walk dog{Enter}")

    expect(onAdd).toHaveBeenCalledExactlyOnceWith("Walk dog")
    expect(input).toHaveValue("")
  })

  it("does not call onAdd when the trimmed text is empty", async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn(async () => undefined)
    render(<TodoInput disabled={false} onAdd={onAdd} />)

    const input = screen.getByPlaceholderText("Add a todo...")
    const button = screen.getByRole("button", { name: /add/i })

    // With empty text the button is disabled, so clicking it is a no-op
    expect(button).toBeDisabled()

    // Type whitespace-only; button stays disabled and clicking does not call onAdd
    await user.type(input, "   ")
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onAdd).not.toHaveBeenCalled()
  })

  it("disables the Add button when the disabled prop is true", () => {
    render(<TodoInput disabled={true} onAdd={vi.fn(async () => undefined)} />)
    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled()
  })

  it("enables the Add button once non-whitespace text is entered", async () => {
    const user = userEvent.setup()
    render(<TodoInput disabled={false} onAdd={vi.fn(async () => undefined)} />)

    const button = screen.getByRole("button", { name: /add/i })
    expect(button).toBeDisabled()

    await user.type(screen.getByPlaceholderText("Add a todo..."), "a")
    expect(button).not.toBeDisabled()
  })
})
