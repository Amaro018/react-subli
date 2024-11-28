"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DashboardIcon from "@mui/icons-material/Dashboard"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import LockIcon from "@mui/icons-material/Lock"
import StoreIcon from "@mui/icons-material/Store"

export const Sidebar = (props: { currentUser: any }) => {
  const currentUser = props.currentUser
  const router = useRouter()

  return (
    <div className="fixed top-30 left-0 h-screen w-48 bg-gray-800 p-4 z-50">
      <ul className="flex flex-col gap-4">
        <li className="py-4">logo</li>
        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <div className="flex gap-2 ">
            <DashboardIcon />
            <Link href="/admin">Dashboard</Link>
          </div>
        </li>
        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <div className="flex gap-2 ">
            <ShoppingBagIcon />
            <Link href="/admin/manage-shop">Manage Shop</Link>
          </div>
        </li>

        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <div className="flex gap-2 ">
            <AccountCircleIcon />
            <Link href="/renter">Profile</Link>
          </div>
        </li>
      </ul>
    </div>
  )
}
