import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

export default resolver.pipe(
  resolver.zod(
    z.object({
      variantId: z.number(),
      quantity: z.number().min(1),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    })
  ),
  resolver.authorize(),
  async ({ variantId, quantity, startDate, endDate }, ctx) => {
    const userId = ctx.session.userId

    const existingCartItem = await db.cartItem.findFirst({
      where: {
        userId,
        variantId,
      },
    })

    if (!existingCartItem) {
      throw new Error("CartItem not found")
    }

    const updatedCartItem = await db.cartItem.update({
      where: { id: existingCartItem.id },
      data: {
        quantity,
        startDate,
        endDate,
      },
    })

    return updatedCartItem
  }
)
