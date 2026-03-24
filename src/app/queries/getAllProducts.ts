import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async () => {
  const products = await db.product.findMany({
    include: {
      variants: {
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
          rentItems: true,
          damagePolicies: true,
        },
      },
      shop: true,
      category: true,

      images: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return products
})
