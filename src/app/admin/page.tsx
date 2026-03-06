import { invoke } from "./../blitz-server"
import getCurrentUser from "./../users/queries/getCurrentUser"
import DashboardLayout from "./components/AdminLayoutClient"
import AdminCards from "./components/AdminCards"
import AdminCharts from "./components/AdminCharts"
import getAdminStats from "../queries/getAdminStats"

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)
  const stats = await invoke(getAdminStats, null)
  return (
    <DashboardLayout currentUser={currentUser}>
      <AdminCards stats={stats} />
      <AdminCharts />
    </DashboardLayout>
  )
}
