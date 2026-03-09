import { invoke } from "./../blitz-server"
import AdminCards from "./components/AdminCards"
import AdminCharts from "./components/AdminCharts"
import getAdminStats from "../queries/getAdminStats"

export default async function Page() {
  const stats = await invoke(getAdminStats, null)
  return (
    <>
      <AdminCards stats={stats} />
      <AdminCharts />
    </>
  )
}
