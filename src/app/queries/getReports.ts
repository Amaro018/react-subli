import { Ctx } from "blitz"
import db from "db"

export default async function getReports(_ = null, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const reports = await db.report.findMany({
    where: {
      productId: {
        gt: 0, // A robust way to ensure the product relation exists
      },
      status: "pending",
    },
    include: {
      product: {
        include: {
          shop: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // The admin UI displays one row per product with its pending reports nested
  // beneath it. Returning the flat database result made `reports.length`
  // undefined at runtime.
  const grouped = new Map<
    number,
    { product: (typeof reports)[number]["product"]; reports: typeof reports }
  >()

  for (const report of reports) {
    const existing = grouped.get(report.productId)
    if (existing) {
      existing.reports.push(report)
    } else {
      grouped.set(report.productId, { product: report.product, reports: [report] })
    }
  }

  return Array.from(grouped.values())
}
