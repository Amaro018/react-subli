"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import DashboardIcon from "@mui/icons-material/Dashboard"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import Image from "next/image"
import InventoryIcon from "@mui/icons-material/Inventory"
import LogoutIcon from "@mui/icons-material/Logout"
import CloseIcon from "@mui/icons-material/Close"
import ExpandLess from "@mui/icons-material/ExpandLess"
import ExpandMore from "@mui/icons-material/ExpandMore"
import ReceiptIcon from "@mui/icons-material/Receipt"
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount"
import { LogoutButton } from "../../(auth)/components/LogoutButton"
import { useState } from "react"
import { Tooltip } from "@mui/material"

interface SidebarProps {
  currentUser: any
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isCollapsed: boolean
}

export const Sidebar = ({ currentUser, isOpen, setIsOpen, isCollapsed }: SidebarProps) => {
  const pathname = usePathname()
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden ${
          isOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 bg-[#111b52] flex flex-col transition-all duration-300 transform lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isCollapsed ? "lg:w-20 w-64" : "w-64"}`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-center h-16 bg-black/20 relative">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold text-white">
                S
              </span>
              <span
                className={`text-white text-2xl font-semibold uppercase ${
                  isCollapsed ? "lg:hidden" : ""
                }`}
              >
                Subli
              </span>
            </div>
            <button
              className="absolute right-4 text-white lg:hidden"
              onClick={() => setIsOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <Link
            href={"/shop/settings" as any}
            onClick={() => setIsOpen(false)}
            className="block mt-4 p-2 rounded-md hover:bg-white/10"
          >
            <div className="flex flex-col items-center">
              <div
                className={`relative transition-all duration-300 ${
                  isCollapsed ? "lg:w-8 lg:h-8 w-12 h-12" : "w-12 h-12"
                }`}
              >
                <Image
                  src={
                    currentUser?.shop?.imageProfile
                      ? `/uploads/shop-profile/${currentUser.shop.imageProfile}`
                      : "/uploads/shop-profile/default.png"
                  }
                  alt="Shop Profile"
                  fill
                  className="rounded-full border-2 border-white object-cover"
                />
              </div>
              <div className={`mt-2 text-center ${isCollapsed ? "lg:hidden" : ""}`}>
                <h4 className="font-medium text-white text-sm">
                  {currentUser?.shop?.shopName || "Shop"}
                </h4>
                <p className="text-xs text-gray-300">{currentUser?.shop?.email}</p>
              </div>
            </div>
          </Link>

          <nav className="flex-1 mt-5 px-2 overflow-y-auto scrollbar-sidebar">
            <Link
              href="/shop"
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 ${
                isCollapsed ? "lg:justify-center" : ""
              } ${pathname === "/shop" ? "bg-white/20" : ""}`}
            >
              <DashboardIcon className="w-6 h-6" />
              <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Dashboard</span>
            </Link>

            <div>
              <button
                onClick={() => !isCollapsed && toggleMenu("products")}
                className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 w-full ${
                  isCollapsed ? "lg:justify-center" : "justify-between"
                } ${
                  pathname?.startsWith("/shop/products") || pathname?.startsWith("/shop/inventory")
                    ? "bg-white/20"
                    : ""
                }`}
              >
                <div className="flex items-center">
                  <InventoryIcon className="w-6 h-6" />
                  <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Products</span>
                </div>
                {!isCollapsed && (openMenu === "products" ? <ExpandLess /> : <ExpandMore />)}
              </button>
              <div
                className={`${
                  openMenu === "products" && !isCollapsed ? "block" : "hidden"
                } bg-black/10 rounded-md mt-1`}
              >
                <Link
                  href="/shop/products"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2 pl-12 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                >
                  All Products
                </Link>
                <Link
                  href={"/shop/products/add" as any}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2 pl-12 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                >
                  Add Product
                </Link>
                <Link
                  href={"/shop/inventory" as any}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2 pl-12 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                >
                  Inventory
                </Link>
                <Link
                  href={"/shop/products/reported" as any}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2 pl-12 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                >
                  Reported Products
                </Link>
              </div>
            </div>

            <div>
              <button
                onClick={() => !isCollapsed && toggleMenu("orders")}
                className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 w-full ${
                  isCollapsed ? "lg:justify-center" : "justify-between"
                } ${pathname?.startsWith("/shop/orders") ? "bg-white/20" : ""}`}
              >
                <div className="flex items-center">
                  <ShoppingBagIcon className="w-6 h-6" />
                  <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Rent Orders</span>
                </div>
                {!isCollapsed && (openMenu === "orders" ? <ExpandLess /> : <ExpandMore />)}
              </button>
              <div
                className={`${
                  openMenu === "orders" && !isCollapsed ? "block" : "hidden"
                } bg-black/10 rounded-md mt-1`}
              >
                <Link
                  href="/shop/orders"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2 pl-12 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                >
                  All Orders
                </Link>
                <Link
                  href={"/shop/orders/history" as any}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2 pl-12 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                >
                  History
                </Link>
              </div>
            </div>

            <div>
              <button
                onClick={() => !isCollapsed && toggleMenu("billings")}
                className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 w-full ${
                  isCollapsed ? "lg:justify-center" : "justify-between"
                } ${pathname?.startsWith("/shop/billings") ? "bg-white/20" : ""}`}
              >
                <div className="flex items-center">
                  <ReceiptIcon className="w-6 h-6" />
                  <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Billings</span>
                </div>
                {!isCollapsed && (openMenu === "billings" ? <ExpandLess /> : <ExpandMore />)}
              </button>
              <div
                className={`${
                  openMenu === "billings" && !isCollapsed ? "block" : "hidden"
                } bg-black/10 rounded-md mt-1`}
              >
                <Link
                  href={"/shop/billings" as any}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2 pl-12 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                >
                  Invoices
                </Link>
                <Link
                  href={"/shop/billings/settings" as any}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center px-4 py-2 pl-12 text-sm text-gray-300 hover:text-white hover:bg-white/5"
                >
                  Settings
                </Link>
              </div>
            </div>

            <Tooltip title={isCollapsed ? "Switch to Renter" : ""} placement="right">
              <Link
                href={"/" as any}
                className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 ${
                  isCollapsed ? "lg:justify-center" : ""
                }`}
                onClick={() => setIsOpen(false)}
              >
                <SwitchAccountIcon className="w-6 h-6" />
                <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Switch to Renter</span>
              </Link>
            </Tooltip>
          </nav>
        </div>

        <div className="p-2 border-t border-white/10">
          <div
            className={`relative flex items-center px-4 py-2 text-gray-100 rounded-md hover:bg-white/10 cursor-pointer ${
              isCollapsed ? "lg:justify-center" : ""
            }`}
            onClick={() => setIsOpen(false)}
          >
            <LogoutIcon className="w-6 h-6" />
            <div className={`mx-3 w-full ${isCollapsed ? "lg:hidden" : ""}`}>
              <LogoutButton />
            </div>
            <div
              className={`absolute inset-0 opacity-0 ${isCollapsed ? "lg:block" : "hidden"} hidden`}
            >
              <LogoutButton className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
