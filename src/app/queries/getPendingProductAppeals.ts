import { Ctx } from "blitz"
import db from "db"

export default async function getPendingProductAppeals(_: null, ctx: Ctx) {
  ctx.session.$authorize("ADMIN")

  return db.productAppeal.findMany({
    where: { status: "pending" },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          status: true,
          banReason: true,
          shop: {
            select: { userId: true, shopName: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })
}
