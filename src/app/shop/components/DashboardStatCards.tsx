import * as React from "react"
import Link from "next/link"
import InventoryIcon from "@mui/icons-material/Inventory"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import Inventory2Icon from "@mui/icons-material/Inventory2"
import PendingIcon from "@mui/icons-material/Pending"

interface DashboardStatCardsProps {
  productCount: number
  orderedItems: number
  renderedItems: number
  pendingItems: number
}

export default function DashboardStatCards({
  productCount,
  orderedItems,
  renderedItems,
  pendingItems,
}: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
      <Link href="/shop/products" className="block h-full">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md h-full cursor-pointer">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{productCount}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <InventoryIcon />
          </div>
        </div>
      </Link>

      <Link href="/shop/orders" className="block h-full">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md h-full cursor-pointer">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{orderedItems}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-full text-purple-600">
            <ShoppingBagIcon />
          </div>
        </div>
      </Link>

      <Link href={"/shop/inventory" as any} className="block h-full">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md h-full cursor-pointer">
          <div>
            <p className="text-sm font-medium text-gray-500">On Hand</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{renderedItems}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-full text-orange-600">
            <Inventory2Icon />
          </div>
        </div>
      </Link>

      <Link href="/shop/orders" className="block h-full">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md h-full cursor-pointer">
          <div>
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{pendingItems}</p>
          </div>
          <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
            <PendingIcon />
          </div>
        </div>
      </Link>
    </div>
  )
}
