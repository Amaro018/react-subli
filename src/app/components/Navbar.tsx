"use client"
import React, { useEffect, useRef, useState } from "react"
import { LogoutButton } from "../(auth)/components/LogoutButton"
import AccountCircle from "@mui/icons-material/AccountCircle"
import ExpandMore from "@mui/icons-material/ExpandMore"
import Link from "next/link"
import PersonIcon from "@mui/icons-material/Person"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import StarIcon from "@mui/icons-material/Star"
import StoreIcon from "@mui/icons-material/Store"
import Drawer from "@mui/material/Drawer"
import { Badge, Popover } from "@mui/material"
import { useQuery } from "@blitzjs/rpc"
import getAllCartItem from "../queries/getAllCartItem"
import getNotifications from "../queries/getNotifications"
import NotificationsIcon from "@mui/icons-material/Notifications"
import NotificationList from "./NotificationList"
import ExitToAppIcon from "@mui/icons-material/ExitToApp"
import DrawerCart from "./DrawerCart"

type NavbarProps = {
  currentUser?: any
}

export default function Navbar({ currentUser }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const accountRef = useRef<HTMLDivElement | null>(null)
  const [cartItems] = useQuery(getAllCartItem, null, { enabled: !!currentUser, suspense: false })
  const [notifications] = useQuery(getNotifications, null, {
    enabled: !!currentUser,
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
    { name: "Products", href: "/product" },
    { name: "Shops", href: "/shop" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ]

  // Shop state detection: adjust to your actual user shape if different
  const firstName =
    currentUser?.personalInfo?.firstName ||
    (typeof currentUser?.name === "string" ? currentUser.name.split(" ")[0] : "User")

  let shopHref = "/renter/shop-register"
  let shopLabel = "Create a Shop"

  if (currentUser?.isShopRegistered) {
    if (currentUser.shop?.status === "pending") {
      shopHref = "/renter/shop-register/pending"
      shopLabel = "Shop Pending"
    } else {
      shopHref = currentUser?.shop?.slug ? `/shop/${currentUser.shop.slug}` : "/shop"
      shopLabel = "Switch to Shop"
    }
  }

  const openNotification = Boolean(anchorEl)
  const notificationId = openNotification ? "simple-popover" : undefined

  return (
    <header className="w-full bg-[#1b2a80] text-white shadow-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Left: Logo + (mobile) menu icon */}
        <div className="flex items-center gap-2 lg:gap-4">
          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-white/10 focus:outline-none"
          >
            {/* Hamburger */}
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

        {/* Center: desktop nav links */}
        <nav className="hidden gap-8 font-semibold lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.name}
              href={l.href as any}
              className="hover:text-yellow-300 transition-colors"
            >
              {l.name}
            </Link>
          ))}
        </nav>

        {/* Right: auth actions (desktop) and user icon (mobile) */}
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="hidden items-center gap-4 font-semibold lg:flex">
            {!currentUser ? (
              <>
                <Link href="/login" className="hover:text-yellow-300 transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="hover:text-yellow-300 transition-colors">
                  Register
                </Link>
              </>
            ) : (
              <>
                {/* Desktop account dropdown (no logout inside) */}
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
                          href="/renter/renter-profile"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <PersonIcon className="mr-3 text-gray-500" fontSize="small" />
                          My Profile
                        </Link>

                        <Link
                          href="/renter/orders"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <ShoppingBagIcon className="mr-3 text-gray-500" fontSize="small" />
                          My Rental Orders
                        </Link>

                        <Link
                          href="/renter/reviews"
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <StarIcon className="mr-3 text-gray-500" fontSize="small" />
                          My Reviews
                        </Link>

                        <Link
                          href={shopHref as any}
                          className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                          onClick={() => setAccountOpen(false)}
                        >
                          <StoreIcon className="mr-3 text-gray-500" fontSize="small" />
                          {shopLabel}
                        </Link>

                        <div className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer">
                          <ExitToAppIcon className="mr-3 text-gray-500" fontSize="small" />
                          <LogoutButton className="w-full text-left" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Desktop Cart Icon */}
                <button
                  onClick={() => setCartOpen(true)}
                  className="hover:text-yellow-300 transition-colors"
                >
                  <Badge badgeContent={cartItems?.length || 0} color="error">
                    <ShoppingBagIcon />
                  </Badge>
                </button>
                {/* Desktop Notification Icon */}
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
            {/* Mobile account icon */}
            <AccountCircle style={{ fontSize: 24 }} className="text-white" />
          </button>

          {/* Mobile Cart Icon */}
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

      {/* Mobile: Menu Drawer (left) */}
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
              {navLinks.map((l) => (
                <Link
                  key={l.name}
                  href={l.href as any}
                  className="rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1b2a80] transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {l.name}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Mobile: User Drawer (right) - copied dropdown items here */}
      {userOpen && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setUserOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative w-64 bg-white p-6 text-gray-800 shadow-lg flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-bold text-[#1b2a80]">Account</span>
              <button
                aria-label="Close account"
                onClick={() => setUserOpen(false)}
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

            <div className="flex flex-col gap-2">
              {!currentUser ? (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1b2a80] transition-colors"
                    onClick={() => setUserOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1b2a80] transition-colors"
                    onClick={() => setUserOpen(false)}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/renter/renter-profile"
                    className="flex items-center rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1b2a80] transition-colors"
                    onClick={() => setUserOpen(false)}
                  >
                    <PersonIcon className="mr-3 text-gray-500" fontSize="small" />
                    My Profile
                  </Link>

                  <Link
                    href="/renter/orders"
                    className="flex items-center rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1b2a80] transition-colors"
                    onClick={() => setUserOpen(false)}
                  >
                    <ShoppingBagIcon className="mr-3 text-gray-500" fontSize="small" />
                    My Rental Orders
                  </Link>

                  <Link
                    href="/renter/reviews"
                    className="flex items-center rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1b2a80] transition-colors"
                    onClick={() => setUserOpen(false)}
                  >
                    <StarIcon className="mr-3 text-gray-500" fontSize="small" />
                    My Reviews
                  </Link>

                  <Link
                    href={shopHref as any}
                    className="flex items-center rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1b2a80] transition-colors"
                    onClick={() => setUserOpen(false)}
                  >
                    <StoreIcon className="mr-3 text-gray-500" fontSize="small" />
                    {shopLabel}
                  </Link>

                  <div
                    className="flex items-center rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#1b2a80] transition-colors cursor-pointer"
                    onClick={() => setUserOpen(false)}
                  >
                    <ExitToAppIcon className="mr-3 text-gray-500" fontSize="small" />
                    <LogoutButton className="w-full text-left" />
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      )}

      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <DrawerCart />
      </Drawer>

      <Popover
        id={notificationId}
        open={openNotification}
        anchorEl={anchorEl}
        onClose={handleNotificationClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <NotificationList onClose={handleNotificationClose} />
      </Popover>
    </header>
  )
}
