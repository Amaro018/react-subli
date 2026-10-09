import Link from "next/link"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import type { DashboardRecentOrder } from "./DashboardRecentOrders"
import { formatDateTime } from "./utils"

interface DashboardAttentionQueueProps {
  items: DashboardRecentOrder[]
}

type AttentionItem = {
  item: DashboardRecentOrder
  priority: number
  label: string
  message: string
  href: string
  style: string
}

const FINAL_STATUSES = new Set(["completed", "returned", "returned_damaged", "canceled"])

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  )
}

function getAttentionItems(items: DashboardRecentOrder[], now: Date): AttentionItem[] {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const attentionItems = items.flatMap((item): AttentionItem[] => {
    const endDate = new Date(item.endDate)

    if (item.status === "pending") {
      return [
        {
          item,
          priority: 2,
          label: "Pending approval",
          message: "Review this rental request",
          href: `/shop/orders?status=pending&highlight=${item.id}`,
          style: "bg-amber-100 text-amber-800",
        },
      ]
    }

    if (FINAL_STATUSES.has(item.status) || Number.isNaN(endDate.getTime())) return []

    const dueDate = new Date(endDate)
    dueDate.setHours(0, 0, 0, 0)
    const isOverdue = item.status === "overdue" || dueDate < today

    if (isOverdue) {
      return [
        {
          item,
          priority: 0,
          label: "Overdue return",
          message: `Return was due ${formatDateTime(item.endDate)}`,
          href: `/shop/orders?status=overdue&highlight=${item.id}`,
          style: "bg-red-100 text-red-800",
        },
      ]
    }

    if (isSameDay(dueDate, today)) {
      return [
        {
          item,
          priority: 1,
          label: "Return due today",
          message: `Return by ${formatDateTime(item.endDate)}`,
          href: `/shop/orders?status=due_today&highlight=${item.id}`,
          style: "bg-orange-100 text-orange-800",
        },
      ]
    }

    return []
  })

  return attentionItems.sort((first, second) => {
    if (first.priority !== second.priority) return first.priority - second.priority
    if (first.priority === 2) {
      return new Date(first.item.createdAt).getTime() - new Date(second.item.createdAt).getTime()
    }
    return new Date(first.item.endDate).getTime() - new Date(second.item.endDate).getTime()
  })
}

function getRenterName(item: DashboardRecentOrder) {
  const personalInfo = item.rent?.user?.personalInfo
  const name = [personalInfo?.firstName, personalInfo?.lastName].filter(Boolean).join(" ")
  return name || item.rent?.user?.email || "Renter"
}

export default function DashboardAttentionQueue({ items }: DashboardAttentionQueueProps) {
  const attentionItems = getAttentionItems(items, new Date())

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Needs attention</h2>
          <p className="mt-1 text-sm text-gray-500">
            Pending requests and rentals that need action today.
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            attentionItems.length > 0
              ? "bg-red-100 text-red-800"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {attentionItems.length > 0 ? `${attentionItems.length} to review` : "All caught up"}
        </span>
      </div>

      {attentionItems.length === 0 ? (
        <div className="rounded-lg bg-emerald-50 px-4 py-5 text-sm text-emerald-800">
          No pending requests, overdue returns, or returns due today.
        </div>
      ) : (
        <ul className="max-h-96 divide-y divide-gray-100 overflow-y-auto scrollbar-seamless">
          {attentionItems.map(({ item, label, message, href, style }) => (
            <li key={item.id}>
              <Link
                href={href}
                className="flex flex-col gap-3 py-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}>
                      {label}
                    </span>
                    <span className="truncate text-sm font-semibold text-gray-900">
                      {item.productVariant?.product?.name || "Rental item"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-gray-600">
                    {getRenterName(item)} · Order #{item.rentId}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{message}</p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#1b2a80]">
                  Review <ArrowForwardIcon fontSize="small" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
