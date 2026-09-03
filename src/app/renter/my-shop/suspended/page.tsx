import { invoke } from "./../../../blitz-server"
import getCurrentUser from "../../../users/queries/getCurrentUser"
import ShopSuspendedView from "../../components/ShopSuspendedView"

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)

  if (!currentUser?.shop) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-xl font-medium text-gray-800">Shop Status</h1>
          <span className="text-sm text-gray-500">Your shop account status and review updates</span>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600 shadow-sm">
          Shop details are not available.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-xl font-medium text-gray-800">Shop Status</h1>
        <span className="text-sm text-gray-500">Your shop account status and review updates</span>
      </div>

      <ShopSuspendedView shop={currentUser.shop} />
    </div>
  )
}
