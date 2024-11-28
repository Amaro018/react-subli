"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DashboardIcon from "@mui/icons-material/Dashboard"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import LockIcon from "@mui/icons-material/Lock"
import StoreIcon from "@mui/icons-material/Store"
import { useEffect, useState } from "react"

export const Sidebar = (props) => {
  const currentUser = props.currentUser
  const router = useRouter()

  const [isDropdownOpen, setDropdownOpen] = useState(false)

  // Load dropdown state from localStorage when the component mounts
  useEffect(() => {
    const savedState = localStorage.getItem("isDropdownOpen")
    if (savedState === "true") {
      setDropdownOpen(true)
    }
  }, [])

  // Save dropdown state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("isDropdownOpen", isDropdownOpen.toString())
  }, [isDropdownOpen])

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev) // Toggle dropdown visibility
  }

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
            <Link href="/renter">Profile</Link>
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
                <div className="relative">
                  <div className="flex gap-2">
                    <button onClick={toggleDropdown} className="flex gap-2">
                      <StoreIcon />
                      <p>Manage Shop</p>
                    </button>
                  </div>

                  {/* Dropdown menu */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 ">
                      <ul className="py-1">
                        <li>
                          <button className="block w-full text-left  py-2 ">Products</button>
                        </li>
                        <li>
                          <button className="block w-full text-left  py-2">View Documents</button>
                        </li>
                        <li>
                          <button className="block w-full text-left py-2">Delete Shop</button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
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
