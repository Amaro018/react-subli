import { invoke } from "../../blitz-server"
import getCurrentUser from "../../users/queries/getCurrentUser"
import SavedItems from "../components/SavedItems" // Adjust path to SavedItems relative to page.tsx

export default async function Page() {
  const currentUser = await invoke(getCurrentUser, null)

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1400px] mx-auto w-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Items</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage equipment and items saved for future rental bookings.
          </p>
        </div>
      </div>

      {/* Saved Items Component */}
      <SavedItems />
    </div>
  )
}
