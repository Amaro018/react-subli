import { resolver } from "@blitzjs/rpc"
import db from "db"

export default async function getAllRentItems() {
  const rentItems = await db.rentItem.findMany({
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
          },
        },
      },
    },
  })

  if (!rentItems) throw new Error("ProductVariant not found")

  return rentItems
}
