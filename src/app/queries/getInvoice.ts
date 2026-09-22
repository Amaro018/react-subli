import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

const GetInvoice = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(GetInvoice),
  resolver.authorize(),
  async ({ id }, ctx) => {
    const invoice = await db.invoice.findFirst({
      where: { id, rent: { userId: ctx.session.userId } },
      include: {
        items: true,
        rent: {
          include: {
            user: {
              include: { personalInfo: true },
            },
          },
        },
      },
    })

    return invoice
  }
)
