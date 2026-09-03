import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  const rentItems = await db.rentItem.findMany({
    select: {
      quantity: true,
      productVariant: {
        select: {
          productId: true,
        },
      },
    },
  })

  const productRentalCounts: { [key: number]: number } = {}
  for (const item of rentItems) {
    const productId = item.productVariant.productId
    productRentalCounts[productId] = (productRentalCounts[productId] || 0) + item.quantity
  }

  const sortedProductIds = Object.keys(productRentalCounts)
    .map(Number)
    .sort((a, b) => productRentalCounts[b]! - productRentalCounts[a]!)
    .slice(0, 5)

  const topProducts = await db.product.findMany({
    where: {
      id: { in: sortedProductIds },
    },
    include: {
      images: { where: { isThumbnail: true }, take: 1 },
      shop: { select: { shopName: true } },
    },
  })

  const results = topProducts.map((p) => ({ ...p, totalRentals: productRentalCounts[p.id] }))
  results.sort((a, b) => b.totalRentals! - a.totalRentals!)

  return results
})
