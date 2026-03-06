import { invoke } from "../blitz-server"
import getCurrentUser from "../users/queries/getCurrentUser"
import AdminLayoutClient from "./components/AdminLayoutClient"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await invoke(getCurrentUser, null)

  if (!currentUser || currentUser.role !== "ADMIN") {
    redirect("/")
  }

  return <AdminLayoutClient currentUser={currentUser}>{children}</AdminLayoutClient>
}
