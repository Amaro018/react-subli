import Link from "next/link"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { formatDateTime } from "./utils"

export interface DashboardRecentOrder {
  id: number
  rentId: number
  status: string
  createdAt: Date | string
  startDate: Date | string
  endDate: Date | string
  quantity?: number
  returnedDamagedQty?: number | null
  deliveryMethod?: string
  productVariant?: {
    id?: number
    quantity?: number
    product?: {
      name?: string
    } | null
  } | null
  rent?: {
    user?: {
      email?: string | null
      personalInfo?: {
        firstName?: string | null
        lastName?: string | null
      } | null
    } | null
  } | null
}

interface DashboardRecentOrdersProps {
  items: DashboardRecentOrder[]
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  accepted: "bg-blue-100 text-blue-800",
  rendering: "bg-violet-100 text-violet-800",
  on_hand: "bg-violet-100 text-violet-800",
  overdue: "bg-red-100 text-red-800",
  completed: "bg-emerald-100 text-emerald-800",
  returned: "bg-emerald-100 text-emerald-800",
  returned_damaged: "bg-orange-100 text-orange-800",
  canceled: "bg-gray-100 text-gray-700",
}

function formatDateRange(startDate: Date | string, endDate: Date | string) {
  return `${formatDateTime(startDate)} – ${formatDateTime(endDate)}`
}

function getRenterName(item: DashboardRecentOrder) {
  const personalInfo = item.rent?.user?.personalInfo
  const name = [personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ")
  return name || item.rent?.user?.email || "Renter"
}

export default function DashboardRecentOrders({ items }: DashboardRecentOrdersProps) {
  const recentOrders = [...items]
    .sort(
      (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
    )
    .slice(0, 5)

  return (
    <section className="flex h-[440px] min-w-0 flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Recent orders</h2>
          <p className="mt-1 text-sm text-gray-500">Your latest rental requests and activity</p>
        </div>
        <Link
          href="/shop/orders"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#1b2a80] hover:underline"
        >
          All orders <ArrowForwardIcon fontSize="small" />
        </Link>
      </div>

      {recentOrders.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-lg bg-gray-50 px-4 text-center">
          <p className="font-medium text-gray-700">No orders yet</p>
          <p className="mt-1 text-sm text-gray-500">New rental activity will show up here.</p>
        </div>
      ) : (
        <ul className="min-h-0 flex-1 divide-y divide-gray-100 overflow-y-auto scrollbar-seamless">
          {recentOrders.map((item) => {
            const statusLabel = item.status.replaceAll("_", " ")
            const statusStyle = statusStyles[item.status] || "bg-gray-100 text-gray-700"

            return (
              <li key={item.id}>
                <Link
                  href={`/shop/orders?highlight=${item.id}`}
                  className="flex items-start justify-between gap-3 py-4 first:pt-1 last:pb-1 hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {item.productVariant?.product?.name || "Rental item"}
                    </p>
                    <p className="mt-1 truncate text-sm text-gray-600">{getRenterName(item)}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Order #{item.rentId} · {formatDateRange(item.startDate, item.endDate)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle}`}
                  >
                    {statusLabel}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
