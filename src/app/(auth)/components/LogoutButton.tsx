"use client"
import logout from "../mutations/logout"
import { useRouter } from "next/navigation"
import { useMutation } from "@blitzjs/rpc"

type LogoutButtonProps = {
  className?: string
}

export function LogoutButton({ className = "" }: LogoutButtonProps) {
  const router = useRouter()
  const [logoutMutation] = useMutation(logout)

  return (
    <button
      className={className}
      onClick={async () => {
        await logoutMutation()
        router.refresh()
      }}
    >
      Logout
    </button>
  )
}
