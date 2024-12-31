import Navbar from "../components/Navbar"
import { invoke } from "./../blitz-server"
import getCurrentUser from "./../users/queries/getCurrentUser"
import ErrorMessage from "./components/ErrorMessage"
import { RentList } from "./components/RentList"
import { Sidebar } from "./components/sidebar"
export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)

  if (!currentUser) {
    return <ErrorMessage message="You need to login to access this page." title="Access denied" />
  }

  if (!currentUser?.emailVerified) {
    return (
      <ErrorMessage
        message="You need to verify your email to access this page."
        title="Email not verified"
      />
    )
  }

  return (
    <div>
      <div className="fixed mb-4 z-50">
        <Navbar currentUser={currentUser} />
      </div>
      <main className="flex flex-row gap-2">
        <div className="w-64 ">
          <div className="relative z-0">
            <Sidebar currentUser={currentUser} />
          </div>
        </div>
        <div className="p-16 mt-8 w-full">
          <RentList currentUser={currentUser} />
        </div>
      </main>
    </div>
  )
}
