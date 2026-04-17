import type { Todo } from "@/hooks/use-todos"

type TodoItemProps = {
  todo: Todo
  onToggle: (id: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const toggleClass = todo.completed
    ? "w-11 h-11 shrink-0 rounded-full bg-blue-700 border-2 border-blue-700 flex items-center justify-center active:opacity-90"
    : "w-11 h-11 shrink-0 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center active:opacity-90"

  const textClass = todo.completed ? "flex-1 text-base line-through text-gray-400" : "flex-1 text-base text-gray-900"

  return (
    <li className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white border border-gray-200">
      <button
        aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        className={toggleClass}
        onClick={() => onToggle(todo.id)}
        type="button"
      >
        {todo.completed && <span className="text-white text-sm">✓</span>}
      </button>
      <span className={textClass}>{todo.text}</span>
      <button
        aria-label="Delete todo"
        className="w-11 h-11 shrink-0 flex items-center justify-center rounded-md text-gray-400 active:opacity-90 active:text-red-600"
        onClick={() => onDelete(todo.id)}
        type="button"
      >
        <span className="text-xl leading-none">×</span>
      </button>
    </li>
  )
}
