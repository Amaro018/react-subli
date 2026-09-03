import * as React from "react"
import { BarChart } from "@mui/x-charts/BarChart"

interface Payment {
  id: number
  amount: number
  createdAt: Date
}

interface DashboardIncomeChartProps {
  payments: Payment[]
}

const UNIQUE_MONTHS = [
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

export default function DashboardIncomeChart({ payments }: DashboardIncomeChartProps) {
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear())

  const uniqueYears = React.useMemo(() => {
    const years = payments.map((p) => new Date(p.createdAt).getFullYear())
    const distinctYears = Array.from(new Set(years))
    if (!distinctYears.includes(new Date().getFullYear())) {
      distinctYears.push(new Date().getFullYear())
    }
    return distinctYears.sort((a, b) => b - a) // sort descending
  }, [payments])

  const chartData = React.useMemo(() => {
    const filteredPayments = payments.filter(
      (p) => new Date(p.createdAt).getFullYear() === selectedYear
    )

    const monthlyTotals = UNIQUE_MONTHS.map((month) => {
      const monthPayments = filteredPayments.filter((p) => {
        return new Date(p.createdAt).toLocaleString("default", { month: "long" }) === month
      })
      return {
        month,
        total: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      }
    })

    return monthlyTotals.filter((item) => item.total > 0)
  }, [payments, selectedYear])

  return (
    <div className="w-full bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Monthly Income</h3>
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">Year:</p>
          <select
            name="Year"
            id="Year"
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            value={selectedYear}
            className="border border-gray-300 rounded-md p-1 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            {uniqueYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="w-full flex justify-center">
        {chartData.length > 0 ? (
          <BarChart
            xAxis={[{ scaleType: "band", data: chartData.map((item) => item.month) }]}
            series={[{ data: chartData.map((item) => item.total), color: "#1b2a80" }]}
            width={1000}
            height={500}
          />
        ) : (
          <div className="flex items-center justify-center h-[500px] text-gray-500">
            No income data available for {selectedYear}
          </div>
        )}
      </div>
    </div>
  )
}
