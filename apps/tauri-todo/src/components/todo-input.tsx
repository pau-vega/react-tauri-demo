import { useState } from "react"

type TodoInputProps = {
  onAdd: (text: string) => Promise<void>
  disabled: boolean
}

export function TodoInput({ onAdd, disabled }: TodoInputProps) {
  const [text, setText] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (trimmed.length === 0) return
    await onAdd(trimmed)
    setText("")
  }

  const canSubmit = !disabled && text.trim().length > 0

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <input
        autoFocus
        className="flex-1 h-11 px-3 bg-white border border-gray-200 rounded-md text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a todo..."
        value={text}
      />
      <button
        className="shrink-0 h-11 px-4 bg-blue-700 text-white text-sm font-normal rounded-md active:opacity-90 disabled:opacity-50"
        disabled={!canSubmit}
        type="submit"
      >
        Add
      </button>
    </form>
  )
}
