"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DashboardIcon from "@mui/icons-material/Dashboard"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import LockIcon from "@mui/icons-material/Lock"
import StoreIcon from "@mui/icons-material/Store"
import Image from "next/image"

export const Sidebar = (props: { currentUser: any }) => {
  const currentUser = props.currentUser
  const router = useRouter()

  return (
    <div className="fixed top-30 left-0 h-screen w-48 bg-gray-800 p-4 z-40">
      <ul className="flex flex-col gap-4">
        <li className="py-4">
          <div className="flex flex-col justify-center items-center">
            <Image
              src={`/uploads/shop-profile/${currentUser.shop.imageProfile}`}
              alt=""
              width={200}
              height={200}
              className="rounded-full"
            />
            <p className="text-white underline">view profile</p>
          </div>
        </li>
        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <div className="flex gap-2 ">
            <DashboardIcon />
            <Link href="/shop">Dashboard</Link>
          </div>
        </li>
        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <div className="flex gap-2 ">
            <ShoppingBagIcon />
            <Link href="/shop/products">Products</Link>
          </div>
        </li>

        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <div className="flex gap-2 ">
            <AccountCircleIcon />
            <Link href="/renter">Go Renter</Link>
          </div>
        </li>
      </ul>
    </div>
  )
}
