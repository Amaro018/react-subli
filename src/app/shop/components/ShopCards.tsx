"use client"
import * as React from "react"
import getProductByShopId from "../../queries/getProductByShopId"
import { useQuery } from "@blitzjs/rpc"
import getRentItemsByShop from "../../queries/getRentItemsByShop"
import getCurrentUser from "./../../users/queries/getCurrentUser"

import DashboardAlerts from "./DashboardAlerts"
import DashboardStatCards from "./DashboardStatCards"
import DashboardIncomeChart from "./DashboardIncomeChart"

type Payment = {
  id: number
  amount: number
  createdAt: Date
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
  const [currentUser] = useQuery(getCurrentUser, null)
  const shopId = currentUser?.shop?.id

  const [products] = useQuery(getProductByShopId, shopId ? { shopId } : { shopId: 0 }, {
    enabled: !!shopId,
  })
  const productCount = products ? products.length : 0

  const [rentItemsRaw = []] = useQuery(getRentItemsByShop, shopId ? { shopId } : { shopId: 0 }, {
    enabled: !!shopId,
  })

  const rentItems = rentItemsRaw as unknown as RentItem[]

  // --- Calculate Alerts Data ---
  const { dueTodayCount, overdueCount } = React.useMemo(() => {
    const today = new Date()
    let due = 0
    let overdue = 0

    rentItems.forEach((item) => {
      const isCompleted = ["completed", "returned", "returned_damaged", "canceled"].includes(
        item.status
      )
      if (isCompleted) return

      const endDate = new Date(item.endDate)
      const isDueToday =
        endDate.getDate() === today.getDate() &&
        endDate.getMonth() === today.getMonth() &&
        endDate.getFullYear() === today.getFullYear()

      const isOverdue = today > endDate && !isDueToday

      if (isDueToday) due++
      else if (isOverdue) overdue++
    })

    return { dueTodayCount: due, overdueCount: overdue }
  }, [rentItems])

  // --- Calculate Stats Data ---
  const { orderedItems, renderedItems, pendingItems } = React.useMemo(() => {
    let ordered = 0
    let rendered = 0
    let pending = 0

    rentItems.forEach((item) => {
      const status = item.status
      if (status === "rendering" || status === "pending") ordered++
      if (status === "rendering") rendered++
      else if (status === "pending") pending++
    })

    return { orderedItems: ordered, renderedItems: rendered, pendingItems: pending }
  }, [rentItems])

  // --- Extract Payments Data ---
  const allPayments = React.useMemo(() => {
    return rentItems.flatMap((item) => item.payments || [])
  }, [rentItems])

  return (
    <>
      <DashboardAlerts dueTodayCount={dueTodayCount} overdueCount={overdueCount} />

      <DashboardStatCards
        productCount={productCount}
        orderedItems={orderedItems}
        renderedItems={renderedItems}
        pendingItems={pendingItems}
      />

      <DashboardIncomeChart payments={allPayments} />
    </>
  )
}
