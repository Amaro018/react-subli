import { Ctx } from "blitz"
import db from "db"

export default async function getReportedProducts(_: null, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  const reports = await db.report.findMany({
    where: {
      status: "PENDING",
    },
    include: {
      product: {
        include: {
          shop: true,
        },
      },
      user: {
        // The user who reported
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return reports
}
