"use client"
import React, { useState } from "react"
import { useQuery } from "@blitzjs/rpc"
import getRentItemsByShop from "../../queries/getRentItemsByShop"
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material"
import { useParams } from "next/navigation"
import Image from "next/image"

const statuses = [
  {
    value: "ALL",
    label: "ALL",
  },
  {
    value: "pending",
    label: "PENDING",
  },
  {
    value: "rendering",
    label: "RENDERING",
  },
  {
    value: "completed",
    label: "COMPLETED",
  },
  {
    value: "canceled",
    label: "CANCELED",
  },
]

export const OrderList = () => {
  const { shopId } = useParams()
  const [rentItems, { refetch }] = useQuery(getRentItemsByShop, { shopId })
  const [statusFilter, setStatusFilter] = useState("ALL")

  // Filter the rentItems based on the selected status
  const filteredRentItems =
    statusFilter === "ALL" ? rentItems : rentItems.filter((item) => item.status === statusFilter)

  return (
    <div>
      <div className="flex gap-4 justify-between items-center mb-4">
        <h1 className="font-bold text-xl">Rent Items for Shop {shopId}</h1>
        <TextField
          id="outlined-select-status"
          select
          label="Filter by Status"
          value={statusFilter}
          className="w-48"
          onChange={(e) => setStatusFilter(e.target.value)} // Update the filter
        >
          {statuses.map((status) => (
            <MenuItem key={status.value} value={status.value}>
              {status.label}
            </MenuItem>
          ))}
        </TextField>
      </div>

      {filteredRentItems.map((rentItem) => (
        <div
          key={rentItem.id}
          className="border rounded-lg shadow-md p-4 bg-white flex justify-start gap-16 my-2"
        >
          <div className="">
            <Image
              src={`/uploads/products/${rentItem.productVariant.product.images[0]?.url}`}
              alt={rentItem.productVariant.product.name}
              width={250}
              height={150}
              className="w-48 h-48 object-cover"
            />
          </div>
          <div className="flex flex-col justify-between">
            <h2 className="text-lg font-semibold">{rentItem.productVariant.product.name}</h2>
            <div className="flex gap-2">
              <p>
                Rent Range:{" "}
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }).formatRange(new Date(rentItem.startDate), new Date(rentItem.endDate))}
              </p>
              <p>
                (
                {Math.ceil(
                  (new Date(rentItem.endDate).getTime() - new Date(rentItem.startDate).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="">Variant:</label>
              <p>{rentItem.productVariant.size} -</p>
              {rentItem.productVariant.color.name}{" "}
              <span
                className="w-4 h-4 inline-block rounded-full"
                style={{ backgroundColor: rentItem.productVariant.color.hexCode }}
              ></span>
            </div>
            <p>Quantity: {rentItem.quantity}</p>

            <p>
              Price:{" "}
              {Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "PHP",
              }).format(rentItem.price)}
            </p>
            <p>
              Total Price:{" "}
              {Intl.NumberFormat("en-US", { style: "currency", currency: "PHP" }).format(
                rentItem.price *
                  rentItem.quantity *
                  Math.ceil(
                    (new Date(rentItem.endDate).getTime() -
                      new Date(rentItem.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )
              )}
            </p>
          </div>

          <div className="capitalize">
            <p>
              Renter: {rentItem.rent.user.personalInfo?.firstName}{" "}
              {rentItem.rent.user.personalInfo?.middleName}{" "}
              {rentItem.rent.user.personalInfo?.lastName}
            </p>
            <p>Email: {rentItem.rent.user.email}</p>
            <p>Phone: {rentItem.rent.user.personalInfo?.phoneNumber}</p>
            <p>Address: {rentItem.rent.deliveryAddress}</p>
            <p>Delivery method : {rentItem.deliveryMethod}</p>
          </div>

          <div className="flex justify-end w-1/4">
            <div>
              <Stepper
                activeStep={
                  rentItem.status === "pending" ? 0 : rentItem.status === "rendering" ? 1 : 2
                }
              >
                <Step>
                  <StepLabel>Pending</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Rendering</StepLabel>
                </Step>
                <Step>
                  <StepLabel>Completed</StepLabel>
                </Step>
              </Stepper>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrderList
