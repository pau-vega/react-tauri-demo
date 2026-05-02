import type { TodosState } from "@/hooks/use-todos"

import { TodoItem } from "@/components/todo-item"

type TodoListProps = {
  state: TodosState
  onToggle: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TodoList({ state, onToggle, onDelete }: TodoListProps) {
  if (state.status === "loading") {
    return (
      <div className="py-12 flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  if (state.status === "error") {
    return (
      <div className="py-12 flex items-center justify-center">
        <p className="text-sm text-red-600">Could not load todos. Restart the app and try again.</p>
      </div>
    )
  }

  if (state.todos.length === 0) {
    return (
      <div className="py-12 flex flex-col items-center gap-2">
        <p className="text-base font-semibold text-gray-900">No todos yet</p>
        <p className="text-sm text-gray-500">Add your first todo above</p>
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {state.todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}
