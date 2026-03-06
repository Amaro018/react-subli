import { invoke } from "../blitz-server"
import getCurrentUser from "../users/queries/getCurrentUser"
import { redirect } from "next/navigation"
import RenterLayoutClient from "./components/RenterLayoutClient"

export default async function RenterLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await invoke(getCurrentUser, null)

  if (!currentUser) {
    redirect("/login")
  }

  return <RenterLayoutClient currentUser={currentUser}>{children}</RenterLayoutClient>
}
