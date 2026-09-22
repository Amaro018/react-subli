import { Ctx } from "blitz"
import db from "db"

/** Reports belonging to the signed-in shop. Reporter identity is intentionally omitted. */
export default async function getReportedProductsByShop(_: null, ctx: Ctx) {
  ctx.session.$authorize()

  const shop = await db.shop.findUnique({
    where: { userId: ctx.session.userId },
    select: { id: true },
  })

  if (!shop) throw new Error("A registered shop is required to view product reports.")

  const products = await db.product.findMany({
    where: {
      shopId: shop.id,
      reports: {
        some: {},
      },
    },
    include: {
      _count: {
        select: { reports: true },
      },
      reports: {
        select: {
          id: true,
          reason: true,
          description: true,
          status: true,
          note: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  return products
}
