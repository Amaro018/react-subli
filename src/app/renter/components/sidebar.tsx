"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"

export const Sidebar = () => {
  const router = useRouter()

  return (
    <div className="fixed top-30 left-0 h-screen w-48 bg-gray-800 p-4 z-50">
      <ul className="space-y-2">
        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <Link href="/renter">Dashboard</Link>
        </li>
        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <Link href="/renter/search">Orders</Link>
        </li>

        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <Link href="/renter/profile">Profile</Link>
        </li>
        <li className="text-white border-b border-slate-500 hover:border-slate-400">
          <Link href="/renter/profile">Register Shop</Link>
        </li>
      </ul>
    </div>
  )
}
