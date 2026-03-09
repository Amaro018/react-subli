"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import React, { useState } from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material"

const tabs = [
  { name: "All Shops", href: "/admin/manage-shops" },
  { name: "Pending", href: "/admin/manage-shops/pending" },
  { name: "Approved", href: "/admin/manage-shops/approved" },
  { name: "Rejected", href: "/admin/manage-shops/rejected" },
  { name: "Reported", href: "/admin/manage-shops/reported" },
  { name: "Banned", href: "/admin/manage-shops/banned" },
]

export default function ShopTabs() {
  const pathname = usePathname()
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingUrl, setPendingUrl] = useState<string | null>(null)

  const handleNavigation = (e: React.MouseEvent, href: string) => {
    if (typeof window !== "undefined" && (window as any).hasUnsavedChanges) {
      e.preventDefault()
      setPendingUrl(href)
      setConfirmOpen(true)
    }
  }

  const handleConfirmLeave = () => {
    if (typeof window !== "undefined") {
      ;(window as any).hasUnsavedChanges = false
    }
    setConfirmOpen(false)
    if (pendingUrl) router.push(pendingUrl as any)
  }

  const handleCancelLeave = () => {
    setConfirmOpen(false)
  }

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-none" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.name}
              href={tab.href as any}
              onClick={(e) => handleNavigation(e, tab.href)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.name}
            </Link>
          )
        })}
      </nav>

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
    </div>
  )
}
