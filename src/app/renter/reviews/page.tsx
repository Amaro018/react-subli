import { invoke } from "../../blitz-server"
import getCurrentUser from "../../users/queries/getCurrentUser"
import ErrorMessage from "../components/ErrorMessage"
import { ReviewList } from "../components/ReviewList"

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)

  if (!currentUser) {
    return <ErrorMessage message="Access denied" title="Login Required" currentUser={null} />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-xl font-medium text-gray-800">My Reviews</h1>
        <span className="text-sm text-gray-500">Manage your reviews</span>
      </div>

      {/* Main Review List */}
      <div className="mt-2">
        <ReviewList currentUser={currentUser} />
      </div>
    </div>
  )
}
