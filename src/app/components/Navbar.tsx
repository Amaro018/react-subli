"use client"
import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutButton } from "../(auth)/components/LogoutButton"

// UI & Icons
import AccountCircle from "@mui/icons-material/AccountCircle"
import ExpandMore from "@mui/icons-material/ExpandMore"
import PersonIcon from "@mui/icons-material/Person"
import ListAltIcon from "@mui/icons-material/ListAlt"
import BookmarkIcon from "@mui/icons-material/Bookmark"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import RateReviewIcon from "@mui/icons-material/RateReview"
import ContactSupportIcon from "@mui/icons-material/ContactSupport"
import StorefrontIcon from "@mui/icons-material/Storefront"
import NotificationsIcon from "@mui/icons-material/Notifications"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
import Drawer from "@mui/material/Drawer"
import { Badge, Popover } from "@mui/material"

// RPC & Components
import { useQuery } from "@blitzjs/rpc"
import getAllCartItem from "../queries/getAllCartItem"
import getNotifications from "../queries/getNotifications"
import NotificationList from "./NotificationList"
import DrawerCart from "./DrawerCart"
import { Sidebar } from "../renter/components/sidebar" // Adjust path to match your Sidebar file position

type NavbarProps = {
  currentUser?: any
}

export default function Navbar({ currentUser }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const pathname = usePathname()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const accountRef = useRef<HTMLDivElement | null>(null)

  const [cartItems] = useQuery(getAllCartItem, null, {
    enabled: !!currentUser && !isLoggingOut,
    suspense: false,
  })
  const [notifications] = useQuery(getNotifications, null, {
    enabled: !!currentUser && !isLoggingOut,
    refetchInterval: 5000,
    suspense: false,
  })

  const unreadNotifications = notifications?.filter((n: any) => !n.isRead) || []

  const handleNotificationClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleNotificationClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false)
      }
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAccountOpen(false)
    }
    document.addEventListener("click", onDocClick)
    document.addEventListener("keydown", onEsc)
    return () => {
      document.removeEventListener("click", onDocClick)
      document.removeEventListener("keydown", onEsc)
    }
  }, [])

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Shops", href: "/shops" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  const firstName =
    currentUser?.personalInfo?.firstName ||
    (typeof currentUser?.name === "string" ? currentUser.name.split(" ")[0] : "User")

  let shopHref = "/renter/my-shop"
  let shopLabel = "Create a Shop"
  const isApprovedShop = currentUser?.shop?.status === "approved" || currentUser?.isShopMode

  if (currentUser?.isShopRegistered && currentUser.shop) {
    if (currentUser.shop.status === "banned") {
      shopHref = "/renter/my-shop/suspended"
      shopLabel = "Shop Suspended"
    } else if (!isApprovedShop) {
      shopHref = "/renter/my-shop/pending"
      shopLabel = "Shop Pending"
    } else {
      shopHref = "/shop"
      shopLabel = "Switch to Shop"
    }
  } else if (currentUser?.isShopRegistered) {
    shopLabel = "Shop Pending"
  }

  const openNotification = Boolean(anchorEl)
  const notificationId = openNotification ? "simple-popover" : undefined

  return (
    <header className="w-full bg-[#1b2a80] text-white shadow-md">
      <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Left Logo */}
        <div className="flex items-center gap-2 lg:gap-4">
          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-white/10 focus:outline-none"
          >
            <svg
              className="h-6 w-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold text-white">
              S
            </span>
            <span className="text-lg font-semibold">Subli</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden gap-8 font-semibold lg:flex items-center">
          {navLinks.map((l) => {
            const isActive = pathname === l.href
            return (
              <Link
                key={l.name}
                href={l.href as any}
                className={`relative hover:text-yellow-300 transition-colors py-1 ${
                  isActive ? "text-yellow-300" : "text-white"
                }`}
              >
                {l.name}
                {isActive && (
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-yellow-300 rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden items-center gap-4 font-semibold lg:flex">
            {!currentUser ? (
              <>
                <Link
                  href="/login"
                  className={`relative hover:text-yellow-300 transition-colors py-1 ${
                    pathname === "/login" ? "text-yellow-300" : "text-white"
                  }`}
                >
                  Login
                  {pathname === "/login" && (
                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-yellow-300 rounded-full" />
                  )}
                </Link>
                <Link
                  href="/signup"
                  className={`relative hover:text-yellow-300 transition-colors py-1 ${
                    pathname === "/signup" ? "text-yellow-300" : "text-white"
                  }`}
                >
                  Register
                  {pathname === "/signup" && (
                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-yellow-300 rounded-full" />
                  )}
                </Link>
              </>
            ) : (
              <>
                {/* Desktop Account Dropdown */}
                <div ref={accountRef} className="relative">
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={accountOpen}
                    onClick={() => setAccountOpen((s) => !s)}
                    className="inline-flex items-center gap-2 hover:text-yellow-300 transition-colors focus:outline-none"
                  >
                    <span className="hidden sm:inline">Hi {firstName}</span>
                    <ExpandMore fontSize="small" />
                  </button>

                  {accountOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-white text-gray-800 shadow-lg">
                      <div className="flex flex-col">
                        <Link
                          href="/renter/profile"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <PersonIcon className="mr-3 text-gray-500" fontSize="small" />
                          My Profile
                        </Link>
                        <Link
                          href="/renter/rent-orders"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <ListAltIcon className="mr-3 text-gray-500" fontSize="small" />
                          My Rental Orders
                        </Link>
                        <Link
                          href="/renter/saved-items"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <BookmarkIcon className="mr-3 text-gray-500" fontSize="small" />
                          My Saved Items
                        </Link>
                        <Link
                          href="/renter/invoices"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <ReceiptLongIcon className="mr-3 text-gray-500" fontSize="small" />
                          My Invoices
                        </Link>
                        <Link
                          href="/renter/reviews"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <RateReviewIcon className="mr-3 text-gray-500" fontSize="small" />
                          My Reviews
                        </Link>
                        <Link
                          href={shopHref as any}
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <StorefrontIcon className="mr-3 text-gray-500" fontSize="small" />
                          {shopLabel}
                        </Link>
                        <Link
                          href="/support"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <ContactSupportIcon className="mr-3 text-gray-500" fontSize="small" />
                          Support
                        </Link>

                        <LogoutButton
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer text-left"
                          onLogout={() => {
                            setIsLoggingOut(true)
                            setAccountOpen(false)
                          }}
                        >
                          <ExitToAppIcon className="mr-3 text-gray-500" fontSize="small" />
                          <span>Logout</span>
                        </LogoutButton>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setCartOpen(true)}
                  className="hover:text-yellow-300 transition-colors"
                >
                  <Badge badgeContent={cartItems?.length || 0} color="error">
                    <ShoppingBagIcon />
                  </Badge>
                </button>

                <button
                  onClick={handleNotificationClick}
                  className="hover:text-yellow-300 transition-colors"
                >
                  <Badge badgeContent={unreadNotifications.length} color="error">
                    <NotificationsIcon />
                  </Badge>
                </button>
              </>
            )}
          </div>

          <button
            aria-label="Open account menu"
            onClick={() => setUserOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-white/10 focus:outline-none"
          >
            <AccountCircle style={{ fontSize: 24 }} className="text-white" />
          </button>

          {currentUser && (
            <>
              <button
                onClick={() => setCartOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-white/10 focus:outline-none"
              >
                <Badge badgeContent={cartItems?.length || 0} color="error">
                  <ShoppingBagIcon />
                </Badge>
              </button>
              <button
                onClick={handleNotificationClick}
                className="lg:hidden p-2 rounded-md hover:bg-white/10 focus:outline-none"
              >
                <Badge badgeContent={unreadNotifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer (left) */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-64 bg-white p-6 text-gray-800 shadow-lg flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-bold text-[#1b2a80]">Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="h-6 w-6 text-gray-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {navLinks.map((l) => {
                const isActive = pathname === l.href
                return (
                  <Link
                    key={l.name}
                    href={l.href as any}
                    className={`rounded-lg px-4 py-3 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-[#1b2a80]/10 text-[#1b2a80]"
                        : "text-gray-700 hover:bg-gray-50 hover:text-[#1b2a80]"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {l.name}
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Mobile Account Drawer (Right Side with Full Sidebar rendering) */}
      <Drawer
        anchor="right"
        open={userOpen}
        onClose={() => setUserOpen(false)}
        sx={{
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 280 },
        }}
      >
        {currentUser ? (
          <Sidebar currentUser={currentUser} onMobileClose={() => setUserOpen(false)} />
        ) : (
          <div className="p-6 text-gray-800 flex flex-col gap-3">
            <span className="text-xl font-bold text-[#1b2a80] mb-4">Account</span>
            <Link
              href="/login"
              className="rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setUserOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg px-4 py-3 font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setUserOpen(false)}
            >
              Register
            </Link>
          </div>
        )}
      </Drawer>

      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <DrawerCart />
      </Drawer>

      <Popover
        id={notificationId}
        open={openNotification}
        anchorEl={anchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <NotificationList onClose={handleNotificationClose} />
      </Popover>
    </header>
  )
}
