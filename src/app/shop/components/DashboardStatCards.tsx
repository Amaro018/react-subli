import * as React from "react"
import Link from "next/link"
import InventoryIcon from "@mui/icons-material/Inventory"
import StorefrontIcon from "@mui/icons-material/Storefront"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn"

interface DashboardStatCardsProps {
  productCount: number
  pickupTodayCount: number
  deliveryTodayCount: number
  returnsTodayCount: number
}

export default function DashboardStatCards({
  productCount,
  pickupTodayCount,
  deliveryTodayCount,
  returnsTodayCount,
}: DashboardStatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Link href="/shop/products" className="block h-full">
        <div className="flex h-full items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Products</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{productCount}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <InventoryIcon />
          </div>
        </div>
      </Link>

      <Link href="/shop/orders?status=accepted" className="block h-full">
        <div className="flex h-full items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-gray-500">To Be Picked Up Today</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{pickupTodayCount}</p>
          </div>
          <div className="rounded-full bg-purple-50 p-3 text-purple-600">
            <StorefrontIcon />
          </div>
        </div>
      </Link>

      <Link href="/shop/orders?status=accepted" className="block h-full">
        <div className="flex h-full items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-gray-500">To Be Delivered Today</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{deliveryTodayCount}</p>
          </div>
          <div className="rounded-full bg-orange-50 p-3 text-orange-600">
            <LocalShippingIcon />
          </div>
        </div>
      </Link>

      <Link href="/shop/orders?status=due_today" className="block h-full">
        <div className="flex h-full items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
          <div>
            <p className="text-sm font-medium text-gray-500">To Be Returned Today</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{returnsTodayCount}</p>
          </div>
          <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
            <AssignmentReturnIcon />
          </div>
        </div>
      </Link>
    </div>
  )
}
