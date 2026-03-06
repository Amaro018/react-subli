"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import DashboardIcon from "@mui/icons-material/Dashboard"
import StoreIcon from "@mui/icons-material/Store"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import { LogoutButton } from "../../(auth)/components/LogoutButton"
import LogoutIcon from "@mui/icons-material/Logout"
import CloseIcon from "@mui/icons-material/Close"
import PeopleIcon from "@mui/icons-material/People"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import SettingsIcon from "@mui/icons-material/Settings"
import InventoryIcon from "@mui/icons-material/Inventory"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

interface SidebarProps {
  currentUser: any
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isCollapsed: boolean
}

export const Sidebar = ({ currentUser, isOpen, setIsOpen, isCollapsed }: SidebarProps) => {
  const pathname = usePathname()
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({
    shops: pathname?.startsWith("/admin/manage-shops") || false,
    products: pathname?.startsWith("/admin/products") || false,
  })

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }))
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

          <div className="flex flex-col items-center mt-4">
            <div
              className={`relative transition-all duration-300 ${
                isCollapsed ? "lg:w-8 lg:h-8 w-12 h-12" : "w-12 h-12"
              }`}
            >
              <Image
                src={
                  currentUser?.profileImage
                    ? `/uploads/renter-profile/${currentUser.profileImage}`
                    : "/uploads/renter-profile/default.png"
                }
                alt="Profile"
                fill
                className="rounded-full border-2 border-white object-cover"
              />
            </div>
            <div className={`mt-2 text-center ${isCollapsed ? "lg:hidden" : ""}`}>
              <h4 className="font-medium text-white text-sm">
                {currentUser?.personalInfo?.firstName || "Admin"}
              </h4>
              <p className="text-xs text-gray-300">{currentUser?.email}</p>
            </div>
          </div>

          <nav className="flex-1 mt-5 px-2 overflow-y-auto scrollbar-sidebar">
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 ${
                isCollapsed ? "lg:justify-center" : ""
              } ${pathname === "/admin" ? "bg-white/20" : ""}`}
            >
              <DashboardIcon className="w-6 h-6" />
              <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Dashboard</span>
            </Link>

            {/* Shops Dropdown */}
            <div className="mt-2">
              {isCollapsed ? (
                <Link
                  href="/admin/manage-shops"
                  className={`flex items-center px-4 py-2 text-gray-100 rounded-md hover:bg-white/10 lg:justify-center ${
                    pathname?.startsWith("/admin/manage-shops") ? "bg-white/20" : ""
                  }`}
                >
                  <StoreIcon className="w-6 h-6" />
                </Link>
              ) : (
                <>
                  <div
                    onClick={() => toggleSubmenu("shops")}
                    className={`flex items-center justify-between px-4 py-2 text-gray-100 rounded-md hover:bg-white/10 cursor-pointer ${
                      pathname?.startsWith("/admin/manage-shops") ? "bg-white/20" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <StoreIcon className="w-6 h-6" />
                      <span className="mx-3">Shops</span>
                    </div>
                    <ExpandMoreIcon
                      className={`w-5 h-5 transition-transform ${
                        openSubmenus["shops"] ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  <div className={`${openSubmenus["shops"] ? "block" : "hidden"} bg-black/20`}>
                    <Link
                      href="/admin/manage-shops"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center pl-14 pr-4 py-2 text-sm hover:text-white hover:bg-white/5 ${
                        pathname === "/admin/manage-shops"
                          ? "text-white bg-white/10"
                          : "text-gray-300"
                      }`}
                    >
                      Approved Shops
                    </Link>
                    <Link
                      href="/admin/manage-shops/pending"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center pl-14 pr-4 py-2 text-sm hover:text-white hover:bg-white/5 ${
                        pathname === "/admin/manage-shops/pending"
                          ? "text-white bg-white/10"
                          : "text-gray-300"
                      }`}
                    >
                      Pending Shops
                    </Link>
                    <Link
                      href={"/admin/manage-shops/rejected" as any}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center pl-14 pr-4 py-2 text-sm hover:text-white hover:bg-white/5 ${
                        pathname === "/admin/manage-shops/rejected"
                          ? "text-white bg-white/10"
                          : "text-gray-300"
                      }`}
                    >
                      Rejected Shops
                    </Link>
                    <Link
                      href={"/admin/manage-shops/reported" as any}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center pl-14 pr-4 py-2 text-sm hover:text-white hover:bg-white/5 ${
                        pathname === "/admin/manage-shops/reported"
                          ? "text-white bg-white/10"
                          : "text-gray-300"
                      }`}
                    >
                      Reported Shops
                    </Link>
                    <Link
                      href={"/admin/manage-shops/banned" as any}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center pl-14 pr-4 py-2 text-sm hover:text-white hover:bg-white/5 ${
                        pathname === "/admin/manage-shops/banned"
                          ? "text-white bg-white/10"
                          : "text-gray-300"
                      }`}
                    >
                      Banned Shops
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Products Dropdown */}
            <div className="mt-2">
              {isCollapsed ? (
                <Link
                  href={"/admin/products" as any}
                  className={`flex items-center px-4 py-2 text-gray-100 rounded-md hover:bg-white/10 lg:justify-center ${
                    pathname?.startsWith("/admin/products") ? "bg-white/20" : ""
                  }`}
                >
                  <InventoryIcon className="w-6 h-6" />
                </Link>
              ) : (
                <>
                  <div
                    onClick={() => toggleSubmenu("products")}
                    className={`flex items-center justify-between px-4 py-2 text-gray-100 rounded-md hover:bg-white/10 cursor-pointer ${
                      pathname?.startsWith("/admin/products") ? "bg-white/20" : ""
                    }`}
                  >
                    <div className="flex items-center">
                      <InventoryIcon className="w-6 h-6" />
                      <span className="mx-3">Products</span>
                    </div>
                    <ExpandMoreIcon
                      className={`w-5 h-5 transition-transform ${
                        openSubmenus["products"] ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  <div className={`${openSubmenus["products"] ? "block" : "hidden"} bg-black/20`}>
                    <Link
                      href={"/admin/products" as any}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center pl-14 pr-4 py-2 text-sm hover:text-white hover:bg-white/5 ${
                        pathname === "/admin/products" ? "text-white bg-white/10" : "text-gray-300"
                      }`}
                    >
                      All Products
                    </Link>
                    <Link
                      href={"/admin/products/reported" as any}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center pl-14 pr-4 py-2 text-sm hover:text-white hover:bg-white/5 ${
                        pathname === "/admin/products/reported"
                          ? "text-white bg-white/10"
                          : "text-gray-300"
                      }`}
                    >
                      Reported Products
                    </Link>
                    <Link
                      href={"/admin/products/banned" as any}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center pl-14 pr-4 py-2 text-sm hover:text-white hover:bg-white/5 ${
                        pathname === "/admin/products/banned"
                          ? "text-white bg-white/10"
                          : "text-gray-300"
                      }`}
                    >
                      Banned Products
                    </Link>
                  </div>
                </>
              )}
            </div>

            <Link
              href={"/admin/orders" as any}
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 ${
                isCollapsed ? "lg:justify-center" : ""
              } ${pathname?.startsWith("/admin/orders") ? "bg-white/20" : ""}`}
            >
              <ReceiptLongIcon className="w-6 h-6" />
              <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Orders</span>
            </Link>

            <Link
              href={"/admin/users" as any}
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 ${
                isCollapsed ? "lg:justify-center" : ""
              } ${pathname?.startsWith("/admin/users") ? "bg-white/20" : ""}`}
            >
              <PeopleIcon className="w-6 h-6" />
              <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Users</span>
            </Link>

            <Link
              href={"/admin/settings" as any}
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 ${
                isCollapsed ? "lg:justify-center" : ""
              } ${pathname === "/admin/settings" ? "bg-white/20" : ""}`}
            >
              <SettingsIcon className="w-6 h-6" />
              <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Settings</span>
            </Link>

            <Link
              href={"/renter" as any}
              onClick={() => setIsOpen(false)}
              className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 ${
                isCollapsed ? "lg:justify-center" : ""
              } ${pathname === "/renter" ? "bg-white/20" : ""}`}
            >
              <AccountCircleIcon className="w-6 h-6" />
              <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Profile</span>
            </Link>
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
