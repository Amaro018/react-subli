import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

const GetShopInvoice = z.object({ id: z.number() })

export default resolver.pipe(
  resolver.zod(GetShopInvoice),
  resolver.authorize(),
  async ({ id }, ctx) => {
    const shop = await db.shop.findUnique({ where: { userId: ctx.session.userId } })
    if (!shop) throw new Error("A registered shop is required to view invoices.")

    return db.invoice.findFirst({
      where: { id, shopId: shop.id },
      include: {
        items: true,
        rent: { include: { user: { include: { personalInfo: true } } } },
      },
    })
  }
)
