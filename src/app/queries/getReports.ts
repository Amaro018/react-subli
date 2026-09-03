import { Ctx } from "blitz"
import db from "db"

export default async function getReports(_ = null, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const reports = await db.report.findMany({
    where: {
      productId: {
        gt: 0, // A robust way to ensure the product relation exists
      },
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

  return reports
}
