import { resolver } from "@blitzjs/rpc"
import db from "db"

/** Invoices containing at least one item owned by the signed-in shop. */
export default resolver.pipe(resolver.authorize(), async (_, ctx) => {
  const shop = await db.shop.findUnique({ where: { userId: ctx.session.userId } })
  if (!shop) throw new Error("A registered shop is required to view invoices.")

  return db.invoice.findMany({
    where: { shopId: shop.id },
    include: {
      rent: { include: { user: { include: { personalInfo: true } } } },
      items: true,
    },
    orderBy: { issuedAt: "desc" },
  })
})
