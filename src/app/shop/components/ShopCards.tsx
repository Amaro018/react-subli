"use client"
import * as React from "react"
import { LineChart } from "@mui/x-charts/LineChart"
import getProducts from "../../queries/getProducts"
import { useQuery } from "@blitzjs/rpc"
import getRentItemsByShop from "../../queries/getRentItemsByShop"
import { useParams } from "next/navigation"

import { BarChart } from "@mui/x-charts/BarChart"
export default function ShopCards() {
  const [products, { refetch }] = useQuery(getProducts, {})
  const { shopId } = useParams()
  const productCount = products ? products.length : 0
  const [rentItems] = useQuery(getRentItemsByShop, { shopId })
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear())

  // const getPayments = rentItems.map((rentItem) => {
  //   const payments = rentItem.payments || []
  //   const totalAmount = payments.reduce((total, payment) => total + payment.amount, 0)
  //   const month = new Date(rentItem.createdAt).toLocaleString('default', { month: 'long' })
  //   return {
  //     month: month,
  //     total: totalAmount,
  //   }
  // })

  // const getPayments = rentItems.map((rentItem) => (
  //   rentItem.payments?.map((payment) => payment) || []
  // ))

  const getPayment = rentItems
    .filter((item) => item.payments?.length > 0)
    .map((item) => item.payments?.map((payment) => payment))

  const getPaymentForEachMonth = (month: string) => {
    let totalPay = 0

    getPayment.forEach((item) => {
      item.forEach((payment) => {
        const paymentMonth = new Date(payment.createdAt).toLocaleString("default", {
          month: "long",
        })

        if (paymentMonth === month) {
          totalPay += payment.amount
        }
      })
    })
    return totalPay
  }

  const getPaymentForEachYear = (year: string) => {
    let totalPay = 0

    getPayment.forEach((item) => {
      item.forEach((payment) => {
        const paymentYear = new Date(payment.createdAt).getFullYear().toString()
        if (paymentYear === year) {
          totalPay += payment.amount
        }
      })
    })
    return totalPay
  }

  const uniqueMonths = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Flatten payments from all rent items
  const getPayments = rentItems ? rentItems.map((item) => item.payments || []).flat() : []

  // Get unique years from payments
  const uniqueYear = Array.from(
    new Set(getPayments.map((payment) => new Date(payment.createdAt).getFullYear().toString()))
  )

  // Filter payments for the selected year
  const filteredPayments = getPayments.filter(
    (payment) => new Date(payment.createdAt).getFullYear() === selectedYear
  )

  // Calculate total payments for each month in the selected year
  const totalPaymentsPerMonth = uniqueMonths.map((month) => {
    const paymentsForMonth = filteredPayments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt)
      return paymentDate.toLocaleString("default", { month: "long" }) === month
    })

    return {
      month,
      total: paymentsForMonth.reduce((total, payment) => total + payment.amount, 0),
    }
  })

  // Filter out months with no payments
  const filteredPaymentsPerMonth = totalPaymentsPerMonth.filter((item) => item.total > 0)

  // Handle the select change to update the year
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(Number(e.target.value))
  }

  console.log(totalPaymentsPerMonth)

  // console.log("totalPaymentsPerMonth", totalPaymentsPerMonth)

  // console.log("THE PAYMENTS IS HERE" , getPayments.map(item => item.map(payment => new Date(payment.createdAt).toLocaleString('default', { month: 'long' }))))

  // console.log("rentItems", rentItems.map(item => item.payments.map(payment => new Date(payment.createdAt).toLocaleString('default', { month: 'long' }))))

  // console.log("rentItems total prices", rentItems.map(item => item.payments.reduce((total, payment) => total + payment.amount, 0)))

  let renderedItems = 0
  let orderedItems = 0
  let pendingItems = 0
  let cancelledItems = 0
  let returnedItems = 0

  if (rentItems) {
    for (let i = 0; i < rentItems.length; i++) {
      const rentItem = rentItems[i]
      const status = rentItem.status

      if (status === "rendering" || status === "pending") {
        orderedItems++
      }
      if (status === "rendering") {
        renderedItems++
      } else if (status === "pending") {
        pendingItems++
      } else if (status === "completed") {
        returnedItems++
      } else if (status === "cancelled") {
        cancelledItems++
      }
    }
  }

  return (
    <>
      <div className="w-full flex flex-row text-white gap-2">
        <div className="bg-slate-600 p-4 flex flex-col justify-center items-center rounded-lg w-1/4 gap-4 shadow-lg shadow-slate-500">
          <p className="text-3xl">PRODUCTS</p>

          <p className="text-2xl">{productCount}</p>
        </div>

        <div className="bg-slate-600 p-4 flex flex-col justify-center items-center rounded-lg w-1/4 gap-4 shadow-lg shadow-slate-500">
          <p className="text-3xl">ORDERS</p>

          <p className="text-2xl">{orderedItems}</p>
        </div>

        <div className="bg-slate-600 p-4 flex flex-col justify-center items-center rounded-lg w-1/4 gap-4 shadow-lg shadow-slate-500">
          <p className="text-3xl">RENDERED</p>

          <p className="text-2xl">{renderedItems}</p>
        </div>

        <div className="bg-slate-600 p-4 flex flex-col justify-center items-center rounded-lg w-1/4 gap-4 shadow-lg shadow-slate-500">
          <p className="text-3xl">PENDING</p>

          <p className="text-2xl">{pendingItems}</p>
        </div>
      </div>

      <div className="w-full">
        <div className="mt-12 flex justify-center items-center flex-col">
          <p>Select a year:</p>
          <select
            name="Year"
            id="Year"
            onChange={handleYearChange}
            value={selectedYear}
            className="border border-gray-300 rounded-md p-2"
          >
            {uniqueYear.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full flex justify-center">
          <BarChart
            xAxis={[
              { scaleType: "band", data: filteredPaymentsPerMonth.map((item) => item.month) },
            ]}
            series={[{ data: filteredPaymentsPerMonth.map((item) => item.total) }]}
            width={1000}
            height={600}
          />
        </div>
      </div>
    </>
  )
}
