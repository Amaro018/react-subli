import * as React from "react"
import Link from "next/link"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined"
import type { DashboardRecentOrder } from "./DashboardRecentOrders"

interface InventoryVariant {
  id: number
  quantity: number
  attributes?: {
    attributeValue?: {
      value?: string
    } | null
  }[]
  rentItems?: Pick<DashboardRecentOrder, "status" | "quantity" | "returnedDamagedQty">[]
}

export interface InventoryHealthProduct {
  id: number
  name: string
  status: string
  variants: InventoryVariant[]
}

interface DashboardInventoryHealthProps {
  products: InventoryHealthProduct[]
  isLoading: boolean
  errorMessage: string | null
}

interface InventoryIssue {
  productId: number
  productName: string
  variantId: number
  variantName: string
  available: number
  damaged: number
}

const CURRENTLY_UNAVAILABLE_STATUSES = new Set(["rendering", "on_hand", "overdue"])

function getVariantName(variant: InventoryVariant) {
  const values = variant.attributes
    ?.map((attribute) => attribute.attributeValue?.value)
    .filter((value): value is string => Boolean(value))

  return values?.length ? values.join(" / ") : "Default option"
}

function getInventoryIssues(products: InventoryHealthProduct[]) {
  const issues: InventoryIssue[] = []
  let outOfStockVariants = 0
  let lowStockVariants = 0
  let damagedUnits = 0

  products.forEach((product) => {
    if (product.status !== "active") return

    product.variants.forEach((variant) => {
      const rentItems = variant.rentItems || []
      const unavailable = rentItems.reduce(
        (total, rentItem) =>
          total +
          (CURRENTLY_UNAVAILABLE_STATUSES.has(rentItem.status) ? rentItem.quantity || 0 : 0),
        0
      )
      const damaged = rentItems.reduce(
        (total, rentItem) => total + (rentItem.returnedDamagedQty || 0),
        0
      )
      const available = Math.max(0, variant.quantity - unavailable - damaged)

      damagedUnits += damaged
      if (available === 0) outOfStockVariants++
      else if (available <= 2) lowStockVariants++

      if (available <= 2 || damaged > 0) {
        issues.push({
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          variantName: getVariantName(variant),
          available,
          damaged,
        })
      }
    })
  })

  issues.sort((first, second) => {
    if ((first.available === 0) !== (second.available === 0)) {
      return first.available === 0 ? -1 : 1
    }
    return first.available - second.available
  })

  return { issues, outOfStockVariants, lowStockVariants, damagedUnits }
}

export default function DashboardInventoryHealth({
  products,
  isLoading,
  errorMessage,
}: DashboardInventoryHealthProps) {
  const { issues, outOfStockVariants, lowStockVariants, damagedUnits } = React.useMemo(
    () => getInventoryIssues(products),
    [products]
  )

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Inventory health</h2>
          <p className="mt-1 text-sm text-gray-500">
            Stock available now, excluding items currently out and reported damage.
          </p>
        </div>
        <Link
          href="/shop/products"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#1b2a80] hover:underline"
        >
          Manage products <ArrowForwardIcon fontSize="small" />
        </Link>
      </div>

      {errorMessage ? (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-5 text-sm text-red-800">
          Could not load inventory health: {errorMessage}
        </div>
      ) : isLoading ? (
        <div role="status" className="rounded-lg bg-gray-50 px-4 py-5 text-sm text-gray-600">
          Loading inventory health…
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">Out of stock</p>
              <p className="mt-1 text-2xl font-bold text-red-900">{outOfStockVariants}</p>
              <p className="text-xs text-red-700">variants</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-800">Low stock</p>
              <p className="mt-1 text-2xl font-bold text-amber-900">{lowStockVariants}</p>
              <p className="text-xs text-amber-700">1–2 units available</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-sm font-medium text-gray-700">Unavailable from damage</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{damagedUnits}</p>
              <p className="text-xs text-gray-600">units reported damaged</p>
            </div>
          </div>

          {issues.length === 0 ? (
            <div className="flex items-center gap-3 rounded-lg bg-emerald-50 px-4 py-5 text-sm text-emerald-800">
              <Inventory2OutlinedIcon />
              All active product variants have more than two units available, with no reported
              damage.
            </div>
          ) : (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <WarningAmberOutlinedIcon className="text-amber-600" fontSize="small" />
                <h3 className="text-sm font-semibold text-gray-800">
                  {issues.length} variant{issues.length === 1 ? "" : "s"} need
                  {issues.length === 1 ? "s" : ""} attention
                </h3>
              </div>
              <ul className="max-h-64 divide-y divide-gray-100 overflow-y-auto scrollbar-seamless">
                {issues.map((issue) => (
                  <li key={issue.variantId}>
                    <Link
                      href={`/shop/products?highlight=${issue.productId}`}
                      className="flex flex-col gap-2 py-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {issue.productName}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-600">{issue.variantName}</p>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            issue.available === 0
                              ? "bg-red-100 text-red-800"
                              : issue.available <= 2
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {issue.available === 0 ? "Out of stock" : `${issue.available} available`}
                        </span>
                        {issue.damaged > 0 && (
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {issue.damaged} damaged
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </section>
  )
}
