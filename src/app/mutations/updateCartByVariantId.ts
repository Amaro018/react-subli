import { resolver } from "@blitzjs/rpc"
import { dE } from "@fullcalendar/core/internal-common"
import db from "db"
import { z } from "zod"

export default resolver.pipe(
  resolver.zod(
    z.object({
      variantId: z.number(),
      quantity: z.number().min(1),
      deliveryMethod: z.string(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    })
  ),
  resolver.authorize(),
  async ({ variantId, quantity, startDate, deliveryMethod, endDate }, ctx) => {
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
        deliveryMethod: deliveryMethod,
        startDate,
        endDate,
      },
    })

    return updatedCartItem
  }
)
