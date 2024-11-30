import React from "react"
import { useAuthenticatedBlitzContext } from "../blitz-server"

export const metadata = {
  title: "Shop",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await useAuthenticatedBlitzContext({
    redirectTo: "/login",
    role: ["USER"],
    redirectAuthenticatedTo: "/shop",
  })
  return <>{children}</>
}
