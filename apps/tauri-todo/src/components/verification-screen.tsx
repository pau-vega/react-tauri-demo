import { invoke } from "@tauri-apps/api/core"
import { load } from "@tauri-apps/plugin-store"
import { useState } from "react"

type IpcState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string }

type StoreState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; value: string }
  | { status: "error"; message: string }

export function VerificationScreen() {
  const [name, setName] = useState("")
  const [ipcState, setIpcState] = useState<IpcState>({ status: "idle" })
  const [storeState, setStoreState] = useState<StoreState>({ status: "idle" })

  const platform = import.meta.env.TAURI_ENV_PLATFORM ?? "web"
  const tauriVersion = import.meta.env.TAURI_ENV_ARCH ?? "2.x.x"

  async function handleGreet() {
    setIpcState({ status: "loading" })
    try {
      const result = await invoke<string>("greet", { name })
      setIpcState({ status: "success", message: result })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setIpcState({ status: "error", message })
    }
  }

  async function handleStoreTest() {
    setStoreState({ status: "loading" })
    try {
      const store = await load("store.json")
      await store.set("test-key", { value: "hello from store" })
      await store.save()
      const val = await store.get<{ value: string }>("test-key")
      setStoreState({ status: "success", value: val?.value ?? "read failed" })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setStoreState({ status: "error", message })
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-12 flex flex-col items-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        <h1 className="text-xl font-semibold text-gray-900">Tauri Todo — Verification</h1>

        <section className="bg-gray-100 border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
          <p className="text-sm font-normal text-gray-900">IPC Bridge</p>
          <div className="flex gap-2">
            <input
              className="flex-1 h-10 px-3 bg-white border border-gray-200 rounded-md text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-700"
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              value={name}
            />
            <button
              className="shrink-0 h-10 px-4 bg-blue-700 text-white text-sm font-normal rounded-md active:opacity-90 disabled:opacity-50"
              disabled={ipcState.status === "loading"}
              onClick={handleGreet}
            >
              {ipcState.status === "loading" ? "Sending..." : "Send Greeting"}
            </button>
          </div>
          <p className="text-base text-gray-900">
            {ipcState.status === "idle" && <span className="text-gray-500">— awaiting response —</span>}
            {ipcState.status === "loading" && <span className="text-gray-500">— awaiting response —</span>}
            {ipcState.status === "success" && <span className="text-green-600">{ipcState.message}</span>}
            {ipcState.status === "error" && (
              <span className="text-red-600">IPC error: {ipcState.message}. Check logcat.</span>
            )}
          </p>
        </section>

        <section className="bg-gray-100 border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
          <p className="text-sm font-normal text-gray-900">Store Plugin</p>
          <button
            className="h-10 px-4 bg-blue-700 text-white text-sm font-normal rounded-md active:opacity-90 disabled:opacity-50 self-start"
            disabled={storeState.status === "loading"}
            onClick={handleStoreTest}
          >
            {storeState.status === "loading" ? "Testing..." : "Test Store"}
          </button>
          <p className="text-base text-gray-900">
            {storeState.status === "idle" && <span className="text-gray-500">— not tested —</span>}
            {storeState.status === "loading" && <span className="text-gray-500">— not tested —</span>}
            {storeState.status === "success" && (
              <span className="text-green-600">Write OK / Read OK — {storeState.value}</span>
            )}
            {storeState.status === "error" && (
              <span className="text-red-600">Store error: {storeState.message}. Check capabilities.</span>
            )}
          </p>
        </section>

        <section className="bg-gray-100 border border-gray-200 rounded-lg p-6 flex flex-col gap-4">
          <p className="text-sm font-normal text-gray-900">Environment</p>
          <p className="text-base text-gray-500">Tauri: {tauriVersion}</p>
          <p className="text-base text-gray-500">React: 19.x.x</p>
          <p className="text-base text-gray-500">Platform: {platform}</p>
        </section>
      </div>
    </main>
  )
}
