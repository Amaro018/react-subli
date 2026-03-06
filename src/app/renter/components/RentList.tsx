"use client"
import React, { useState } from "react"
import { Typography, CircularProgress, Button, Box, Tabs, Tab, Badge } from "@mui/material"
import { useQuery } from "@blitzjs/rpc"
import getAllRentOfUser from "../../queries/getAllRentOfUser"
import Image from "next/image"
import { useSearchParams, useRouter, usePathname } from "next/navigation"

export const RentList = (props: any) => {
  const currentUser = props.currentUser
  const userId = currentUser.id
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentStatus = searchParams.get("status") || "all"

  const [userRents] = useQuery(getAllRentOfUser, { id: userId })

  const [currentPage, setCurrentPage] = useState(1) // Current page
  const itemsPerPage = 3

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    const params = new URLSearchParams(searchParams)
    if (newValue === "all") {
      params.delete("status")
    } else {
      params.set("status", newValue)
    }
    router.replace(`${pathname}?${params.toString()}` as any)
    setCurrentPage(1) // Reset to first page on tab change
  }

  const toPayCount = userRents.filter((rent) => {
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

  const toDeliverCount = userRents.filter((rent) => {
    return rent.items.some((item) => item.deliveryMethod === "deliver")
  }).length

  const toPickupCount = userRents.filter((rent) => {
    return rent.items.some((item) => item.deliveryMethod === "pickup")
  }).length

  // Filter rents by status
  const filteredRents =
    currentStatus === "all"
      ? userRents
      : userRents.filter((rent) => {
          // Map URL status to DB status if needed
          if (currentStatus === "completed") return rent.status === "completed"
          if (currentStatus === "to-pay") {
            return rent.items.some((item) => {
              if (item.status === "completed") return false
              const totalPayment = item.payments.reduce(
                (total, payment) => total + payment.amount,
                0
              )
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
          }
          if (currentStatus === "to-deliver")
            return rent.items.some((item) => item.deliveryMethod === "deliver")
          if (currentStatus === "to-pickup")
            return rent.items.some((item) => item.deliveryMethod === "pickup")
          return rent.status === currentStatus
        })

  // Paginate rents
  const totalPages = Math.ceil(filteredRents.length / itemsPerPage)
  const paginatedRents = filteredRents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (!userRents) {
    return <CircularProgress />
  }

  const getEmptyMessage = () => {
    switch (currentStatus) {
      case "completed":
        return "No completed rentals found"
      case "to-pay":
        return "No unpaid rentals found"
      case "to-deliver":
        return "No rentals to be delivered found"
      case "to-pickup":
        return "No rentals to pickup found"
      default:
        return "No rentals found"
    }
  }

  return (
    <div className="w-full">
      {/* Filter Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs
          value={currentStatus}
          onChange={handleTabChange}
          aria-label="rent status tabs"
          variant="fullWidth"
        >
          <Tab label="All Rentals" value="all" />
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
          <Tab label="Completed" value="completed" />
        </Tabs>
      </Box>

      {/* Rent List */}
      {paginatedRents.length === 0 && <p className="text-center">{getEmptyMessage()}</p>}
      {paginatedRents.map((rent) => (
        <div
          className="border rounded-lg shadow-md p-4 bg-white flex justify-start gap-16 my-2 w-full"
          key={rent.id}
        >
          <div className="flex flex-col w-full">
            <div className="flex justify-between items-center w-full border-b border-gray-200 p-2">
              <p>
                {rent.items.length > 1 ? "Items Renting :" : "Item Renting :"} {rent.items.length}
              </p>
              <p className="font-bold bg-gray-200 p-2 rounded-full">{rent.status}</p>
            </div>

            {rent.items.map((item) => {
              const startDate = new Date(item.startDate)
              const endDate = new Date(item.endDate)
              const today = new Date()

              // Check if today is past the end date
              const lapseInDays =
                item.status !== "completed" && today > endDate
                  ? Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)) // Days overdue
                  : 0 // No penalty if today is before or on the end date OR status is "completed"

              const penalty = item.price * lapseInDays * item.quantity
              const totalPayment = item.payments.reduce(
                (total, payment) => total + payment.amount,
                0
              )

              return (
                <div
                  key={item.id}
                  className="flex justify-start items-center w-full border-b border-gray-200 p-2 gap-2"
                >
                  <Image
                    src={`/uploads/products/${item.productVariant.product.images[0]?.url}`}
                    alt={item.productVariant.product.name}
                    width={100}
                    height={100}
                    className="w-24 h-24 object-cover rounded"
                  />

                  <div className="flex flex-col justify-between h-full">
                    <p className="font-bold underline text-slate-600">
                      {item.productVariant.product.shop.shopName}
                    </p>
                    <p>{item.productVariant.product.name}</p>
                    <p>
                      {item.productVariant.size} - {item.productVariant.color.name}
                    </p>
                    <p className="capitalize">{item.deliveryMethod}</p>
                  </div>

                  <div className="flex flex-col justify-between h-full ml-4">
                    <p>Price : {item.productVariant.price}</p>
                    <p>Qty : {item.quantity}</p>
                    <p>
                      Rent Range:{" "}
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      }).formatRange(new Date(item.startDate), new Date(item.endDate))}{" "}
                      - (
                      {Math.ceil(
                        (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) /
                          (1000 * 60 * 60 * 24) +
                          1
                      )}{" "}
                      days)
                    </p>
                  </div>

                  <div className="flex flex-col justify-between h-full ml-4">
                    <p>
                      Total :{" "}
                      {"\u20B1 " +
                        (
                          item.productVariant.price *
                          Math.ceil(
                            (new Date(item.endDate).getTime() -
                              new Date(item.startDate).getTime()) /
                              (1000 * 60 * 60 * 24) +
                              1
                          ) *
                          item.quantity
                        ).toLocaleString("en-PH")}
                    </p>
                    <p>
                      Penalty :{" "}
                      {item.status === "completed" ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        <>
                          {penalty} ({lapseInDays} {lapseInDays > 1 ? "days" : "day"})
                        </>
                      )}
                    </p>

                    <p>
                      Amount Paid :{" "}
                      {item.status === "completed" ? (
                        <span className="text-green-600">Paid</span>
                      ) : (
                        totalPayment
                      )}
                    </p>

                    {item.status == "completed" ? (
                      <p className="text-green-600">Completed</p>
                    ) : (
                      <p>
                        balance :{" "}
                        {item.productVariant.price *
                          Math.ceil(
                            (new Date(item.endDate).getTime() -
                              new Date(item.startDate).getTime()) /
                              (1000 * 60 * 60 * 24) +
                              1
                          ) *
                          item.quantity -
                          totalPayment +
                          penalty}
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
    </div>
  )
}
