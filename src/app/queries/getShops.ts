import { Ctx } from "blitz"
import db from "db"

export default async function getShops(input: any, ctx: Ctx) {
  const shops = await db.shop.findMany({
    // Keep your existing where conditions if you have any
    where: {
      status: "approved", // example
    },
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
    },
  })

  return shops
}
