import ProductTabs from "../components/ProductTabs"

export default function ManageProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 min-h-full">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manage Products</h2>
      <ProductTabs />
      {children}
    </div>
  )
}
