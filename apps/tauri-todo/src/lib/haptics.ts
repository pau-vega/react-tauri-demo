import { impactFeedback, notificationFeedback, selectionFeedback } from "@tauri-apps/plugin-haptics"

import { isTauriRuntime } from "@/lib/runtime"

export async function hapticAdd(): Promise<void> {
  if (!isTauriRuntime()) return
  try {
    await impactFeedback("medium")
  } catch {
    // Android vibration support is device-dependent (plugin docs).
    // Never break a CRUD op over a haptic failure.
  }
}

export async function hapticToggle(): Promise<void> {
  if (!isTauriRuntime()) return
  try {
    await selectionFeedback()
  } catch {
    // swallow — haptic must never break a CRUD op
  }
}

export async function hapticDelete(): Promise<void> {
  if (!isTauriRuntime()) return
  try {
    await notificationFeedback("warning")
  } catch {
    // swallow — haptic must never break a CRUD op
  }
}
