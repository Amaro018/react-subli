import { Ctx, resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize(), async (_, ctx: Ctx) => {
  const userId = ctx.session.userId

  if (!userId) {
    throw new Error("User not authenticated")
  }

  // Retrieve all cart items for the current user
  const cartItems = await db.cartItem.findMany({
    where: {
      userId, // Filter cart items by the current user's ID
    },
    include: {
      product: {
        include: {
          variants: true,
          images: true, // Include product images if needed
          category: true, // Include category details if needed
        },
      },
      variant: {
        include: {
          color: true, // Include color details for the variant
        },
      },
    },
  })

  return cartItems
})
