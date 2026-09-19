import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export default resolver.pipe(resolver.authorize(), async (_, ctx: Ctx) => {
  const userId = ctx.session.userId

  if (!userId) throw new Error("Not authenticated")

  const userRents = await db.rent.findMany({
    where: {
      userId: userId,
    },
    include: {
      user: true,
      items: {
        include: {
          reviews: {
            where: {
              userId: userId, // Fetch reviews written by the current user
            },
          },
          productVariant: {
            include: {
              attributes: {
                include: {
                  attributeValue: {
                    include: {
                      attribute: true,
                    },
                  },
                },
              },
              product: {
                include: {
                  variants: true,
                  images: true, // Needed for thumbnails in ReviewList
                  category: true,
                  shop: true,
                },
              },
            },
          },
          payments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Flatten rent items for ReviewList and dynamically assign isReviewed
  const rentItems = userRents.flatMap((rent) =>
    rent.items.map((item) => ({
      ...item,
      rent: {
        id: rent.id,
        userId: rent.userId,
        deliveryAddress: rent.deliveryAddress,
        user: rent.user,
      },
      isReviewed: item.reviews.length > 0,
    }))
  )

  return rentItems
})
