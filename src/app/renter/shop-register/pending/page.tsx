import { invoke } from "./../../../blitz-server"
import getCurrentUser from "../../../users/queries/getCurrentUser"
import { ShopPendingRegistration } from "../../components/ShopPendingRegistration"

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-xl font-medium text-gray-800">Shop Registration Status</h1>
        <span className="text-sm text-gray-500">Check the status of your shop registration</span>
      </div>

      <ShopPendingRegistration currentUser={currentUser} />
    </div>
  )
}
