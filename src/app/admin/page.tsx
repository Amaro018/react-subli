import { invoke } from "./../blitz-server"
import getCurrentUser from "./../users/queries/getCurrentUser"
import { Sidebar } from "./components/sidebar"
import Navbar from "../components/Navbar"
import AdminCards from "./components/AdminCards"
export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)
  return (
    <div>
      <main className="flex flex-row gap-2">
        <div className="w-64 ">
          <Sidebar currentUser={currentUser} />
        </div>
        <div className="w-full p-16">
            <AdminCards />
        </div>
      </main>
    </div>
  )
}
