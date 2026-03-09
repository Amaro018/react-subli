import ShopTabs from "../components/ShopTabs"

export default function ManageShopsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Manage Shops</h2>
      <ShopTabs />
      {children}
    </div>
  )
}
