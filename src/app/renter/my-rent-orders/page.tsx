import { invoke } from "../../blitz-server"
import getCurrentUser from "../../users/queries/getCurrentUser"
import ErrorMessage from "../components/ErrorMessage"
import { RentList } from "../components/RentList"

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)

  if (!currentUser) {
    return <ErrorMessage message="Access denied" title="Login Required" currentUser={null} />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-xl font-medium text-gray-800">My Rentals</h1>
        <span className="text-sm text-gray-500">Manage your rental orders</span>
      </div>

      {/* Main Order List */}
      <div className="mt-2">
        <RentList currentUser={currentUser} />
      </div>
    </div>
  )
}
