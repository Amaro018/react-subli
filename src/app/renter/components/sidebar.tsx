"use client"
import React, { useState, useMemo, useEffect } from "react"
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

export const getBadgeCounts = (rents: any[]) => {
  if (!Array.isArray(rents) || rents.length === 0) {
    return {
      pendingCount: 0,
      toPayCount: 0,
      toDeliverCount: 0,
      toPickupCount: 0,
      toReturnCount: 0,
      toRateCount: 0,
    }
  }

  const pendingCount = rents.filter((rent: any) => {
    return rent?.items?.some((item: any) => item.status === "pending")
  }).length

  const toPayCount = rents.filter((rent: any) => {
    if (!rent?.items || rent.items.length === 0) return false

    return rent.items.some((item: any) => {
      if (item.status === "completed" || item.status === "canceled") return false

      const payments = item.payments || []
      const totalPayment = payments.reduce(
        (total: number, payment: any) => total + (payment.amount || 0),
        0
      )

      const startDate = new Date(item.startDate).getTime()
      const endDate = new Date(item.endDate).getTime()
      const today = new Date().getTime()

      const duration = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1)

      const variantPrice = item.productVariant?.price || item.price || 0
      const rentalCost = variantPrice * duration * (item.quantity || 1)

      const lapseInDays = today > endDate ? Math.ceil((today - endDate) / (1000 * 60 * 60 * 24)) : 0

      const penalty = (item.price || 0) * lapseInDays * (item.quantity || 1)
      const totalAmountDue = rentalCost + penalty

      return totalPayment < totalAmountDue && totalAmountDue > 0
    })
  }).length

  const toDeliverCount = rents.filter((rent: any) => {
    return rent?.items?.some(
      (item: any) => item.deliveryMethod === "deliver" && item.status === "accepted"
    )
  }).length

  const toPickupCount = rents.filter((rent: any) => {
    return rent?.items?.some(
      (item: any) => item.deliveryMethod === "pickup" && item.status === "accepted"
    )
  }).length

  const toReturnCount = rents.filter((rent: any) => {
    return rent?.items?.some(
      (item: any) =>
        item.status === "to-return" || item.status === "in_use" || item.status === "active"
    )
  }).length

  const toRateCount = rents.filter((rent: any) => {
    return rent?.items?.some(
      (item: any) => item.status === "completed" && (!item.reviews || item.reviews.length === 0)
    )
  }).length

  return {
    pendingCount,
    toPayCount,
    toDeliverCount,
    toPickupCount,
    toReturnCount,
    toRateCount,
  }
}

export const Sidebar = ({ currentUser, onMobileClose }: SidebarProps) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [userRents] = useQuery(
    getAllRentOfUser,
    { id: currentUser.id },
    { enabled: !!currentUser && !isLoggingOut }
  )
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({})

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  const handleLinkClick = () => {
    if (onMobileClose) onMobileClose()
  }

  const { pendingCount, toPayCount, toDeliverCount, toPickupCount, toReturnCount, toRateCount } =
    useMemo(() => getBadgeCounts(userRents || []), [userRents])

  const menuItems = useMemo(
    () =>
      [
        {
          title: "My Profile",
          icon: <PersonIcon fontSize="small" />,
          items: [
            { name: "Profile", href: "/renter/my-profile" },
            { name: "Addresses", href: "/renter/my-address" },
            { name: "Change Password", href: "/renter/change-password" },
          ],
        },
        {
          title: "My Rentals",
          icon: <ListAltIcon fontSize="small" />,
          items: [
            { name: "All Rentals", href: "/renter/my-rent-orders" },
            {
              name: "Pending",
              href: "/renter/my-rent-orders?status=pending",
              badge: pendingCount,
            },
            {
              name: "To Pay",
              href: "/renter/my-rent-orders?status=to-pay",
              badge: toPayCount,
            },
            {
              name: "To Deliver",
              href: "/renter/my-rent-orders?status=to-deliver",
              badge: toDeliverCount,
            },
            {
              name: "To Pickup",
              href: "/renter/my-rent-orders?status=to-pickup",
              badge: toPickupCount,
            },
            {
              name: "To Return",
              href: "/renter/my-rent-orders?status=to-return",
              badge: toReturnCount,
            },
            { name: "Completed", href: "/renter/my-rent-orders?status=completed" },
          ],
        },
        {
          title: "My Reviews",
          icon: <RateReviewIcon fontSize="small" />,
          items: [
            { name: "All Reviews", href: "/renter/reviews" },
            {
              name: "To Rate",
              href: "/renter/reviews?status=to-rate",
              badge: toRateCount,
            },
            { name: "Reviewed", href: "/renter/reviews?status=reviewed" },
          ],
        },
        currentUser?.isShopRegistered && currentUser.shop
          ? currentUser.shop.status === "banned"
            ? {
                title: "Shop Suspended",
                icon: <StorefrontIcon fontSize="small" />,
                href: "/renter/my-shop/suspended",
              }
            : {
                title:
                  currentUser.isShopMode || currentUser.shop.status === "approved"
                    ? "Switch to Shop"
                    : "Shop Pending",
                icon: <StorefrontIcon fontSize="small" />,
                href:
                  currentUser.isShopMode || currentUser.shop.status === "approved"
                    ? "/shop"
                    : "/renter/my-shop/pending",
              }
          : currentUser?.isShopRegistered
          ? {
              title: "Shop Pending",
              icon: <StorefrontIcon fontSize="small" />,
              href: "/renter/my-shop/pending",
            }
          : {
              title: "Create a Shop",
              icon: <StorefrontIcon fontSize="small" />,
              href: "/renter/my-shop",
            },
      ].filter(Boolean),
    [
      currentUser,
      pendingCount,
      toPayCount,
      toDeliverCount,
      toPickupCount,
      toReturnCount,
      toRateCount,
    ]
  )

  useEffect(() => {
    const activeDropdowns: Record<string, boolean> = {}
    menuItems.forEach((section: any) => {
      if (section.items) {
        const isSectionActive = section.items.some((item: any) => {
          const [itemPath, itemQuery] = item.href.split("?")
          const itemParams = new URLSearchParams(itemQuery || "")
          const itemStatus = itemParams.get("status")
          const currentStatus = searchParams.get("status")
          return pathname === itemPath && itemStatus === currentStatus
        })
        activeDropdowns[section.title] = isSectionActive
      }
    })
    setOpenDropdowns(activeDropdowns)
  }, [pathname, searchParams, menuItems])

  const toggleDropdown = (title: string) => {
    if (isCollapsed) setIsCollapsed(false)
    setOpenDropdowns((prev) => ({ ...prev, [title]: !prev[title] }))
  }

  return (
    <aside
      className={`flex flex-col bg-white h-full shadow-sm transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-[80px]" : "w-[280px]"
      } rounded-none overflow-hidden`}
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
      <nav className="scrollbar-sidebar flex-1 overflow-y-auto px-2 py-4">
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
        <LogoutButton
          className={`w-full flex items-center gap-4 px-3 py-3 rounded-full text-red-600 hover:bg-red-50 transition-colors cursor-pointer ${
            isCollapsed ? "justify-center" : ""
          }`}
          onLogout={() => {
            setIsLoggingOut(true)
            handleLinkClick()
          }}
        >
          <LogoutIcon fontSize="small" className="shrink-0" />
          {!isCollapsed && <span className="text-sm font-bold">Logout</span>}
        </LogoutButton>
      </div>
    </aside>
  )
}
