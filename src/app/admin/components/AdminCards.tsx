import React from "react"
import Link from "next/link"
import PeopleIcon from "@mui/icons-material/People"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import StoreIcon from "@mui/icons-material/Store"
import InventoryIcon from "@mui/icons-material/Inventory"
import ReportProblemIcon from "@mui/icons-material/ReportProblem"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import CancelIcon from "@mui/icons-material/Cancel"

interface AdminCardsProps {
  stats: {
    totalShops: number
    pendingShops: number
    rejectedShops: number
    reportedShops: number
    totalProducts: number
    reportedProducts: number
    totalOrders: number
    totalUsers: number
  }
}

const AdminCards = ({ stats }: AdminCardsProps) => {
  const cards = [
    {
      title: "Total Shops",
      value: stats.totalShops,
      icon: <StoreIcon className="w-6 h-6 text-white" />,
      color: "bg-blue-500",
      href: "/admin/manage-shops",
    },
    {
      title: "Pending Shops",
      value: stats.pendingShops,
      icon: <HourglassEmptyIcon className="w-6 h-6 text-white" />,
      color: "bg-yellow-500",
      href: "/admin/manage-shops/pending",
    },
    {
      title: "Rejected Shops",
      value: stats.rejectedShops,
      icon: <CancelIcon className="w-6 h-6 text-white" />,
      color: "bg-red-500",
      href: "/admin/manage-shops/rejected",
    },
    {
      title: "Reported Shops",
      value: stats.reportedShops,
      icon: <ReportProblemIcon className="w-6 h-6 text-white" />,
      color: "bg-orange-600",
      href: "/admin/manage-shops/reported",
    },
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: <InventoryIcon className="w-6 h-6 text-white" />,
      color: "bg-orange-500",
      href: "/admin/products",
    },
    {
      title: "Reported Products",
      value: stats.reportedProducts,
      icon: <ReportProblemIcon className="w-6 h-6 text-white" />,
      color: "bg-red-600",
      href: "/admin/products/reported",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: <ReceiptLongIcon className="w-6 h-6 text-white" />,
      color: "bg-green-500",
      href: "/admin/orders",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: <PeopleIcon className="w-6 h-6 text-white" />,
      color: "bg-purple-500",
      href: "/admin/users",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => (
        <Link href={card.href as any} key={index} className="block group">
          <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-gray-100 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`rounded-full p-3 shadow-sm ${card.color}`}>{card.icon}</div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default AdminCards
