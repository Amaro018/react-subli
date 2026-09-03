import type { ReactNode } from "react"
import { toast as sonnerToast, type ExternalToast } from "sonner"

type ToastType = "success" | "error" | "info" | "warning" | "message" | "loading"

type ToastMethod = Exclude<ToastType, "message"> | "message"

const dedupeMap = new Map<string, string | number>()

const makeToastKey = (type: ToastType, message: unknown, options?: ExternalToast) => {
  const explicitId = options?.id
  const idSeed =
    explicitId !== undefined ? `id:${String(explicitId)}` : `message:${String(message)}`
  return `${type}:${idSeed}`
}

const showDedupedToast = (type: ToastType, message: ReactNode, options?: ExternalToast) => {
  const key = makeToastKey(type, message, options)
  const existingId = dedupeMap.get(key)

  if (existingId) {
    sonnerToast.dismiss(existingId)
  }

  const method = sonnerToast[type] as (msg: ReactNode, opts?: ExternalToast) => string | number

  const newId = method(message, {
    ...options,
    duration: options?.duration ?? 4000,
  })

  dedupeMap.set(key, newId)
  return newId
}

const dismiss = (id?: string | number) => {
  if (id !== undefined) {
    dedupeMap.forEach((value, key) => {
      if (value === id) {
        dedupeMap.delete(key)
      }
    })
  }

  sonnerToast.dismiss(id)
}

export const toast = Object.assign(
  (message: ReactNode, options?: ExternalToast) => showDedupedToast("message", message, options),
  {
    success: (message: ReactNode, options?: ExternalToast) =>
      showDedupedToast("success", message, options),
    error: (message: ReactNode, options?: ExternalToast) =>
      showDedupedToast("error", message, options),
    info: (message: ReactNode, options?: ExternalToast) =>
      showDedupedToast("info", message, options),
    warning: (message: ReactNode, options?: ExternalToast) =>
      showDedupedToast("warning", message, options),
    loading: (message: ReactNode, options?: ExternalToast) =>
      showDedupedToast("loading", message, options),
    message: (message: ReactNode, options?: ExternalToast) =>
      showDedupedToast("message", message, options),
    dismiss,
  } as const
)

export default toast
