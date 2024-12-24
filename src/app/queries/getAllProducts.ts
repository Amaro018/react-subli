import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async () => {
  const products = await db.product.findMany({
    include: {
      variants: {
        include: {
          color: true, // Include the associated Color for each variant
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
