import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material"

interface SidebarProps {
  currentUser: any
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  isCollapsed: boolean
}

const SidebarDropdown = ({
  title,
  icon,
  basePath,
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
  basePath: string
  submenuKey: string
  isOpen: boolean
  onToggle: (key: string) => void
  isCollapsed: boolean
  items: { label: string; href: string }[]
  pathname: string | null
  handleNavigation: (e: React.MouseEvent, href: string) => void
}) => {
  return (
    <div className="mt-2">
      {isCollapsed ? (
        <Link
          href={basePath as any}
          onClick={(e) => handleNavigation(e, basePath)}
          className={`flex items-center px-4 py-2 text-gray-100 rounded-md hover:bg-white/10 lg:justify-center ${
            pathname?.startsWith(basePath) ? "bg-white/20" : ""
          }`}
        >
          {icon}
        </Link>
      ) : (
        <>
          <div
            onClick={() => onToggle(submenuKey)}
            className={`flex items-center justify-between px-4 py-2 text-gray-100 rounded-md hover:bg-white/10 cursor-pointer ${
              pathname?.startsWith(basePath) ? "bg-white/20" : ""
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
                onClick={(e) => handleNavigation(e, item.href)}
                className={`flex items-center pl-14 pr-4 py-2 text-sm hover:text-white hover:bg-white/5 ${
                  pathname === item.href ? "text-white bg-white/10" : "text-gray-300"
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
  const router = useRouter()
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({
    shops: pathname?.startsWith("/admin/manage-shops") || false,
    products: pathname?.startsWith("/admin/products") || false,
  })

  const toggleSubmenu = (key: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    if (typeof window !== "undefined" && (window as any).hasUnsavedChanges) {
      e.preventDefault()
      setPendingUrl(href)
      setConfirmOpen(true)
    } else {
      setIsOpen(false)
    }
  }

  const handleConfirmLeave = () => {
    if (typeof window !== "undefined") {
      ;(window as any).hasUnsavedChanges = false
    }
    setConfirmOpen(false)
    if (pendingUrl) router.push(pendingUrl as any)
    setIsOpen(false)
  }

  const handleCancelLeave = () => {
    setConfirmOpen(false)
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
              onClick={(e) => handleNavigation(e, "/admin")}
              className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 ${
                isCollapsed ? "lg:justify-center" : ""
              } ${pathname === "/admin" ? "bg-white/20" : ""}`}
            >
              <DashboardIcon className="w-6 h-6" />
              <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Dashboard</span>
            </Link>

            {/* Shops Dropdown */}
            <SidebarDropdown
              title="Shops"
              icon={<StoreIcon className="w-6 h-6" />}
              basePath="/admin/manage-shops"
              submenuKey="shops"
              isOpen={openSubmenus["shops"]}
              onToggle={toggleSubmenu}
              isCollapsed={isCollapsed}
              pathname={pathname}
              handleNavigation={handleNavigation}
              items={[
                { label: "All Shops", href: "/admin/manage-shops" },
                { label: "Approved Shops", href: "/admin/manage-shops/approved" },
                { label: "Pending Shops", href: "/admin/manage-shops/pending" },
                { label: "Rejected Shops", href: "/admin/manage-shops/rejected" },
                { label: "Reported Shops", href: "/admin/manage-shops/reported" },
                { label: "Banned Shops", href: "/admin/manage-shops/banned" },
              ]}
            />

            {/* Products Dropdown */}
            <SidebarDropdown
              title="Products"
              icon={<InventoryIcon className="w-6 h-6" />}
              basePath="/admin/products"
              submenuKey="products"
              isOpen={openSubmenus["products"]}
              onToggle={toggleSubmenu}
              isCollapsed={isCollapsed}
              pathname={pathname}
              handleNavigation={handleNavigation}
              items={[
                { label: "All Products", href: "/admin/products" },
                { label: "Reported Products", href: "/admin/products/reported" },
                { label: "Banned Products", href: "/admin/products/banned" },
              ]}
            />

            <Link
              href={"/admin/orders" as any}
              onClick={(e) => handleNavigation(e, "/admin/orders")}
              className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 ${
                isCollapsed ? "lg:justify-center" : ""
              } ${pathname?.startsWith("/admin/orders") ? "bg-white/20" : ""}`}
            >
              <ReceiptLongIcon className="w-6 h-6" />
              <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Orders</span>
            </Link>

            <Link
              href={"/admin/users" as any}
              onClick={(e) => handleNavigation(e, "/admin/users")}
              className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 ${
                isCollapsed ? "lg:justify-center" : ""
              } ${pathname?.startsWith("/admin/users") ? "bg-white/20" : ""}`}
            >
              <PeopleIcon className="w-6 h-6" />
              <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Users</span>
            </Link>

            <Link
              href={"/admin/settings" as any}
              onClick={(e) => handleNavigation(e, "/admin/settings")}
              className={`flex items-center px-4 py-2 mt-2 text-gray-100 rounded-md hover:bg-white/10 ${
                isCollapsed ? "lg:justify-center" : ""
              } ${pathname === "/admin/settings" ? "bg-white/20" : ""}`}
            >
              <SettingsIcon className="w-6 h-6" />
              <span className={`mx-3 ${isCollapsed ? "lg:hidden" : ""}`}>Settings</span>
            </Link>

            <Link
              href={"/renter" as any}
              onClick={(e) => handleNavigation(e, "/renter")}
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
            onClick={(e) => handleNavigation(e, "/logout")}
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

      <Dialog open={confirmOpen} onClose={handleCancelLeave}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Are you sure you want to leave?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLeave} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLeave} color="error" autoFocus>
            Leave
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Sidebar
