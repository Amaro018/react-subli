import React from "react"
import { invoke } from "../blitz-server"
import getCurrentUser from "../users/queries/getCurrentUser"
import { redirect } from "next/navigation"
import { useAuthenticatedBlitzContext } from "../blitz-server"
import ShopLayoutClient from "./components/ShopLayoutClient"

export const metadata = {
  title: "Shop",
}

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await invoke(getCurrentUser, null)

  if (!currentUser) redirect("/login")

  // If NOT in shop mode, redirect back to renter dashboard
  if (!currentUser.isShopMode) {
    redirect("/renter")
  }

  return <ShopLayoutClient currentUser={currentUser}>{children}</ShopLayoutClient>
}
