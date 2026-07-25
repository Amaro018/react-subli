import * as React from "react"
import { Alert } from "@mui/material"
import { useRouter } from "next/navigation"

interface DashboardAlertsProps {
  dueTodayCount: number
  overdueCount: number
}

export default function DashboardAlerts({ dueTodayCount, overdueCount }: DashboardAlertsProps) {
  const router = useRouter()

  return (
    <>
      {overdueCount > 0 && (
        <Alert
          severity="error"
          className="mb-4 rounded-xl shadow-sm border border-red-200 cursor-pointer hover:bg-red-50 transition-colors"
          onClick={() => router.push("/shop/orders?status=overdue")}
        >
          You have <strong>{overdueCount}</strong> overdue {overdueCount > 1 ? "rentals" : "rental"}{" "}
          that require immediate attention!
        </Alert>
      )}
      {dueTodayCount > 0 && (
        <Alert
          severity="warning"
          className="mb-4 rounded-xl shadow-sm border border-orange-200 cursor-pointer hover:bg-orange-50 transition-colors"
          onClick={() => router.push("/shop/orders?status=due_today")}
        >
          You have <strong>{dueTodayCount}</strong> {dueTodayCount > 1 ? "rentals" : "rental"} due
          for return today!
        </Alert>
      )}
    </>
  )
}
