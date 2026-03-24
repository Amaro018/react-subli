"use client"
import logout from "../mutations/logout"
import { useRouter } from "next/navigation"
import { useMutation } from "@blitzjs/rpc"

type LogoutButtonProps = {
  className?: string
  onLogout?: () => void
}

export function LogoutButton({ className = "", onLogout }: LogoutButtonProps) {
  const router = useRouter()
  const [logoutMutation] = useMutation(logout)

  return (
    <button
      className={className}
      onClick={async () => {
        if (onLogout) onLogout()
        await logoutMutation()
        router.refresh()
      }}
    >
      Logout
    </button>
  )
}
