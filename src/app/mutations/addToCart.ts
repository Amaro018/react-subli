// app/mutations/addToCart.ts
import db from "db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

// Validation schema
const AddToCart = z.object({
  productId: z.number(),
  variantId: z.number(),
  quantity: z.number().min(1),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

export default resolver.pipe(
  resolver.zod(AddToCart),
  resolver.authorize(), // Ensure the user is logged in
  async ({ productId, variantId, quantity, startDate, endDate }, ctx) => {
    const userId = ctx.session.userId

    // Check if the same item is already in the cart
    const existingCartItem = await db.cartItem.findFirst({
      where: {
        userId,
        productId,
        variantId,
      },
    })

    if (existingCartItem) {
      // If it exists, update the quantity
      const updatedCartItem = await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity,
          startDate: startDate || existingCartItem.startDate,
          endDate: endDate || existingCartItem.endDate,
        },
      })
      return updatedCartItem
    }

    // If it doesn't exist, create a new cart item
    const newCartItem = await db.cartItem.create({
      data: {
        userId,
        productId,
        variantId,
        quantity,
        startDate,
        endDate,
      },
    })
    return newCartItem
  }
)
