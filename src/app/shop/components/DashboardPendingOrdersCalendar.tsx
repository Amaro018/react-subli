"use client"

import * as React from "react"
import Link from "next/link"
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"
import { useMutation } from "@blitzjs/rpc"
import updateRentStatus from "../../mutations/updateRentStatus"
import { toast } from "../../utils/toast"
import { normalizeDeliveryMethod } from "../../utils/normalizeDeliveryMethod"
import type { DashboardRecentOrder } from "./DashboardRecentOrders"
import { formatDateTime } from "./utils"

interface DashboardPendingOrdersCalendarProps {
  items: DashboardRecentOrder[]
  onOrderAccepted: () => Promise<unknown>
}

const ACTIVE_STATUSES = new Set(["accepted", "rendering", "on_hand", "overdue"])
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function startOfDay(value: Date | string) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  return date
}

function sameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

function formatDateRange(startDate: Date | string, endDate: Date | string) {
  return `${formatDateTime(startDate)} – ${formatDateTime(endDate)}`
}

function getRenterName(item: DashboardRecentOrder) {
  const personalInfo = item.rent?.user?.personalInfo
  const name = [personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ")
  return name || item.rent?.user?.email || "Renter"
}

export default function DashboardPendingOrdersCalendar({
  items,
  onOrderAccepted,
}: DashboardPendingOrdersCalendarProps) {
  const [updateRentStatusMutation] = useMutation(updateRentStatus)
  const pendingItems = React.useMemo(
    () => items.filter((item) => item.status === "pending"),
    [items]
  )
  const [selectedItemId, setSelectedItemId] = React.useState<number | null>(null)
  const [itemToAccept, setItemToAccept] = React.useState<DashboardRecentOrder | null>(null)
  const [isAccepting, setIsAccepting] = React.useState(false)
  const [visibleMonth, setVisibleMonth] = React.useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const selectedItem =
    pendingItems.find((item) => item.id === selectedItemId) ?? pendingItems[0] ?? null

  React.useEffect(() => {
    if (selectedItem && selectedItem.id !== selectedItemId) {
      setSelectedItemId(selectedItem.id)
      setVisibleMonth(
        new Date(
          new Date(selectedItem.startDate).getFullYear(),
          new Date(selectedItem.startDate).getMonth(),
          1
        )
      )
    }
  }, [selectedItem, selectedItemId])

  const calendarDays = React.useMemo(() => {
    const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1)
    const calendarStart = new Date(firstDay)
    calendarStart.setDate(firstDay.getDate() - firstDay.getDay())
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(calendarStart)
      day.setDate(calendarStart.getDate() + index)
      return day
    })
  }, [visibleMonth])

  const selectPendingItem = (item: DashboardRecentOrder) => {
    setSelectedItemId(item.id)
    const startDate = new Date(item.startDate)
    setVisibleMonth(new Date(startDate.getFullYear(), startDate.getMonth(), 1))
  }

  const acceptSelectedOrder = async () => {
    if (!itemToAccept || isAccepting) return

    setIsAccepting(true)
    try {
      await updateRentStatusMutation({
        rentItemId: itemToAccept.id,
        action: "accept",
        noteMessage: "accepted",
      })
      setItemToAccept(null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to accept rental."
      console.error("Failed to accept rental from the dashboard:", error)
      toast.error(message)
      setIsAccepting(false)
      return
    }

    setIsAccepting(false)
    toast.success("Rental accepted successfully.")
    try {
      await onOrderAccepted()
    } catch (error: unknown) {
      console.error("Rental accepted, but dashboard orders failed to refresh:", error)
      toast.error("Rental accepted, but the dashboard could not refresh. Reload to see the update.")
    } finally {
      setItemToAccept(null)
    }
  }

  const getDayAvailability = (day: Date) => {
    if (!selectedItem?.productVariant?.id) return null

    const requestedStart = startOfDay(selectedItem.startDate)
    const requestedEnd = startOfDay(selectedItem.endDate)
    if (day < requestedStart || day > requestedEnd) return null

    const variantItems = items.filter(
      (item) =>
        item.productVariant?.id === selectedItem.productVariant?.id &&
        ACTIVE_STATUSES.has(item.status) &&
        startOfDay(item.startDate) <= day &&
        startOfDay(item.endDate) >= day
    )
    const bookedQuantity = variantItems.reduce((total, item) => total + (item.quantity || 0), 0)
    const variantQuantity = selectedItem.productVariant.quantity || 0
    const damagedQuantity = items
      .filter((item) => item.productVariant?.id === selectedItem.productVariant?.id)
      .reduce((total, item) => total + (item.returnedDamagedQty || 0), 0)
    return Math.max(0, variantQuantity - bookedQuantity - damagedQuantity)
  }

  const monthLabel = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  return (
    <section className="grid min-w-0 gap-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm xl:grid-cols-[minmax(0,0.9fr)_minmax(20rem,1.1fr)]">
      <div className="min-w-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Pending orders</h2>
            <p className="mt-1 text-sm text-gray-500">
              Select a request to check item availability.
            </p>
          </div>
          <Link
            href="/shop/orders?status=pending"
            className="shrink-0 text-sm font-semibold text-[#1b2a80] hover:underline"
          >
            View all
          </Link>
        </div>

        {pendingItems.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-lg bg-gray-50 px-4 text-center">
            <p className="font-medium text-gray-700">No pending orders</p>
            <p className="mt-1 text-sm text-gray-500">New requests will appear here.</p>
          </div>
        ) : (
          <ul className="max-h-[26rem] space-y-2 overflow-y-auto pr-1 scrollbar-seamless">
            {pendingItems.map((item) => {
              const isSelected = selectedItem?.id === item.id
              const deliveryMethod = normalizeDeliveryMethod(item.deliveryMethod || "")

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectPendingItem(item)}
                    aria-pressed={isSelected}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      isSelected
                        ? "border-[#1b2a80] bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-gray-900">
                          {item.productVariant?.product?.name || "Rental item"}
                        </span>
                        <span className="mt-1 block truncate text-sm text-gray-600">
                          {getRenterName(item)}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          {formatDateRange(item.startDate, item.endDate)} · Qty {item.quantity || 1}
                          {deliveryMethod ? ` · ${deliveryMethod}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        Pending
                      </span>
                    </span>
                  </button>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    {isSelected && (
                      <Link
                        href={`/shop/orders?status=pending&highlight=${item.id}`}
                        className="inline-flex text-sm font-semibold text-[#1b2a80] hover:underline"
                      >
                        Review order
                      </Link>
                    )}
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => setItemToAccept(item)}
                      sx={{ textTransform: "none", backgroundColor: "#1b2a80" }}
                    >
                      Accept order
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      <div className="min-w-0 rounded-lg bg-gray-50 p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900">Availability calendar</h3>
            <p className="mt-1 text-sm text-gray-600">
              {selectedItem
                ? `${
                    selectedItem.productVariant?.product?.name || "Selected item"
                  } · requested dates`
                : "Select a pending order to view its dates"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
              className="rounded-md p-2 text-gray-600 hover:bg-white"
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </button>
            <span className="min-w-28 text-center text-sm font-semibold text-gray-800">
              {monthLabel}
            </span>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
              className="rounded-md p-2 text-gray-600 hover:bg-white"
            >
              <ArrowForwardIosIcon fontSize="small" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((weekday) => (
            <span key={weekday} className="py-1 text-xs font-semibold text-gray-500">
              {weekday}
            </span>
          ))}
          {calendarDays.map((day) => {
            const isInMonth = day.getMonth() === visibleMonth.getMonth()
            const isRequestedDate =
              !!selectedItem &&
              day >= startOfDay(selectedItem.startDate) &&
              day <= startOfDay(selectedItem.endDate)
            const availability = getDayAvailability(day)
            const hasConflict =
              availability !== null &&
              selectedItem !== null &&
              availability < (selectedItem.quantity || 1)

            return (
              <div
                key={day.toISOString()}
                className={`min-h-14 rounded-md border p-1 text-left ${
                  !isInMonth ? "border-transparent text-gray-300" : "border-gray-200 bg-white"
                } ${
                  isRequestedDate
                    ? hasConflict
                      ? "border-red-300 bg-red-50"
                      : "border-blue-300 bg-blue-50"
                    : ""
                }`}
              >
                <span
                  className={`text-xs ${
                    sameDay(day, new Date()) ? "font-bold text-[#1b2a80]" : "text-gray-700"
                  }`}
                >
                  {day.getDate()}
                </span>
                {isInMonth && availability !== null && (
                  <span
                    className={`mt-1 block text-[10px] font-semibold leading-tight ${
                      hasConflict ? "text-red-700" : "text-emerald-700"
                    }`}
                  >
                    {hasConflict ? "Not enough" : `${availability} available`}
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-gray-600">
          {selectedItem
            ? `Requested quantity: ${
                selectedItem.quantity || 1
              }. Availability subtracts existing active rentals and reported damage.`
            : "Choose a pending order to highlight its requested rental dates and availability."}
        </p>
      </div>

      <Dialog
        open={itemToAccept !== null}
        onClose={() => {
          if (!isAccepting) setItemToAccept(null)
        }}
        aria-labelledby="accept-dashboard-order-title"
      >
        <DialogTitle id="accept-dashboard-order-title">Accept rental request?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Accept the request for &quot;
            {itemToAccept?.productVariant?.product?.name || "this rental item"}&quot;? The renter
            will be notified.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setItemToAccept(null)} disabled={isAccepting}>
            Keep pending
          </Button>
          <Button
            onClick={acceptSelectedOrder}
            disabled={isAccepting}
            variant="contained"
            sx={{ textTransform: "none", backgroundColor: "#1b2a80" }}
          >
            {isAccepting ? "Accepting..." : "Confirm accept"}
          </Button>
        </DialogActions>
      </Dialog>
    </section>
  )
}
