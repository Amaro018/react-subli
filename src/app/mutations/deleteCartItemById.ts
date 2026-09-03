import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteCartItemInput = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteCartItemInput),
  resolver.authorize(),
  async ({ id }, ctx) => {
    const userId = ctx.session.userId

    // deleteMany safely ensures the user can only delete their own cart items
    const result = await db.cartItem.deleteMany({
      where: { id, userId },
    })

    if (result.count === 0) {
      throw new Error("Cart item not found or unauthorized")
    }

    return { success: true }
  }
)
