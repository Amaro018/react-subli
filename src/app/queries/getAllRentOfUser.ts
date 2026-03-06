import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export default resolver.pipe(resolver.authorize(), async (_, ctx: Ctx) => {
  const userId = ctx.session.userId

  if (!userId) throw new Error("Not authenticated")

  const userRents = await db.rent.findMany({
    where: {
      userId: userId, // Filter by the user's ID
    },
    include: {
      user: true,

      items: {
        include: {
          reviews: true,
          productVariant: {
            include: {
              color: true,
              product: {
                include: {
                  variants: true,
                  images: true,
                  category: true,
                  shop: true,
                },
              }, // Include related product details
            },
          },
          payments: true,

          // Include payments for each RentItem
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return userRents
})
