"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import DashboardIcon from "@mui/icons-material/Dashboard"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import Image from "next/image"
import InventoryIcon from "@mui/icons-material/Inventory"
import LogoutIcon from "@mui/icons-material/Logout"
import CloseIcon from "@mui/icons-material/Close"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ReceiptIcon from "@mui/icons-material/Receipt"
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount"
import { LogoutButton } from "../../(auth)/components/LogoutButton"
import { useState, useEffect } from "react"
import { Tooltip } from "@mui/material"

interface SidebarProps {
  currentUser: any
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isCollapsed: boolean
}

const SidebarDropdown = ({
  title,
  icon,
  basePaths,
  submenuKey,
  isOpen,
  onToggle,
  isCollapsed,
  items,
  pathname,
  handleNavigation,
}: {
  title: string
  icon: React.ReactNode
  basePaths: string[]
  submenuKey: string
  isOpen: boolean
  onToggle: (key: string) => void
  isCollapsed: boolean
  items: { label: string; href: string }[]
  pathname: string | null
  handleNavigation: () => void
}) => {
  const isActive = basePaths.some((path) => pathname?.startsWith(path))

  return (
    <div className="mt-2">
      {isCollapsed ? (
        <Link
          href={basePaths[0] as any}
          onClick={handleNavigation}
          className={`flex items-center px-4 py-2 text-gray-100 rounded-md transition-colors duration-200 hover:bg-white/10 lg:justify-center ${
            isActive ? "bg-white/20 text-white font-medium shadow-sm" : ""
          }`}
        >
          {icon}
        </Link>
      ) : (
        <>
          <div
            onClick={() => onToggle(submenuKey)}
            className={`flex items-center justify-between px-4 py-2 text-gray-100 rounded-md transition-colors duration-200 hover:bg-white/10 cursor-pointer ${
              isActive ? "bg-white/20 text-white font-medium shadow-sm" : ""
            }`}
          >
            <div className="flex items-center">
              {icon}
              <span className="mx-3">{title}</span>
            </div>
            <ExpandMoreIcon
              className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
          <div className={`${isOpen ? "block" : "hidden"} bg-black/20`}>
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href as any}
                onClick={handleNavigation}
                className={`flex items-center pl-14 pr-4 py-2 text-sm transition-colors duration-200 ${
                  pathname === item.href
                    ? "text-white bg-white/10 font-medium"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export const Sidebar = ({ currentUser, isOpen, setIsOpen, isCollapsed }: SidebarProps) => {
  const pathname = usePathname()

  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({
    products:
      pathname?.startsWith("/shop/products") || pathname?.startsWith("/shop/inventory") || false,
    orders: pathname?.startsWith("/shop/orders") || false,
    billings: pathname?.startsWith("/shop/billings") || false,
  })

  useEffect(() => {
    if (pathname?.startsWith("/shop/products") || pathname?.startsWith("/shop/inventory")) {
      setOpenSubmenus((prev) => ({ ...prev, products: true }))
    } else if (pathname?.startsWith("/shop/orders")) {
      setOpenSubmenus((prev) => ({ ...prev, orders: true }))
    } else if (pathname?.startsWith("/shop/billings")) {
      setOpenSubmenus((prev) => ({ ...prev, billings: true }))
    }
  }, [pathname])

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleNavigation = () => setIsOpen(false)

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
            className={`block mt-4 p-2 rounded-md transition-colors duration-200 hover:bg-white/10 ${
              pathname === "/shop/settings" ? "bg-white/20 text-white font-medium shadow-sm" : ""
            }`}
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
                  sizes="48px"
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
              className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md transition-colors duration-200 hover:bg-white/10 ${
                isCollapsed ? "lg:justify-center" : ""
              } ${pathname === "/shop" ? "bg-white/20 text-white font-medium shadow-sm" : ""}`}
            >
              <DashboardIcon className="w-6 h-6" />
              <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Dashboard</span>
            </Link>

            <SidebarDropdown
              title="Products"
              icon={<InventoryIcon className="w-6 h-6" />}
              basePaths={["/shop/products", "/shop/inventory"]}
              submenuKey="products"
              isOpen={openSubmenus["products"]}
              onToggle={toggleSubmenu}
              isCollapsed={isCollapsed}
              pathname={pathname}
              handleNavigation={handleNavigation}
              items={[
                { label: "All Products", href: "/shop/products" },
                { label: "Add Product", href: "/shop/products/add" },
                { label: "Reported Products", href: "/shop/products/reported" },
              ]}
            />

            <SidebarDropdown
              title="Rent Orders"
              icon={<ShoppingBagIcon className="w-6 h-6" />}
              basePaths={["/shop/orders"]}
              submenuKey="orders"
              isOpen={openSubmenus["orders"]}
              onToggle={toggleSubmenu}
              isCollapsed={isCollapsed}
              pathname={pathname}
              handleNavigation={handleNavigation}
              items={[
                { label: "All Orders", href: "/shop/orders" },
                { label: "History", href: "/shop/orders/history" },
              ]}
            />

            <SidebarDropdown
              title="Billings"
              icon={<ReceiptIcon className="w-6 h-6" />}
              basePaths={["/shop/billings"]}
              submenuKey="billings"
              isOpen={openSubmenus["billings"]}
              onToggle={toggleSubmenu}
              isCollapsed={isCollapsed}
              pathname={pathname}
              handleNavigation={handleNavigation}
              items={[
                { label: "Invoices", href: "/shop/billings" },
                { label: "Settings", href: "/shop/billings/settings" },
              ]}
            />

            <Tooltip title={isCollapsed ? "Switch to Renter" : ""} placement="right">
              <Link
                href={"/" as any}
                className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md transition-colors duration-200 hover:bg-white/10 ${
                  isCollapsed ? "lg:justify-center" : ""
                } ${pathname === "/" ? "bg-white/20 text-white font-medium shadow-sm" : ""}`}
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
            className={`relative flex items-center px-4 py-2 text-gray-100 rounded-md transition-colors duration-200 hover:bg-white/10 cursor-pointer ${
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
