import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async () => {
  return db.product.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      status: true,
      variants: {
        select: {
          price: true,
          rentItems: { select: { id: true } },
        },
      },
      images: {
        select: {
          isThumbnail: true,
          url: true,
        },
      },
      reviews: {
        select: {
          rating: true,
        },
      },
      category: {
        select: {
          name: true,
        },
      },
      shop: {
        select: {
          barangay: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
})
