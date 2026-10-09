"use client"
import * as React from "react"
import getProductByShopId from "../../queries/getProductByShopId"
import { useQuery } from "@blitzjs/rpc"
import getRentItemsByShop from "../../queries/getRentItemsByShop"
import getCurrentUser from "./../../users/queries/getCurrentUser"
import { normalizeDeliveryMethod } from "../../utils/normalizeDeliveryMethod"

import DashboardAlerts from "./DashboardAlerts"
import DashboardStatCards from "./DashboardStatCards"
import DashboardIncomeChart from "./DashboardIncomeChart"
import DashboardRecentOrders from "./DashboardRecentOrders"
import DashboardPendingOrdersCalendar from "./DashboardPendingOrdersCalendar"
import type { DashboardRecentOrder } from "./DashboardRecentOrders"

type Payment = {
  id: number
  amount: number
  createdAt: Date
}

type RentItem = {
  id: number
  status: string
  quantity: number
  deliveryMethod: string
  startDate: Date | string
  endDate: Date | string
  productVariant?: {
    id: number
    quantity: number
  }
  payments: Payment[]
}

function isSameCalendarDay(first: Date | string, second: Date) {
  const firstDate = new Date(first)
  return (
    firstDate.getDate() === second.getDate() &&
    firstDate.getMonth() === second.getMonth() &&
    firstDate.getFullYear() === second.getFullYear()
  )
}

export default function ShopCards() {
  const [currentUser] = useQuery(getCurrentUser, null)
  const shopId = currentUser?.shop?.id

  const [products] = useQuery(getProductByShopId, shopId ? { shopId } : { shopId: 0 }, {
    enabled: !!shopId,
  })
  const productCount = products ? products.length : 0

  const [rentItemsRaw = [], { refetch: refetchRentItems }] = useQuery(
    getRentItemsByShop,
    shopId ? { shopId } : { shopId: 0 },
    {
      enabled: !!shopId,
    }
  )

  const rentItems = rentItemsRaw as unknown as RentItem[]
  const recentOrders = rentItemsRaw as unknown as DashboardRecentOrder[]
  const pendingAndCalendarItems = rentItemsRaw as unknown as DashboardRecentOrder[]

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

  const { pickupTodayCount, deliveryTodayCount, returnsTodayCount } = React.useMemo(() => {
    const today = new Date()
    let pickupToday = 0
    let deliveryToday = 0
    let returnsToday = 0

    rentItems.forEach((item) => {
      if (item.status === "accepted" && isSameCalendarDay(item.startDate, today)) {
        const deliveryMethod = normalizeDeliveryMethod(item.deliveryMethod)
        if (deliveryMethod === "pickup") pickupToday++
        if (deliveryMethod === "delivery") deliveryToday++
      }

      if (
        ["accepted", "rendering", "on_hand", "overdue"].includes(item.status) &&
        isSameCalendarDay(item.endDate, today)
      ) {
        returnsToday++
      }
    })

    return {
      pickupTodayCount: pickupToday,
      deliveryTodayCount: deliveryToday,
      returnsTodayCount: returnsToday,
    }
  }, [rentItems])

  // --- Extract Payments Data ---
  const allPayments = React.useMemo(() => {
    return rentItems.flatMap((item) => item.payments || [])
  }, [rentItems])

  return (
    <div className="mx-auto w-full max-w-screen-2xl space-y-6">
      <DashboardStatCards
        productCount={productCount}
        pickupTodayCount={pickupTodayCount}
        deliveryTodayCount={deliveryTodayCount}
        returnsTodayCount={returnsTodayCount}
      />

      <DashboardAlerts dueTodayCount={dueTodayCount} overdueCount={overdueCount} />
      <DashboardPendingOrdersCalendar
        items={pendingAndCalendarItems}
        onOrderAccepted={refetchRentItems}
      />

      <div className="grid min-w-0 grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
        <DashboardRecentOrders items={recentOrders} />
        <DashboardIncomeChart payments={allPayments} />
      </div>
    </div>
  )
}
