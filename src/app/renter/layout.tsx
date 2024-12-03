import React from "react"
import { useAuthenticatedBlitzContext } from "../blitz-server"

export const metadata = {
  title: "Admin",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await useAuthenticatedBlitzContext({
    redirectTo: "/login",
    role: ["USER"],
    redirectAuthenticatedTo: "/",
  })
  return (
    <>
      <main className="h-[100vh]">{children}</main>
    </>
  )
}
