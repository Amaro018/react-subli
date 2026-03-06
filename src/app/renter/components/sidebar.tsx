"use client"
import React, { useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Tooltip, IconButton, Collapse } from "@mui/material"
import { useQuery } from "@blitzjs/rpc"
import getAllRentOfUser from "../../queries/getAllRentOfUser"
import { LogoutButton } from "../../(auth)/components/LogoutButton"

// Icons
import PersonIcon from "@mui/icons-material/Person"
import ListAltIcon from "@mui/icons-material/ListAlt"
import MenuIcon from "@mui/icons-material/Menu"
import MenuOpenIcon from "@mui/icons-material/MenuOpen"
import LogoutIcon from "@mui/icons-material/Logout"
import CloseIcon from "@mui/icons-material/Close"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import RateReviewIcon from "@mui/icons-material/RateReview"
import StorefrontIcon from "@mui/icons-material/Storefront"

interface SidebarProps {
  currentUser: any
  onMobileClose?: () => void
}

export const Sidebar = ({ currentUser, onMobileClose }: SidebarProps) => {
  const [userRents] = useQuery(getAllRentOfUser, { id: currentUser.id })
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isCollapsed, setIsCollapsed] = useState(false)
  // State to track which dropdown is open
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    "My Profile": true,
    "My Rentals": true,
  })

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  const toggleDropdown = (title: string) => {
    if (isCollapsed) setIsCollapsed(false) // Expand sidebar if a dropdown is clicked
    setOpenDropdowns((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  const handleLinkClick = () => {
    if (onMobileClose) onMobileClose()
  }

  const rents = userRents || []

  const toPayCount = rents.filter((rent) => {
    return rent.items.some((item) => {
      if (item.status === "completed") return false
      const totalPayment = item.payments.reduce((total, payment) => total + payment.amount, 0)
      const startDate = new Date(item.startDate)
      const endDate = new Date(item.endDate)
      const today = new Date()
      const duration =
        Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
      const rentalCost = item.productVariant.price * duration * item.quantity
      const lapseInDays =
        today > endDate
          ? Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
          : 0
      const penalty = item.price * lapseInDays * item.quantity
      return totalPayment < rentalCost + penalty
    })
  }).length

  const toDeliverCount = rents.filter((rent) => {
    return rent.items.some((item) => item.deliveryMethod === "deliver")
  }).length

  const toPickupCount = rents.filter((rent) => {
    return rent.items.some((item) => item.deliveryMethod === "pickup")
  }).length

  const toRateCount = rents.filter((rent) => {
    return rent.items.some((item) => item.status === "completed" && !item.isReviewed)
  }).length

  const menuItems = [
    {
      title: "My Profile",
      icon: <PersonIcon fontSize="small" />,
      items: [
        { name: "Profile", href: "/renter/renter-profile" },
        { name: "Addresses", href: "/renter/renter-address" },
        { name: "Change Password", href: "/renter/change-password" },
      ],
    },
    {
      title: "My Rentals",
      icon: <ListAltIcon fontSize="small" />,
      items: [
        { name: "All Rentals", href: "/renter/orders" },
        { name: "To Pay", href: "/renter/orders?status=to-pay", badge: toPayCount },
        { name: "To Deliver", href: "/renter/orders?status=to-deliver", badge: toDeliverCount },
        { name: "To Pickup", href: "/renter/orders?status=to-pickup", badge: toPickupCount },
        { name: "Completed", href: "/renter/orders?status=completed" },
      ],
    },
    {
      title: "My Reviews",
      icon: <RateReviewIcon fontSize="small" />,
      items: [
        { name: "All Reviews", href: "/renter/reviews" },
        { name: "To Rate", href: "/renter/reviews?status=to-rate", badge: toRateCount },
        { name: "Reviewed", href: "/renter/reviews?status=reviewed" },
      ],
    },
    currentUser?.isShopRegistered
      ? {
          title: currentUser.shop?.status === "pending" ? "Shop Pending" : "Switch to Shop",
          icon: <StorefrontIcon fontSize="small" />,
          href: currentUser.shop?.status === "pending" ? "/renter/shop-register/pending" : "/shop",
        }
      : {
          title: "Create a Shop",
          icon: <StorefrontIcon fontSize="small" />,
          href: "/renter/shop-register",
        },
  ]

  return (
    <aside
      className={`flex flex-col bg-white h-full shadow-sm transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[80px]" : "w-[280px]"
      } rounded-none overflow-hidden`} // Changed md:rounded-xl to rounded-none
    >
      {/* Header: Identity Section */}
      <div
        className={`flex flex-col p-4 border-b border-gray-100 ${
          isCollapsed ? "items-center" : ""
        }`}
      >
        <div className="mb-4 flex w-full items-center justify-between">
          {!isCollapsed && (
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Account
            </span>
          )}
          <div className="hidden md:block">
            <IconButton onClick={toggleSidebar} size="small">
              {isCollapsed ? <MenuIcon /> : <MenuOpenIcon />}
            </IconButton>
          </div>
          <div className="md:hidden">
            <IconButton onClick={onMobileClose} size="small">
              <CloseIcon />
            </IconButton>
          </div>
        </div>

        <div className={`flex ${isCollapsed ? "flex-col" : "flex-row"} items-center gap-3`}>
          <div className="relative h-12 w-12 flex-shrink-0">
            <Image
              src={
                currentUser?.profileImage
                  ? `/uploads/renter-profile/${currentUser.profileImage}`
                  : "/uploads/renter-profile/default.png"
              }
              alt="Profile"
              fill
              sizes="48px"
              className="rounded-full border-2 border-[#1b2a80] object-cover"
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <p className="truncate text-sm font-bold text-gray-800">
                {currentUser?.personalInfo?.firstName || "User"}
              </p>
              <p className="truncate text-xs text-gray-500">{currentUser?.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation with Dropdowns */}
      <nav className="scrollbar-seamless flex-1 overflow-y-auto px-2 py-4">
        {menuItems.map((section: any) => {
          if (section.href) {
            const [sectionPath, sectionQuery] = section.href.split("?")
            const sectionParams = new URLSearchParams(sectionQuery || "")
            const sectionStatus = sectionParams.get("status")
            const currentStatus = searchParams.get("status")
            const isActive = pathname === sectionPath && sectionStatus === currentStatus
            return (
              <div key={section.title} className="mb-2">
                <Tooltip title={isCollapsed ? section.title : ""} placement="right">
                  <Link
                    href={section.href}
                    onClick={handleLinkClick}
                    className={`flex w-full items-center gap-4 px-3 py-3 rounded-xl transition-colors ${
                      isActive
                        ? "text-[#1b2a80] font-bold bg-[#e8f0fe]"
                        : "text-gray-700 hover:bg-gray-50"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    <span className={isActive ? "text-[#1b2a80]" : "text-gray-500"}>
                      {section.icon}
                    </span>
                    {!isCollapsed && <span className="text-sm font-bold">{section.title}</span>}
                  </Link>
                </Tooltip>
              </div>
            )
          }
          const isOpen = openDropdowns[section.title]
          return (
            <div key={section.title} className="mb-2">
              <Tooltip title={isCollapsed ? section.title : ""} placement="right">
                <button
                  onClick={() => toggleDropdown(section.title)}
                  className={`flex w-full items-center justify-between gap-4 px-3 py-3 rounded-xl transition-colors text-gray-700 hover:bg-gray-50 ${
                    isCollapsed ? "justify-center" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-gray-500">{section.icon}</span>
                    {!isCollapsed && <span className="text-sm font-bold">{section.title}</span>}
                  </div>
                  {!isCollapsed &&
                    (isOpen ? (
                      <ExpandLessIcon fontSize="small" />
                    ) : (
                      <ExpandMoreIcon fontSize="small" />
                    ))}
                </button>
              </Tooltip>

              <Collapse in={isOpen && !isCollapsed} timeout="auto" unmountOnExit>
                <ul className="mt-1 flex flex-col gap-1 pl-9">
                  {section.items.map((item: any) => {
                    const [itemPath, itemQuery] = item.href.split("?")
                    const itemParams = new URLSearchParams(itemQuery || "")
                    const itemStatus = itemParams.get("status")
                    const currentStatus = searchParams.get("status")
                    const isActive = pathname === itemPath && itemStatus === currentStatus
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={handleLinkClick}
                          className={`flex justify-between items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            isActive
                              ? "text-[#1b2a80] font-bold bg-[#e8f0fe]"
                              : "text-gray-500 hover:text-[#1b2a80] hover:bg-gray-50"
                          }`}
                        >
                          <span>{item.name}</span>
                          {item.badge > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </Collapse>
            </div>
          )
        })}
      </nav>

      {/* Logout Footer */}
      <div className="border-t border-gray-100 p-3">
        <div
          onClick={handleLinkClick}
          className={`relative w-full flex items-center gap-4 px-3 py-3 rounded-full text-red-600 hover:bg-red-50 transition-colors cursor-pointer ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogoutIcon fontSize="small" />
          {!isCollapsed && (
            <div className="text-sm font-bold w-full">
              <LogoutButton />
            </div>
          )}
          <div className={`absolute inset-0 opacity-0 ${isCollapsed ? "block" : "hidden"}`}>
            <LogoutButton className="w-full h-full" />
          </div>
        </div>
      </div>
    </aside>
  )
}
