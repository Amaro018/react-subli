import type { ReactNode } from "react"
import { toast as sonnerToast, type ExternalToast } from "sonner"

const DEFAULT_DURATION = 4000

export const toast = Object.assign(
  (message: ReactNode, options?: ExternalToast) =>
    sonnerToast(message, { duration: DEFAULT_DURATION, ...options }),
  {
    success: (message: ReactNode, options?: ExternalToast) =>
      sonnerToast.success(message, { duration: DEFAULT_DURATION, ...options }),
    error: (message: ReactNode, options?: ExternalToast) =>
      sonnerToast.error(message, { duration: DEFAULT_DURATION, ...options }),
    info: (message: ReactNode, options?: ExternalToast) =>
      sonnerToast.info(message, { duration: DEFAULT_DURATION, ...options }),
    warning: (message: ReactNode, options?: ExternalToast) =>
      sonnerToast.warning(message, { duration: DEFAULT_DURATION, ...options }),
    loading: (message: ReactNode, options?: ExternalToast) =>
      sonnerToast.loading(message, { duration: DEFAULT_DURATION, ...options }),
    message: (message: ReactNode, options?: ExternalToast) =>
      sonnerToast.message(message, { duration: DEFAULT_DURATION, ...options }),
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  } as const
)

export default toast
