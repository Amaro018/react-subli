import { invoke } from "./../blitz-server"
import getCurrentUser from "./../users/queries/getCurrentUser"
import { Sidebar } from "./components/sidebar"
import Navbar from "../components/Navbar"

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)
  return (
    <div>
      <main className="flex flex-row gap-2">
        <div className="w-64 ">
          <Sidebar currentUser={currentUser} />
        </div>
        <div className="w-full px-16">admin</div>
      </main>
    </div>
  )
}
