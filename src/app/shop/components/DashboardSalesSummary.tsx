"use client"

import { useState } from "react"
import Link from "next/link"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { useQuery } from "@blitzjs/rpc"
import getShopInvoices from "../../queries/getShopInvoices"

interface Payment {
  amount: number
  createdAt: Date | string
}

interface DashboardMoneySummaryProps {
  payments: Payment[]
}

type IncomePeriod = "30days" | "90days" | "year"

const INCOME_PERIODS: { value: IncomePeriod; label: string }[] = [
  { value: "30days", label: "Last 30 days" },
  { value: "90days", label: "Last 90 days" },
  { value: "year", label: "Year to date" },
]

const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  maximumFractionDigits: 2,
})

function getIncomePeriodRange(period: IncomePeriod, now: Date) {
  const endExclusive = new Date(now)
  endExclusive.setHours(0, 0, 0, 0)
  endExclusive.setDate(endExclusive.getDate() + 1)

  let start: Date
  if (period === "year") {
    start = new Date(now.getFullYear(), 0, 1)
  } else {
    start = new Date(endExclusive)
    start.setDate(start.getDate() - (period === "30days" ? 30 : 90))
  }

  return { start, endExclusive }
}

export default function DashboardMoneySummary({ payments }: DashboardMoneySummaryProps) {
  const [period, setPeriod] = useState<IncomePeriod>("30days")
  const [invoices = [], { isLoading, isError, error }] = useQuery(getShopInvoices, null, {
    suspense: false,
  })

  const now = new Date()
  const { start, endExclusive } = getIncomePeriodRange(period, now)
  const income = payments.reduce((total, payment) => {
    const paymentDate = new Date(payment.createdAt)
    return paymentDate >= start && paymentDate < endExclusive ? total + payment.amount : total
  }, 0)

  const outstandingBalance = invoices.reduce((total, invoice) => total + invoice.balanceDue, 0)
  const unpaidInvoiceCount = invoices.filter((invoice) => invoice.status === "UNPAID").length
  const partiallyPaidInvoiceCount = invoices.filter(
    (invoice) => invoice.status === "PARTIALLY_PAID"
  ).length
  const invoicesNeedingPayment = unpaidInvoiceCount + partiallyPaidInvoiceCount

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Sales summary</h2>
          <p className="mt-1 text-sm text-gray-500">
            Recorded payments and outstanding shop invoices.
          </p>
        </div>
        <Link
          href="/shop/billings"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#1b2a80] hover:underline"
        >
          Billing details <ArrowForwardIcon fontSize="small" />
        </Link>
      </div>

      {isError && (
        <div role="alert" className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load invoice balances:{" "}
          {error instanceof Error ? error.message : "Please try again later."}
        </div>
      )}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-blue-50 p-4">
          <label htmlFor="dashboard-income-period" className="text-sm font-medium text-blue-800">
            Recorded income
          </label>
          <select
            id="dashboard-income-period"
            value={period}
            onChange={(event) => setPeriod(event.target.value as IncomePeriod)}
            className="mt-2 block w-full rounded-md border border-blue-200 bg-white px-2 py-1.5 text-sm text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {INCOME_PERIODS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-3 text-2xl font-bold text-blue-950">{pesoFormatter.format(income)}</p>
          <p className="mt-1 text-xs text-blue-700">Payments recorded during the selected period</p>
        </div>

        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Outstanding balance</p>
          <p className="mt-3 text-2xl font-bold text-red-950">
            {isLoading
              ? "Loading…"
              : isError
              ? "Unavailable"
              : pesoFormatter.format(outstandingBalance)}
          </p>
          <p className="mt-1 text-xs text-red-700">Remaining on all shop invoices</p>
        </div>

        <div className="rounded-lg bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Invoices needing payment</p>
          <p className="mt-3 text-2xl font-bold text-amber-950">
            {isLoading ? "Loading…" : isError ? "Unavailable" : invoicesNeedingPayment}
          </p>
          <p className="mt-1 text-xs text-amber-700">
            {isLoading
              ? "Loading invoice status"
              : isError
              ? "Invoice status unavailable"
              : `${unpaidInvoiceCount} unpaid · ${partiallyPaidInvoiceCount} partially paid`}
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Income reflects payments recorded by your shop; this dashboard does not track payouts.
      </p>
    </section>
  )
}
