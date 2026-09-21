import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize(), async (_, ctx) => {
  const userId = ctx.session.userId

  const savedItems = await db.savedItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          images: true,
          variants: true,
          reviews: true,
          shop: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return savedItems
})
