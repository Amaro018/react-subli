"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getNotifications from "../queries/getNotifications"
import markNotificationAsRead from "../mutations/markNotificationAsRead"
import markAllNotificationsAsRead from "../mutations/markAllNotificationsAsRead"
import deleteAllNotifications from "../mutations/deleteAllNotifications"
import {
  List,
  ListItemText,
  Typography,
  Divider,
  Box,
  CircularProgress,
  ListItemButton,
  Button,
} from "@mui/material"
import CircleIcon from "@mui/icons-material/Circle"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep"

interface NotificationListProps {
  onClose?: () => void
}

export default function NotificationList({ onClose }: NotificationListProps) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)
  const [notifications, { refetch }] = useQuery(getNotifications, null, {
    refetchInterval: 5000,
  })
  const [markAsReadMutation] = useMutation(markNotificationAsRead)
  const [markAllAsReadMutation] = useMutation(markAllNotificationsAsRead)
  const [deleteAllMutation] = useMutation(deleteAllNotifications)

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      try {
        await markAsReadMutation({ id: notification.id })
        await refetch()
      } catch (error) {
        console.error("Failed to mark notification as read", error)
      }
    }

    if (notification.title === "New Shop Registration") {
      const match = notification.message.match(/\/admin\/shops\/(\d+)/)
      if (match) {
        router.push(`/admin/manage-shops/pending?shopId=${match[1]}`)
      } else {
        router.push("/admin/manage-shops/pending")
      }
    }

    if (notification.title === "Shop Registration Approved") {
      router.push("/renter/shop-register")
    }

    if (
      notification.title === "Shop Registration Rejected" ||
      notification.title === "Registration Submitted"
    ) {
      router.push("/renter/shop-register/pending")
    }

    if (notification.title === "Document Resubmitted") {
      const match = notification.message.match(/\/admin\/shops\/(\d+)/)
      if (match) {
        router.push(`/admin/manage-shops/rejected?shopId=${match[1]}`)
      } else {
        router.push("/admin/manage-shops/rejected")
      }
    }

    if (onClose) onClose()
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation()
      await refetch()
    } catch (error) {
      console.error("Failed to mark all notifications as read", error)
    }
  }

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all notifications?")) {
      try {
        await deleteAllMutation()
        await refetch()
      } catch (error) {
        console.error("Failed to delete all notifications", error)
      }
    }
  }

  if (!notifications) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    )
  }

  if (notifications.length === 0) {
    return (
      <Box p={2} textAlign="center">
        <Typography variant="body2" color="textSecondary">
          No notifications
        </Typography>
      </Box>
    )
  }

  const hasUnread = notifications.some((n: any) => !n.isRead)
  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5)

  const groupedNotifications = displayedNotifications.reduce((acc: any, notification: any) => {
    const date = new Date(notification.createdAt)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let group = "Older"
    if (date.toDateString() === today.toDateString()) {
      group = "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      group = "Yesterday"
    }

    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(notification)
    return acc
  }, {})

  Object.keys(groupedNotifications).forEach((group) => {
    groupedNotifications[group].sort((a: any, b: any) => {
      // Unread first
      if (a.isRead !== b.isRead) {
        return a.isRead ? 1 : -1
      }
      // Older first
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
  })

  const groups = ["Today", "Yesterday", "Older"]

  return (
    <Box sx={{ width: "100%", minWidth: 300, maxWidth: 360, bgcolor: "background.paper" }}>
      <Box p={1} display="flex" justifyContent="flex-end" gap={1}>
        {hasUnread && (
          <Button size="small" startIcon={<DoneAllIcon />} onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
        <Button size="small" color="error" startIcon={<DeleteSweepIcon />} onClick={handleClearAll}>
          Clear all
        </Button>
      </Box>
      <Divider />
      <List sx={{ maxHeight: 400, overflow: "auto", p: 0 }}>
        {groups.map((group) => {
          const groupItems = groupedNotifications[group]
          if (!groupItems || groupItems.length === 0) return null

          return (
            <React.Fragment key={group}>
              <Box sx={{ px: 2, py: 0.5, bgcolor: "#f5f5f5" }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  {group}
                </Typography>
              </Box>
              {groupItems.map((notification: any, index: number) => (
                <React.Fragment key={notification.id}>
                  <ListItemButton
                    alignItems="flex-start"
                    onClick={() => handleNotificationClick(notification)}
                    sx={{
                      bgcolor: notification.isRead ? "transparent" : "action.hover",
                      transition: "background-color 0.3s",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={0.5}
                        >
                          <Typography
                            sx={{
                              display: "inline",
                              fontWeight: notification.isRead ? "normal" : "bold",
                              fontSize: "0.9rem",
                            }}
                            component="span"
                            color="text.primary"
                          >
                            {notification.title}
                          </Typography>
                          {!notification.isRead && (
                            <CircleIcon sx={{ fontSize: 8, color: "primary.main", ml: 1 }} />
                          )}
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: "block", mb: 0.5, lineHeight: 1.2 }}
                            component="span"
                            variant="caption"
                            color="text.secondary"
                          >
                            {notification.message}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ fontSize: "0.7rem" }}
                          >
                            {new Date(notification.createdAt).toLocaleString()}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItemButton>
                  {index < groupItems.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </React.Fragment>
          )
        })}
      </List>
      {notifications.length > 5 && !showAll && (
        <>
          <Divider />
          <Box p={1} display="flex" justifyContent="center">
            <Button size="small" onClick={() => setShowAll(true)}>
              View all
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}
