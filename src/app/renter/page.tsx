import Navbar from "../components/Navbar"
import { invoke } from "./../blitz-server"
import getCurrentUser from "./../users/queries/getCurrentUser"
import { Sidebar } from "./components/sidebar"
export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)
  return (
    <div>
      <Navbar currentUser={currentUser} />
      <main className="flex flex-row gap-2">
        <div className="w-64 ">
          <Sidebar />
        </div>
        <div className="p-16">
          <h1>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis repellendus et hic
            doloribus nulla ipsam optio quibusdam similique molestias enim? Quidem doloremque, nobis
            itaque nulla provident iure totam iusto nemo.
          </h1>
        </div>
      </main>
    </div>
  )
}
