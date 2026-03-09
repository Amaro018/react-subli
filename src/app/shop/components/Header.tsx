"use client"
import React, { useState } from "react"
import Link from "next/link"
import MenuIcon from "@mui/icons-material/Menu"
import NotificationsIcon from "@mui/icons-material/Notifications"
import MailIcon from "@mui/icons-material/Mail"
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount"
import { Badge, IconButton, Popover } from "@mui/material"
import { useQuery } from "@blitzjs/rpc"
import getUnreadNotificationCount from "../../queries/getUnreadNotificationCount"
import NotificationList from "../../components/NotificationList"

interface HeaderProps {
  toggleSidebar: () => void
}

export default function Header({ toggleSidebar }: HeaderProps) {
  const [unreadCount] = useQuery(getUnreadNotificationCount, null, {
    refetchInterval: 5000,
  })
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? "simple-popover" : undefined

  return (
    <header className="flex items-center justify-between bg-white shadow px-6 py-4 z-20">
      <div className="flex items-center">
        <button onClick={toggleSidebar} className="text-gray-500 focus:outline-none mr-4">
          <MenuIcon />
        </button>
        <span className="text-xl font-semibold text-gray-800">Shop Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <Link href={"/" as any} title="Switch to Renter">
          <IconButton>
            <SwitchAccountIcon className="text-gray-600" />
          </IconButton>
        </Link>
        <IconButton>
          <Badge badgeContent={3} color="error">
            <MailIcon className="text-gray-600" />
          </Badge>
        </IconButton>
        <IconButton onClick={handleClick}>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon className="text-gray-600" />
          </Badge>
        </IconButton>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <NotificationList onClose={handleClose} />
        </Popover>
      </div>
    </header>
  )
}
