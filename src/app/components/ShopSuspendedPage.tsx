import React from "react"
import Link from "next/link"
import BlockIcon from "@mui/icons-material/Block"
import StorefrontIcon from "@mui/icons-material/Storefront"
import HomeIcon from "@mui/icons-material/Home"

interface ShopSuspendedPageProps {
  shopName: string
  reason?: string | null
}

const ShopSuspendedPage: React.FC<ShopSuspendedPageProps> = ({ shopName, reason }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-200 max-w-lg w-full flex flex-col items-center">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
          <BlockIcon sx={{ fontSize: 44 }} />
        </div>
        <span className="text-xs uppercase tracking-wider font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-full mb-3">
          Unavailable
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Shop Suspended</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6 leading-relaxed">
          The storefront for{" "}
          <span className="font-semibold text-gray-900">&quot;{shopName}&quot;</span> is temporarily
          unavailable or suspended from public view.
        </p>

        {reason && (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl text-left w-full">
            <span className="text-xs font-semibold text-gray-500 block mb-1">Notice:</span>
            <p className="text-xs text-gray-700">{reason}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Link
            href="/shops"
            className="inline-flex items-center justify-center gap-2 bg-[#1b2a80] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#15206b] transition-colors shadow-sm"
          >
            <StorefrontIcon fontSize="small" />
            Explore Other Shops
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
          >
            <HomeIcon fontSize="small" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ShopSuspendedPage
