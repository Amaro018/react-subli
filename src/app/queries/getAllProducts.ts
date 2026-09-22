import db from "db"
import { resolver } from "@blitzjs/rpc"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
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
