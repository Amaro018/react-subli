import { Ctx } from "blitz"
import db from "db"

export default async function getShops(input: any, ctx: Ctx) {
  const shops = await db.shop.findMany({
    // Add the include block here
    include: {
      user: {
        include: {
          personalInfo: true,
        },
      },
      products: {
        include: {
          category: true, // This fetches the category associated with each product
        },
      },
      appeals: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  return shops
}
