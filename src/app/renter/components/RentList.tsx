"use client"
import React, { useState } from "react"
import {
  Typography,
  CircularProgress,
  Button,
  Box,
  Tabs,
  Tab,
  Badge,
  Alert,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getAllRentOfUser from "../../queries/getAllRentOfUser"
import cancelRentItem from "../../mutations/cancelRentItem"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { toast } from "@/src/app/utils/toast"
import { normalizeDeliveryMethod } from "../../utils/normalizeDeliveryMethod"

export const RentList = (props: any) => {
  const currentUser = props.currentUser
  const userId = currentUser.id
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentStatus = searchParams.get("status") || "all"
  const sortBy = searchParams.get("sortBy") || "urgency"

  // Cancel Action State
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null)
  const [isCanceling, setIsCanceling] = useState(false)

  const ON_HAND_STATUSES = ["on_hand", "overdue"]

  const [cancelRentItemMutation] = useMutation(cancelRentItem)
  const [userRents, { refetch }] = useQuery(getAllRentOfUser, { id: userId })

  const calculateItemFinancials = (item: any) => {
    const startDate = new Date(item.startDate)
    const endDate = new Date(item.endDate)
    const today = new Date()

    let diffMs = endDate.getTime() - startDate.getTime()
    diffMs += (endDate.getTimezoneOffset() - startDate.getTimezoneOffset()) * 60 * 1000
    const duration = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

    const unitPrice = item.price || item.productVariant?.price || 0
    const rentAmount = unitPrice * duration * item.quantity
    const initialFee = rentAmount * 0.5

    const isReturned = ["returned", "returned_damaged"].includes(item.status)
    const isClosed = ["completed", "canceled", "returned", "returned_damaged"].includes(item.status)
    const lapseInDays =
      !isClosed && today > endDate
        ? Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0
    const recordedCharges =
      item.charges?.reduce((total: number, charge: any) => total + charge.amount, 0) || 0
    const recordedPenalties =
      item.payments?.reduce(
        (total: number, payment: any) => total + (payment.penaltyFee || 0),
        0
      ) || 0
    const penalty = unitPrice * lapseInDays * item.quantity + recordedCharges + recordedPenalties

    const totalPayment =
      item.payments?.reduce((total: number, payment: any) => total + payment.amount, 0) || 0
    const balance = rentAmount - totalPayment + penalty

    return {
      duration,
      rentAmount,
      initialFee,
      lapseInDays,
      penalty,
      isReturned,
      totalPayment,
      balance,
      unitPrice,
    }
  }

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 3

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const params = new URLSearchParams(searchParams)
    if (newValue === "all") {
      params.delete("status")
    } else {
      params.set("status", newValue)
    }
    router.replace(`${pathname}?${params.toString()}` as any)
    setCurrentPage(1)
  }

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams)
    params.set("sortBy", event.target.value)
    router.replace(`${pathname}?${params.toString()}` as any)
    setCurrentPage(1)
  }

  const handleOpenCancelModal = (itemId: number) => {
    setSelectedItemId(itemId)
    setCancelModalOpen(true)
  }

  const handleCloseCancelModal = () => {
    setSelectedItemId(null)
    setCancelModalOpen(false)
  }

  const handleConfirmCancel = async () => {
    if (!selectedItemId) return
    try {
      setIsCanceling(true)
      await cancelRentItemMutation({ itemId: selectedItemId })
      handleCloseCancelModal()
      toast.success("Rental request canceled.")
      try {
        await refetch()
      } catch {
        toast.error("The request was canceled, but the rental list could not be refreshed.")
      }
    } catch (error) {
      console.error("Failed to cancel rental request:", error)
      toast.error(error instanceof Error ? error.message : "Failed to cancel rental request.")
    } finally {
      setIsCanceling(false)
    }
  }

  const getOrderRef = (rent: any) => {
    return rent.referenceNumber || rent.orderNumber || `ORD-${String(rent.id).padStart(5, "0")}`
  }

  if (!userRents) {
    return <CircularProgress />
  }

  // Normalize full rents and flattened rent items into one entry per order.
  const rentsList = Array.isArray(userRents)
    ? Array.from(
        userRents
          .reduce((groupedRents: Map<number, any>, record: any) => {
            const rent = Array.isArray(record.items) ? record : { ...record.rent, items: [record] }
            const existingRent = groupedRents.get(rent.id)

            if (existingRent) {
              const existingItemIds = new Set(existingRent.items.map((item: any) => item.id))
              existingRent.items.push(
                ...rent.items.filter((item: any) => !existingItemIds.has(item.id))
              )
            } else {
              groupedRents.set(rent.id, rent)
            }

            return groupedRents
          }, new Map<number, any>())
          .values()
      )
    : []

  // Counter logic with optional chaining
  const pendingCount = rentsList.filter((rent: any) => {
    return rent.items?.some((item: any) => item.status === "pending")
  }).length

  const toPayCount = rentsList.filter((rent: any) => {
    return rent.items?.some((item: any) => {
      if (["pending", "completed", "canceled"].includes(item.status)) {
        return false
      }
      const { balance } = calculateItemFinancials(item)
      return balance > 0
    })
  }).length

  const toDeliverCount = rentsList.filter((rent: any) => {
    return rent.items?.some(
      (item: any) =>
        normalizeDeliveryMethod(item.deliveryMethod) === "delivery" && item.status === "accepted"
    )
  }).length

  const toPickupCount = rentsList.filter((rent: any) => {
    return rent.items?.some(
      (item: any) =>
        normalizeDeliveryMethod(item.deliveryMethod) === "pickup" && item.status === "accepted"
    )
  }).length

  const toReturnCount = rentsList.filter((rent: any) => {
    return rent.items?.some((item: any) => ON_HAND_STATUSES.includes(item.status))
  }).length

  const getItemsForCurrentTab = (rent: any) => {
    const items = rent.items || []

    switch (currentStatus) {
      case "pending":
        return items.filter((item: any) => item.status === "pending")
      case "to-pay":
        return items.filter((item: any) => {
          if (["pending", "completed", "canceled"].includes(item.status)) return false
          return calculateItemFinancials(item).balance > 0
        })
      case "to-deliver":
        return items.filter(
          (item: any) =>
            normalizeDeliveryMethod(item.deliveryMethod) === "delivery" &&
            item.status === "accepted"
        )
      case "to-pickup":
        return items.filter(
          (item: any) =>
            normalizeDeliveryMethod(item.deliveryMethod) === "pickup" && item.status === "accepted"
        )
      case "to-return":
        return items.filter((item: any) => ON_HAND_STATUSES.includes(item.status))
      case "completed":
        return items.filter((item: any) => ["completed", "canceled"].includes(item.status))
      case "all":
        return items
      default:
        return items.filter((item: any) => item.status === currentStatus)
    }
  }

  const currentTabDescription: Record<string, string> = {
    all: "Showing all your rental items.",
    pending: "Showing items waiting for shop approval.",
    "to-pay": "Showing only items with an outstanding balance.",
    "to-deliver": "Showing accepted items that are scheduled for delivery.",
    "to-pickup": "Showing accepted items that are ready for pickup.",
    "to-return": "Showing items currently with you that need to be returned.",
    completed: "Showing finished or canceled rental items.",
  }

  const renderTabLabel = (
    label: string,
    description: string,
    count?: number,
    badgeColor: "warning" | "error" = "error"
  ) => (
    <span className="inline-flex items-center gap-1.5">
      {count === undefined ? (
        <span>{label}</span>
      ) : (
        <Badge badgeContent={count} color={badgeColor}>
          <span>{label}</span>
        </Badge>
      )}
      <Tooltip title={description} arrow>
        <InfoOutlinedIcon
          aria-label={`About ${label}`}
          className="text-gray-500"
          sx={{ fontSize: 16 }}
        />
      </Tooltip>
    </span>
  )

  const dueTodayCount = rentsList.filter((rent: any) => {
    return rent.items?.some((item: any) => {
      if (["completed", "returned", "returned_damaged", "canceled"].includes(item.status))
        return false
      const endDate = new Date(item.endDate)
      const today = new Date()
      return (
        endDate.getDate() === today.getDate() &&
        endDate.getMonth() === today.getMonth() &&
        endDate.getFullYear() === today.getFullYear()
      )
    })
  }).length

  // Main filter switch
  const baseFilteredRents =
    currentStatus === "all"
      ? rentsList
      : rentsList.filter((rent: any) => {
          const items = rent.items || []
          if (currentStatus === "pending") {
            return items.some((item: any) => item.status === "pending")
          }
          if (currentStatus === "completed") {
            return (
              items.length > 0 &&
              items.every((item: any) => ["completed", "canceled"].includes(item.status))
            )
          }
          if (currentStatus === "to-pay") {
            return items.some((item: any) => {
              if (["pending", "completed", "canceled"].includes(item.status)) {
                return false
              }
              const { balance } = calculateItemFinancials(item)
              return balance > 0
            })
          }
          if (currentStatus === "to-deliver") {
            return items.some(
              (item: any) =>
                normalizeDeliveryMethod(item.deliveryMethod) === "delivery" &&
                item.status === "accepted"
            )
          }
          if (currentStatus === "to-pickup") {
            return items.some(
              (item: any) =>
                normalizeDeliveryMethod(item.deliveryMethod) === "pickup" &&
                item.status === "accepted"
            )
          }
          if (currentStatus === "to-return") {
            return items.some((item: any) => ON_HAND_STATUSES.includes(item.status))
          }

          return items.some((item: any) => item.status === currentStatus)
        })

  const filteredRents = [...baseFilteredRents].sort((a: any, b: any) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }

    const getPriority = (rent: any) => {
      const today = new Date()
      let priority = 0
      const items = rent.items || []
      for (const item of items) {
        const isCompleted = ["completed", "returned", "returned_damaged", "canceled"].includes(
          item.status
        )
        if (isCompleted) continue

        const endDate = new Date(item.endDate)
        const isDueToday =
          endDate.getDate() === today.getDate() &&
          endDate.getMonth() === today.getMonth() &&
          endDate.getFullYear() === today.getFullYear()
        const isOverdue = today > endDate && !isDueToday

        if (isOverdue) return 2
        if (isDueToday) priority = Math.max(priority, 1)
      }
      return priority
    }
    return getPriority(b) - getPriority(a)
  })

  const totalPages = Math.ceil(filteredRents.length / itemsPerPage)
  const paginatedRents = filteredRents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getEmptyMessage = () => {
    switch (currentStatus) {
      case "pending":
        return "No pending rental requests awaiting approval"
      case "completed":
        return "No completed rentals found"
      case "to-pay":
        return "No accepted rentals with pending balance found"
      case "to-deliver":
        return "No rentals awaiting delivery"
      case "to-pickup":
        return "No rentals ready for pickup"
      case "to-return":
        return "No rentals currently on hand to return"
      default:
        return "No rentals found"
    }
  }

  return (
    <div className="w-full">
      {/* Header Container */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex-1 w-full flex flex-col gap-2">
          {pendingCount > 0 && (
            <Alert
              severity="info"
              className="rounded-xl shadow-sm border border-amber-300 bg-amber-50 text-amber-900"
            >
              You have <strong>{pendingCount}</strong> {pendingCount > 1 ? "rentals" : "rental"}{" "}
              pending approval from the shop.
            </Alert>
          )}

          {dueTodayCount > 0 && (
            <Alert severity="warning" className="rounded-xl shadow-sm border border-orange-200">
              You have <strong>{dueTodayCount}</strong> {dueTodayCount > 1 ? "orders" : "order"} due
              for return today!
            </Alert>
          )}
        </div>

        <div className="min-w-[160px] self-end md:self-center">
          <TextField
            select
            label="Sort By"
            size="small"
            value={sortBy}
            onChange={handleSortChange}
            sx={{
              minWidth: 160,
              "& .MuiOutlinedInput-root": { borderRadius: "8px", backgroundColor: "#fff" },
            }}
          >
            <MenuItem value="urgency">Urgency (Due Soon)</MenuItem>
            <MenuItem value="newest">Recency (Newest First)</MenuItem>
          </TextField>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <Box sx={{ width: "100%" }}>
          <Tabs
            value={currentStatus}
            onChange={handleTabChange}
            aria-label="rent status tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              "& .MuiTab-root": {
                minWidth: 112,
                px: 2,
              },
            }}
          >
            <Tab label={renderTabLabel("All Rentals", currentTabDescription.all)} value="all" />
            <Tab
              label={renderTabLabel(
                "Pending",
                currentTabDescription.pending,
                pendingCount,
                "warning"
              )}
              value="pending"
            />
            <Tab
              label={renderTabLabel("Balance Due", currentTabDescription["to-pay"], toPayCount)}
              value="to-pay"
            />
            <Tab
              label={renderTabLabel(
                "To Deliver",
                currentTabDescription["to-deliver"],
                toDeliverCount
              )}
              value="to-deliver"
            />
            <Tab
              label={renderTabLabel("To Pickup", currentTabDescription["to-pickup"], toPickupCount)}
              value="to-pickup"
            />
            <Tab
              label={renderTabLabel("To Return", currentTabDescription["to-return"], toReturnCount)}
              value="to-return"
            />
            <Tab
              label={renderTabLabel("Completed", currentTabDescription.completed)}
              value="completed"
            />
          </Tabs>
        </Box>
      </div>

      {/* Rent List */}
      {paginatedRents.length === 0 && (
        <p className="text-center my-8 text-gray-500">{getEmptyMessage()}</p>
      )}
      {paginatedRents.map((rent: any) => {
        const allItems = rent.items || []
        const items = getItemsForCurrentTab(rent)
        return (
          <div
            className="mb-4 w-full overflow-hidden rounded-lg border bg-white shadow-sm"
            key={rent.id}
          >
            <div className="flex w-full flex-col">
              <div className="flex w-full items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
                <p className="font-semibold text-gray-700">REF NO: #{getOrderRef(rent)}</p>
                <p className="shrink-0 text-sm text-gray-500">
                  {items.length === allItems.length
                    ? `${items.length > 1 ? "Items" : "Item"}: ${items.length}`
                    : `Matching items: ${items.length} of ${allItems.length}`}
                </p>
              </div>

              <div className="divide-y divide-gray-100 px-3 sm:px-4">
                {items.map((item: any) => {
                  const {
                    duration,
                    rentAmount,
                    initialFee,
                    lapseInDays,
                    penalty,
                    totalPayment,
                    balance,
                    unitPrice,
                    isReturned,
                  } = calculateItemFinancials(item)

                  const today = new Date()
                  const endDate = new Date(item.endDate)
                  const isPending = item.status === "pending"
                  const isClosed = [
                    "completed",
                    "returned",
                    "returned_damaged",
                    "canceled",
                  ].includes(item.status)
                  const isDueToday =
                    !isClosed &&
                    endDate.getDate() === today.getDate() &&
                    endDate.getMonth() === today.getMonth() &&
                    endDate.getFullYear() === today.getFullYear()
                  const isOverdue = !isClosed && today > endDate && !isDueToday
                  const isDeliveryTab = currentStatus === "to-deliver"
                  const isPickupTab = currentStatus === "to-pickup"
                  const isReturnTab = currentStatus === "to-return"
                  const isHandoffTab = isDeliveryTab || isPickupTab
                  const isActionTab = isHandoffTab || isReturnTab
                  const shop = item.productVariant?.product?.shop
                  const shopAddress = [
                    shop?.street,
                    shop?.barangay,
                    shop?.city,
                    shop?.province,
                    shop?.zipCode,
                    shop?.country,
                  ]
                    .filter(Boolean)
                    .join(", ")
                  const formatHandoffDate = (value: Date | string) =>
                    new Intl.DateTimeFormat("en-PH", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    }).format(new Date(value))

                  const variantDisplay = item.productVariant?.attributes?.length
                    ? item.productVariant.attributes
                        .map((attr: any) => attr.attributeValue?.value)
                        .filter(Boolean)
                        .join(" / ")
                    : [item.productVariant?.size, item.productVariant?.color?.name]
                        .filter(Boolean)
                        .join(" - ") || "Default Config"

                  const productId = item.productVariant?.product?.id
                  const supportParams = new URLSearchParams({
                    orderRef: String(getOrderRef(rent)),
                    itemId: String(item.id),
                    itemName: item.productVariant?.product?.name || "Rental item",
                  })

                  return (
                    <div
                      key={item.id}
                      className={`flex w-full flex-col gap-3 border-b py-4 transition-all ${
                        isPending ? "bg-amber-50/70" : "bg-white"
                      }`}
                    >
                      <div className="flex flex-col gap-2 px-1 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-bold text-[#1b2a80] cursor-pointer">
                            {item.productVariant?.product?.shop?.shopName || "Shop"}
                          </p>

                          {productId ? (
                            <Link
                              href={`/products/${productId}`}
                              className="text-lg font-semibold hover:text-blue-600 hover:underline text-gray-900 transition-colors"
                            >
                              {item.productVariant?.product?.name}
                            </Link>
                          ) : (
                            <p className="text-lg font-semibold">
                              {item.productVariant?.product?.name || "Rental item"}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold capitalize ${
                              isPending
                                ? "border-amber-300 bg-amber-100 text-amber-900"
                                : item.status === "accepted"
                                ? "bg-blue-100 text-blue-800"
                                : item.status === "canceled"
                                ? "bg-red-100 text-red-800"
                                : item.status === "completed" || (isReturned && balance <= 0)
                                ? "bg-green-100 text-green-800"
                                : isReturned
                                ? "border-amber-300 bg-amber-100 text-amber-900"
                                : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {isPending && (
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                              </span>
                            )}
                            {isReturned && balance > 0
                              ? `${item.status.replace("_", " ")} · balance due`
                              : item.status.replace("_", " ")}
                          </span>
                          {isDueToday && (
                            <span className="rounded-md border border-orange-200 bg-orange-100 px-2 py-1 text-xs font-bold text-orange-800">
                              Due Today
                            </span>
                          )}
                          {isOverdue && (
                            <span className="rounded-md border border-red-200 bg-red-100 px-2 py-1 text-xs font-bold text-red-800">
                              Overdue
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 px-1 sm:grid-cols-[96px_minmax(0,1.3fr)_minmax(0,1.2fr)] lg:grid-cols-[96px_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(190px,1fr)]">
                        <Link
                          className="shrink-0"
                          href={productId ? `/products/${productId}` : "#"}
                        >
                          <Image
                            src={
                              item.productVariant?.product?.images?.[0]?.url
                                ? `/uploads/products/${item.productVariant.product.images[0].url}`
                                : "/placeholder.png"
                            }
                            alt={item.productVariant?.product?.name || "Product Image"}
                            width={100}
                            height={100}
                            className="h-24 w-24 rounded object-cover transition-opacity hover:opacity-90"
                          />
                        </Link>

                        <div className="min-w-0 space-y-2 text-sm">
                          <p>
                            <span className="font-semibold text-gray-700">Variant:</span>{" "}
                            <span className="text-gray-600">{variantDisplay}</span>
                          </p>
                          <p>
                            <span className="font-semibold text-gray-700">Method:</span>{" "}
                            <span className="text-gray-600">
                              {normalizeDeliveryMethod(item.deliveryMethod) === "delivery"
                                ? "Delivery"
                                : "Pickup"}
                            </span>
                          </p>
                          <p>
                            <span className="font-semibold text-gray-700">Quantity:</span>{" "}
                            <span className="text-gray-600">{item.quantity}</span>
                          </p>
                          <Link
                            href={{
                              pathname: "/support",
                              query: Object.fromEntries(supportParams.entries()),
                            }}
                            className="inline-block pt-1 text-sm font-semibold text-[#1b2a80] underline underline-offset-2 hover:text-blue-700"
                          >
                            Get help with this rental
                          </Link>
                        </div>

                        <div className="min-w-0 space-y-2 text-sm">
                          <p className="font-semibold text-gray-700">
                            {isReturnTab ? "Return deadline" : "Rental dates"}
                          </p>
                          <p className="text-gray-600">
                            {isHandoffTab
                              ? formatHandoffDate(item.startDate)
                              : isReturnTab
                              ? formatHandoffDate(item.endDate)
                              : new Intl.DateTimeFormat("en-US", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }).formatRange(new Date(item.startDate), new Date(item.endDate))}
                          </p>
                          {isActionTab && (
                            <div className="break-words rounded-md border border-blue-200 bg-blue-50 p-2.5 text-gray-700">
                              <p className="font-semibold text-[#1b2a80]">
                                {isDeliveryTab
                                  ? "Deliver to"
                                  : isPickupTab
                                  ? "Pickup location"
                                  : isDueToday
                                  ? "Return due today"
                                  : isOverdue
                                  ? "Return overdue"
                                  : "Shop location"}
                              </p>
                              <p className="mt-1">
                                {isDeliveryTab
                                  ? rent.deliveryAddress || "Delivery address not available."
                                  : shopAddress ||
                                    `Contact ${shop?.shopName || "the shop"} to confirm the ${
                                      isReturnTab ? "return" : "pickup"
                                    } location.`}
                              </p>
                              {isReturnTab ? (
                                <p className="mt-1 text-xs text-gray-600">
                                  Confirm with the shop whether to return in person or arrange
                                  collection.
                                </p>
                              ) : (
                                <p className="mt-1 text-xs text-gray-600">
                                  Return by {formatHandoffDate(item.endDate)}
                                </p>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-gray-500">
                            {duration} {duration === 1 ? "day" : "days"} · ₱
                            {unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}/day
                          </p>
                        </div>

                        <div className="rounded-md bg-gray-50 p-3 text-sm">
                          <p className="mb-2 font-semibold text-gray-700">Rental amounts</p>
                          <div className="space-y-1.5">
                            <p className="flex justify-between gap-3">
                              <span>Total rent</span>
                              <span className="font-medium">
                                ₱{rentAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </span>
                            </p>
                            <p className="flex justify-between gap-3 text-orange-700">
                              <span>Initial fee (50%)</span>
                              <span>
                                ₱
                                {initialFee.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                })}
                              </span>
                            </p>
                            <p className="flex justify-between gap-3">
                              <span>Penalties &amp; fees</span>
                              <span>
                                {item.status === "completed"
                                  ? "Paid"
                                  : `₱${penalty.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                    })} (${lapseInDays} ${lapseInDays === 1 ? "day" : "days"})`}
                              </span>
                            </p>
                            <p className="flex justify-between gap-3">
                              <span>Amount paid</span>
                              <span>
                                {item.status === "completed"
                                  ? "Paid"
                                  : `₱${totalPayment.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                    })}`}
                              </span>
                            </p>
                            {item.status === "completed" ? (
                              <p className="pt-1 font-bold text-green-600">Completed</p>
                            ) : item.status === "canceled" ? (
                              <p className="pt-1 font-bold text-red-600">Canceled</p>
                            ) : isPending ? (
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <span className="font-semibold text-amber-700">
                                  Awaiting approval
                                </span>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleOpenCancelModal(item.id)}
                                  sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.2 }}
                                >
                                  Cancel Request
                                </Button>
                              </div>
                            ) : isReturned && balance <= 0 ? (
                              <p className="flex justify-between gap-3 border-t border-gray-200 pt-1.5 font-bold text-green-700">
                                <span>Final balance</span>
                                <span>₱0.00</span>
                              </p>
                            ) : (
                              <p className="flex justify-between gap-3 border-t border-gray-200 pt-1.5 font-bold text-[#1b2a80]">
                                <span>{isReturned ? "Final balance due" : "Balance"}</span>
                                <span>
                                  ₱
                                  {balance.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                  })}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center my-4 items-center">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
            Previous
          </Button>
          <Typography className="mx-2">
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Confirmation Modal */}
      <Dialog open={cancelModalOpen} onClose={handleCloseCancelModal}>
        <DialogTitle>Cancel Rental Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this pending rental request? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelModal} disabled={isCanceling}>
            Keep Request
          </Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
            disabled={isCanceling}
          >
            {isCanceling ? "Canceling..." : "Confirm Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
