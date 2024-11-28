import { invoke } from "./../../blitz-server"
import getCurrentUser from "./../../users/queries/getCurrentUser"
import { Sidebar } from "./../components/sidebar"
import Navbar from "./../../components/Navbar"
import ShopList from "../components/shoplist"

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)
  return (
    <div className="w-full">
      <Navbar currentUser={currentUser} />
      <main className="flex flex-row gap-2 ">
        <div className="w-64 ">
          <Sidebar currentUser={currentUser} />
        </div>
        <div className="py-24 w-full px-8">
          <ShopList />
        </div>
      </main>
    </div>
  )
}
