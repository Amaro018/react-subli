import { Ctx, resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize(), async (_, ctx: Ctx) => {
  const userId = ctx.session.userId

  const userRents = await db.rent.findMany({
    where: {
      userId: userId, // Filter by the user's ID
    },
    include: {
      user: true,

      items: {
        include: {
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
          payments: true, // Include payments for each RentItem
        },
      },
    },
  })

  return userRents
})
