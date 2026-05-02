import type { Store } from "@tauri-apps/plugin-store"

import { load } from "@tauri-apps/plugin-store"
import { useEffect, useRef, useState } from "react"

import { hapticAdd, hapticDelete, hapticToggle } from "@/lib/haptics"

export type Todo = {
  id: string
  text: string
  completed: boolean
}

export type TodosState =
  | { status: "loading" }
  | { status: "ready"; todos: Todo[] }
  | { status: "error"; message: string }

export function useTodos() {
  const [state, setState] = useState<TodosState>({ status: "loading" })
  const storeRef = useRef<Store | null>(null)
  const todosRef = useRef<Todo[]>([])

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const store = await load("store.json", { autoSave: false, defaults: {} })
        if (cancelled) return
        storeRef.current = store
        const stored = await store.get<Todo[]>("todos")
        if (cancelled) return
        todosRef.current = stored ?? []
        setState({ status: "ready", todos: todosRef.current })
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        setState({ status: "error", message })
      }
    }
    void init()
    return () => {
      cancelled = true
    }
  }, [])

  async function save(next: Todo[]): Promise<boolean> {
    const store = storeRef.current
    if (!store) return false
    try {
      await store.set("todos", next)
      await store.save()
      todosRef.current = next
      setState({ status: "ready", todos: next })
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setState({ status: "error", message })
      return false
    }
  }

  async function addTodo(text: string) {
    if (!storeRef.current) return
    const trimmed = text.trim()
    if (trimmed.length === 0) return
    const next: Todo[] = [...todosRef.current, { id: crypto.randomUUID(), text: trimmed, completed: false }]
    const ok = await save(next)
    if (!ok) return
    void hapticAdd()
  }

  async function toggleTodo(id: string) {
    if (!storeRef.current) return
    const next = todosRef.current.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    const ok = await save(next)
    if (!ok) return
    void hapticToggle()
  }

  async function deleteTodo(id: string) {
    if (!storeRef.current) return
    const next = todosRef.current.filter((t) => t.id !== id)
    const ok = await save(next)
    if (!ok) return
    void hapticDelete()
  }

  return { state, addTodo, toggleTodo, deleteTodo }
}
