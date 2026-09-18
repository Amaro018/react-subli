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
} from "@mui/material"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getAllRentOfUser from "../../queries/getAllRentOfUser"
import cancelRentItem from "../../mutations/cancelRentItem" // Ensure path matches your mutation file location
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

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

  const ON_HAND_STATUSES = ["delivered", "picked_up", "in_use"]

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

    const isCompleted = ["completed", "canceled", "returned", "returned_damaged"].includes(
      item.status
    )
    const lapseInDays =
      !isCompleted && today > endDate
        ? Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0
    const penalty = unitPrice * lapseInDays * item.quantity

    const totalPayment =
      item.payments?.reduce((total: number, payment: any) => total + payment.amount, 0) || 0
    const balance = rentAmount - totalPayment + penalty

    return {
      duration,
      rentAmount,
      initialFee,
      lapseInDays,
      penalty,
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
      await refetch()
      handleCloseCancelModal()
    } catch (error) {
      console.error("Failed to cancel rental request:", error)
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

  // Counter logic
  const pendingCount = userRents.filter((rent: any) => {
    return rent.items.some((item: any) => item.status === "pending")
  }).length

  const toPayCount = userRents.filter((rent: any) => {
    return rent.items.some((item: any) => {
      if (["pending", "completed", "canceled"].includes(item.status)) return false
      const { balance } = calculateItemFinancials(item)
      return balance > 0
    })
  }).length

  const toDeliverCount = userRents.filter((rent: any) => {
    return rent.items.some(
      (item: any) => item.deliveryMethod === "deliver" && item.status === "accepted"
    )
  }).length

  const toPickupCount = userRents.filter((rent: any) => {
    return rent.items.some(
      (item: any) => item.deliveryMethod === "pickup" && item.status === "accepted"
    )
  }).length

  const toReturnCount = userRents.filter((rent: any) => {
    return rent.items.some((item: any) => ON_HAND_STATUSES.includes(item.status))
  }).length

  const dueTodayCount = userRents.filter((rent: any) => {
    return rent.items.some((item: any) => {
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
      ? userRents
      : userRents.filter((rent: any) => {
          if (currentStatus === "pending") {
            return rent.items.some((item: any) => item.status === "pending")
          }
          if (currentStatus === "completed") {
            return (
              rent.items.length > 0 &&
              rent.items.every((item: any) =>
                ["completed", "returned", "returned_damaged", "canceled"].includes(item.status)
              )
            )
          }
          if (currentStatus === "to-pay") {
            return rent.items.some((item: any) => {
              if (["pending", "completed", "canceled"].includes(item.status)) return false
              const { balance } = calculateItemFinancials(item)
              return balance > 0
            })
          }
          if (currentStatus === "to-deliver") {
            return rent.items.some(
              (item: any) => item.deliveryMethod === "deliver" && item.status === "accepted"
            )
          }
          if (currentStatus === "to-pickup") {
            return rent.items.some(
              (item: any) => item.deliveryMethod === "pickup" && item.status === "accepted"
            )
          }
          if (currentStatus === "to-return") {
            return rent.items.some((item: any) => ON_HAND_STATUSES.includes(item.status))
          }

          return rent.items.some((item: any) => item.status === currentStatus)
        })

  const filteredRents = [...baseFilteredRents].sort((a: any, b: any) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }

    const getPriority = (rent: any) => {
      const today = new Date()
      let priority = 0
      for (const item of rent.items) {
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
      <div className="border-b border-gray-200 mb-4 pb-1">
        <Box sx={{ width: "100%" }}>
          <Tabs
            value={currentStatus}
            onChange={handleTabChange}
            aria-label="rent status tabs"
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                maxWidth: "none",
                flexGrow: 1,
                flexBasis: 0,
              },
            }}
          >
            <Tab label="All Rentals" value="all" />
            <Tab
              label={
                <Badge badgeContent={pendingCount} color="warning">
                  Pending
                </Badge>
              }
              value="pending"
            />
            <Tab
              label={
                <Badge badgeContent={toPayCount} color="error">
                  To Pay
                </Badge>
              }
              value="to-pay"
            />
            <Tab
              label={
                <Badge badgeContent={toDeliverCount} color="error">
                  To Deliver
                </Badge>
              }
              value="to-deliver"
            />
            <Tab
              label={
                <Badge badgeContent={toPickupCount} color="error">
                  To Pickup
                </Badge>
              }
              value="to-pickup"
            />
            <Tab
              label={
                <Badge badgeContent={toReturnCount} color="error">
                  To Return
                </Badge>
              }
              value="to-return"
            />
            <Tab label="Completed" value="completed" />
          </Tabs>
        </Box>
      </div>

      {/* Rent List */}
      {paginatedRents.length === 0 && (
        <p className="text-center my-8 text-gray-500">{getEmptyMessage()}</p>
      )}
      {paginatedRents.map((rent: any) => (
        <div
          className="border rounded-lg shadow-md p-4 bg-white flex justify-start gap-16 my-4 w-full"
          key={rent.id}
        >
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center w-full border-b border-gray-200 p-2">
              <p className="font-semibold text-gray-700">Order Reference: #{getOrderRef(rent)}</p>
              <p className="text-sm text-gray-500">
                {rent.items.length > 1 ? "Items :" : "Item :"} {rent.items.length}
              </p>
            </div>

            {rent.items.map((item: any) => {
              const {
                duration,
                rentAmount,
                initialFee,
                lapseInDays,
                penalty,
                totalPayment,
                balance,
                unitPrice,
              } = calculateItemFinancials(item)

              const today = new Date()
              const endDate = new Date(item.endDate)
              const isPending = item.status === "pending"
              const isCompleted = [
                "completed",
                "returned",
                "returned_damaged",
                "canceled",
              ].includes(item.status)
              const isDueToday =
                !isCompleted &&
                endDate.getDate() === today.getDate() &&
                endDate.getMonth() === today.getMonth() &&
                endDate.getFullYear() === today.getFullYear()
              const isOverdue = !isCompleted && today > endDate && !isDueToday

              const variantDisplay = item.productVariant?.attributes?.length
                ? item.productVariant.attributes
                    .map((attr: any) => attr.attributeValue?.value)
                    .filter(Boolean)
                    .join(" / ")
                : [item.productVariant?.size, item.productVariant?.color?.name]
                    .filter(Boolean)
                    .join(" - ") || "Default Config"

              const productId = item.productVariant?.product?.id

              return (
                <div
                  key={item.id}
                  className={`flex justify-start items-center w-full border-b p-2 gap-2 transition-all rounded-md my-1 ${
                    isPending ? "bg-amber-50/70 border-amber-300" : "bg-white border-gray-200"
                  }`}
                >
                  <Link href={productId ? `/products/${productId}` : "#"}>
                    <Image
                      src={
                        item.productVariant?.product?.images?.[0]?.url
                          ? `/uploads/products/${item.productVariant.product.images[0].url}`
                          : "/placeholder.png"
                      }
                      alt={item.productVariant?.product?.name || "Product Image"}
                      width={100}
                      height={100}
                      className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  </Link>

                  <div className="flex flex-col justify-between h-full">
                    <div>
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
                          {item.productVariant?.product?.name}
                        </p>
                      )}

                      <p className="text-sm text-gray-500 mt-1">Variant: {variantDisplay}</p>
                      <div className="flex gap-2 mt-2">
                        <p className="capitalize text-xs font-semibold text-gray-600 border border-gray-200 px-2 py-1 rounded-md inline-block w-fit bg-gray-50">
                          Delivery: {item.deliveryMethod}
                        </p>

                        <p
                          className={`capitalize text-xs font-bold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 w-fit ${
                            isPending
                              ? "bg-amber-100 text-amber-900 border border-amber-300"
                              : item.status === "accepted"
                              ? "bg-blue-100 text-blue-800"
                              : item.status === "canceled"
                              ? "bg-red-100 text-red-800"
                              : ["completed", "returned", "returned_damaged"].includes(item.status)
                              ? "bg-green-100 text-green-800"
                              : "bg-indigo-100 text-indigo-800"
                          }`}
                        >
                          {isPending && (
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                            </span>
                          )}
                          Status: {item.status.replace("_", " ")}
                        </p>

                        {isDueToday && (
                          <p className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-md animate-pulse border border-orange-200">
                            Due Today
                          </p>
                        )}
                        {isOverdue && (
                          <p className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded-md animate-pulse border border-red-200">
                            Overdue
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between h-full ml-4">
                    <p>
                      Price : ₱{unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p>Qty : {item.quantity}</p>
                    <p>
                      Rent Range:{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      }).formatRange(new Date(item.startDate), new Date(item.endDate))}{" "}
                      - ({duration} {duration > 1 ? "days" : "day"})
                    </p>
                  </div>

                  <div className="flex flex-col justify-between h-full ml-4">
                    <p>
                      Total Rent : ₱
                      {rentAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-orange-600 font-medium">
                      Initial Fee (50%) : ₱
                      {initialFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p>
                      Penalty :{" "}
                      {item.status === "completed" ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <>
                          ₱{penalty.toLocaleString("en-US", { minimumFractionDigits: 2 })} (
                          {lapseInDays} {lapseInDays === 1 ? "day" : "days"})
                        </>
                      )}
                    </p>

                    <p>
                      Amount Paid :{" "}
                      {item.status === "completed" ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        `₱${totalPayment.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                      )}
                    </p>

                    {["completed", "returned", "returned_damaged"].includes(item.status) ? (
                      <p className="text-green-600 font-bold">Completed</p>
                    ) : item.status === "canceled" ? (
                      <p className="text-red-600 font-bold">Canceled</p>
                    ) : isPending ? (
                      <div className="flex flex-col gap-1 items-start">
                        <p className="text-amber-700 font-semibold text-xs bg-amber-100/80 px-2 py-1 rounded w-fit">
                          Awaiting Shop Approval
                        </p>
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
                    ) : (
                      <p className="font-bold text-[#1b2a80]">
                        Balance : ₱{balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

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
