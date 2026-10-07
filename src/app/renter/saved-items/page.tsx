import SavedItems from "../components/SavedItems"

export default function Page() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <h1 className="text-xl font-medium text-gray-800">Saved Items</h1>
        <span className="text-sm text-gray-500">Manage items saved for future rentals</span>
      </div>

      <div className="mt-2">
        <SavedItems />
      </div>
    </div>
  )
}
