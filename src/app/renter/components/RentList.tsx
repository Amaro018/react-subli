"use client"
import React from "react"
import { Card, CardContent, Typography, Grid, CircularProgress, Alert, Button } from "@mui/material"
import { useQuery } from "@blitzjs/rpc"
import getAllRentOfUser from "../../queries/getAllRentOfUser"
import { useParams } from "next/navigation"
import { user } from "@nextui-org/theme"
import Image from "next/image"
import { p } from "vitest/dist/index-9f5bc072"

export const RentList: React.FC = (props: any) => {
  const currentUser = props.currentUser
  const userId = currentUser.id

  const [userRents, { refetch }] = useQuery(getAllRentOfUser, { id: userId })

  if (!userRents) {
    return <CircularProgress />
  }
  console.log(userRents)
  return (
    <div className="w-full">
      {userRents.length == 0 && <p className="text-center">No rents</p>}
      {userRents.map((rent) => (
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
                  ? Math.ceil((today - endDate) / (1000 * 60 * 60 * 24)) // Days overdue
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
                          (1000 * 60 * 60 * 24)
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
                              (1000 * 60 * 60 * 24)
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
                              (1000 * 60 * 60 * 24)
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
    </div>
  )
}
