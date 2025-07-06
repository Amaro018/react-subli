import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetProductByShopId = z.object({
  shopId: z.number(),
})

export default resolver.pipe(resolver.zod(GetProductByShopId), async ({ shopId }) => {
  const products = await db.product.findMany({
    where: {
      shopId,
    },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            include: {
              personalInfo: true,
            },
          },
        },
      },
      variants: {
        include: {
          color: true,
        },
      },
      images: true,
      shop: true,
    },
  })

  return products
})
