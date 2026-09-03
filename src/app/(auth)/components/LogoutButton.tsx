"use client"

import React, { useState } from "react"
import logout from "../mutations/logout"
import { useMutation } from "@blitzjs/rpc"

type LogoutButtonProps = {
  className?: string
  children?: React.ReactNode
  redirectTo?: string
  onLogout?: () => void
}

export function LogoutButton({
  className = "",
  children,
  redirectTo = "/login",
  onLogout,
}: LogoutButtonProps) {
  const [logoutMutation] = useMutation(logout)
  const [loading, setLoading] = useState(false)

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (loading) return
    setLoading(true)

    try {
      if (onLogout) onLogout()
      await logoutMutation()
    } catch (error) {
      console.error("Failed to logout:", error)
    } finally {
      window.location.href = redirectTo
    }
  }

  return (
    <button type="button" className={className} onClick={handleLogout} disabled={loading}>
      {children || "Logout"}
    </button>
  )
}
