"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DashboardIcon from "@mui/icons-material/Dashboard"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import LockIcon from "@mui/icons-material/Lock"
import StoreIcon from "@mui/icons-material/Store"

export const Sidebar = (props: any) => {
  const currentUser = props.currentUser
  const router = useRouter()

  const handleClick = () => {
    alert(" is logged in" + currentUser.shop.shopName)
  }

  return (
    <div className="fixed top-30 left-0 h-screen w-48 bg-gray-800 p-4 z-50">
      <ul className="flex flex-col gap-4">
        <li className="py-4">logo</li>
        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <div className="flex gap-2 ">
            <DashboardIcon />
            <Link href="/renter">Dashboard</Link>
          </div>
        </li>
        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <div className="flex gap-2 ">
            <ShoppingBagIcon />
            <Link href="/renter">Orders</Link>
          </div>
        </li>

        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <div className="flex gap-2 ">
            <AccountCircleIcon />
            <Link href="/renter/renter-profile">Profile</Link>
          </div>
        </li>
        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          {currentUser.isShopRegistered ? (
            <div className="flex gap-2">
              {currentUser.shop.status === "pending" ? (
                <div className="flex gap-2">
                  <LockIcon />
                  <button disabled className="cursor-not-allowed">
                    Shop
                  </button>
                </div>
              ) : (
                <Link href={"/shop"}>
                  <div className="flex gap-2">
                    <StoreIcon />
                    <p>My Shop</p>
                  </div>
                </Link>
              )}
            </div>
          ) : (
            <div>
              <Link href="/renter/shop-register">Shop Register</Link>
            </div>
          )}
        </li>
      </ul>
    </div>
  )
}
