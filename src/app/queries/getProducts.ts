import { Ctx, resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize(), async (_, ctx: Ctx) => {
  const userId = ctx.session.userId

  if (!userId) {
    throw new Error("User not authenticated")
  }

  // Find the shop associated with the current user
  const shop = await db.shop.findUnique({
    where: {
      userId: userId, // Assuming `ownerId` links users to their shops
    },
  })

  if (!shop) {
    throw new Error("Shop not found for the current user")
  }

  // Find products belonging to the user's shop
  const products = await db.product.findMany({
    where: {
      shopId: shop.id, // Use the shop's ID to match products
    },
    include: {
      variants: {
        include: {
          color: true, // Include the associated Color for each variant
        },
      },
      category: true,

      images: true,
      shop: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return products
})
