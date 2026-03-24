"use client"
import * as React from "react"
import { LineChart } from "@mui/x-charts/LineChart"
import getAllProducts from "../../queries/getAllProducts"
import { useQuery } from "@blitzjs/rpc"
import getRentItemsByShop from "../../queries/getRentItemsByShop"
import { useParams } from "next/navigation"
import getCurrentUser from "./../../users/queries/getCurrentUser"

import InventoryIcon from "@mui/icons-material/Inventory"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import Inventory2Icon from "@mui/icons-material/Inventory2"
import PendingIcon from "@mui/icons-material/Pending"
import Link from "next/link"
import { BarChart } from "@mui/x-charts/BarChart"

type Payment = {
  id: number
  amount: number
  createdAt: Date
}

type Attribute = {
  id: number
  name: string
}

type AttributeValue = {
  id: number
  value: string
  hexCode: string | null
  attribute: Attribute
}

type RentItem = {
  id: number
  status: string
  createdAt: Date
  updatedAt: Date
  quantity: number
  price: number
  deliveryMethod: string
  startDate: Date
  endDate: Date
  rentId: number
  isRepaired: boolean | null
  payments: Payment[]
}

export default function ShopCards() {
  const [products, { refetch }] = useQuery(getAllProducts, null)
  const [currentUser] = useQuery(getCurrentUser, null)
  const shopId = currentUser?.shop?.id
  const productCount = products ? products.length : 0
  const [rentItemsRaw = []] = useQuery(getRentItemsByShop, shopId ? { shopId } : { shopId: 0 }, {
    enabled: !!shopId,
  })
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear())

  const rentItems = rentItemsRaw as unknown as RentItem[]

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
    .map((item) => item.payments?.map((payment: Payment) => payment))

  const getPaymentForEachMonth = (month: string) => {
    let totalPay = 0

    getPayment.forEach((item) => {
      item.forEach((payment: Payment) => {
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
      item.forEach((payment: Payment) => {
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
    new Set(
      getPayments.map((payment: Payment) => new Date(payment.createdAt).getFullYear().toString())
    )
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
      <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-4">
        <Link href={"/shop/products" as any} className="block h-full">
          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md h-full cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{productCount}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">
              <InventoryIcon />
            </div>
          </div>
        </Link>

        <Link href={"/shop/orders" as any} className="block h-full">
          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md h-full cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{orderedItems}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full text-purple-600">
              <ShoppingBagIcon />
            </div>
          </div>
        </Link>

        <Link href={"/shop/inventory" as any} className="block h-full">
          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md h-full cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-500">On Hand</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{renderedItems}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-full text-orange-600">
              <Inventory2Icon />
            </div>
          </div>
        </Link>

        <Link href={"/shop/orders" as any} className="block h-full">
          <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-between transition-all hover:shadow-md h-full cursor-pointer">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{pendingItems}</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
              <PendingIcon />
            </div>
          </div>
        </Link>
      </div>

      <div className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-800">Monthly Income</h3>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">Year:</p>
            <select
              name="Year"
              id="Year"
              onChange={handleYearChange}
              value={selectedYear}
              className="border border-gray-300 rounded-md p-1 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {uniqueYear.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-full flex justify-center">
          <BarChart
            xAxis={[
              { scaleType: "band", data: filteredPaymentsPerMonth.map((item) => item.month) },
            ]}
            series={[
              { data: filteredPaymentsPerMonth.map((item) => item.total), color: "#1b2a80" },
            ]}
            width={1000}
            height={500}
          />
        </div>
      </div>
    </>
  )
}
