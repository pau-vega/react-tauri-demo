import { TodoInput } from "@/components/todo-input"
import { TodoList } from "@/components/todo-list"
import { useTodos } from "@/hooks/use-todos"

export function TodoApp() {
  const { state, addTodo, toggleTodo, deleteTodo } = useTodos()

  return (
    <main className="min-h-screen bg-white px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-900">Tauri Todo</h1>
        <TodoInput onAdd={addTodo} disabled={state.status !== "ready"} />
        <TodoList state={state} onToggle={toggleTodo} onDelete={deleteTodo} />
      </div>
    </main>
  )
}
