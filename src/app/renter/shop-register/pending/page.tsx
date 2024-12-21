import Navbar from "../../../components/Navbar"
import { invoke } from "./../../../blitz-server"
import getCurrentUser from "../../../users/queries/getCurrentUser"

import { Sidebar } from "../../components/sidebar"
import { ShopPendingRegistration } from "../../components/ShopPendingRegistration"
export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)

  console.log(currentUser)

  return (
    <div>
      <div className="mb-4">
        <Navbar currentUser={currentUser} />
      </div>
      <main className="flex flex-row gap-2">
        <div className="w-64 ">
          <Sidebar currentUser={currentUser} />
        </div>
        <div className="p-16 mt-8 w-full">
          <ShopPendingRegistration currentUser={currentUser} />
        </div>
      </main>
    </div>
  )
}
