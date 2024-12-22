import Navbar from "../components/Navbar"
import { invoke } from "./../blitz-server"
import getCurrentUser from "./../users/queries/getCurrentUser"
import { RentList } from "./components/RentList"
import { Sidebar } from "./components/sidebar"
export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>You need to log in to access this page.</p>
      </div>
    )
  }

  if (!currentUser?.emailVerified) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Verify Your Account</h1>
          <p className="text-gray-600 mt-2">
            Please verify your email address to access this page. Check your email inbox for the
            verification link.
          </p>
        </div>
      </div>
    )
  }

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
          <RentList currentUser={currentUser} />
        </div>
      </main>
    </div>
  )
}
