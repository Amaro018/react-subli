import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async (_, ctx: Ctx) => {
  // Check if there's a userId in the session
  const userId = ctx.session.userId

  // If no userId is found, return null immediately
  if (!userId) {
    return null
  }

  // Retrieve all cart items for the current user
  const cartItems = await db.cartItem.findMany({
    where: {
      userId, // Only query for cart items of the authenticated user
    },
    include: {
      user: {
        include: {
          personalInfo: true,
        },
      },
      product: {
        include: {
          variants: true,
          images: true,
          category: true,
          shop: true,
        },
      },
      variant: {
        include: {
          color: true,
          product: true,
        },
      },
    },
  })

  // Return cart items, or null if no items are found
  return cartItems.length > 0 ? cartItems : null
})
