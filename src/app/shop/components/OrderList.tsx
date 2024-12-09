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
        <div key={rentItem.id} className="border rounded-lg shadow-md p-4 bg-white flex gap-4 my-2">
          <div>
            <Image
              src={`/uploads/products/${rentItem.productVariant.product.images[0]?.url}`}
              alt={rentItem.productVariant.product.name}
              width={150}
              height={150}
            />
          </div>
          <div className="flex flex-col justify-between">
            <h2 className="text-lg font-semibold">{rentItem.productVariant.product.name}</h2>
            <p>Status: {rentItem.status}</p>

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

          <div>
            <p className="capitalize">
              Renter: {rentItem.rent.user.personalInfo?.firstName}{" "}
              {rentItem.rent.user.personalInfo?.middleName}{" "}
              {rentItem.rent.user.personalInfo?.lastName}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default OrderList
