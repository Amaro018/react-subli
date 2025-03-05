// app/mutations/addToCart.ts
import db from "db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

// Validation schema
const AddToCart = z.object({
  productId: z.number(),
  variantId: z.number(),
  quantity: z.number().min(1),
  deliveryMethod: z.string(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
})

export default resolver.pipe(
  resolver.zod(AddToCart),
  resolver.authorize(), // Ensure the user is logged in
  async ({ productId, variantId, quantity, deliveryMethod, startDate, endDate }, ctx) => {
    const userId = ctx.session.userId

    const variant = await db.productVariant.findUnique({
      where: { id: variantId },
      select: { quantity: true }, // Assuming `maxQuantity` exists in your variant model
    })

    // Check if the same item is already in the cart
    const existingCartItem = await db.cartItem.findFirst({
      where: {
        userId,
        productId,
        variantId,
      },
    })

    if (existingCartItem) {
      // Define the maximum allowed quantity for the item
      const MAX_QUANTITY = variant!.quantity // Adjust this value as needed

      // Calculate the new quantity
      const newQuantity = existingCartItem.quantity + quantity

      // Check if the new quantity exceeds the max limit
      if (newQuantity > MAX_QUANTITY) {
        throw new Error(`Cannot update item. Maximum quantity of ${MAX_QUANTITY} reached.`)
      }

      // If within the limit, update the quantity
      const updatedCartItem = await db.cartItem.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: newQuantity,
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
        deliveryMethod,
        startDate,
        endDate,
      },
    })
    return newCartItem
  }
)
