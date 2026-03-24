import db from "db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const GetShopById = z.object({
  id: z.string().or(z.number()),
})

export default resolver.pipe(resolver.zod(GetShopById), async ({ id }) => {
  const shop = await db.shop.findFirst({
    where: { id: typeof id === "string" ? parseInt(id) : id },
    include: {
      products: {
        include: {
          category: true,
          variants: true,
          reviews: true,
          images: true,
        },
      },
    },
  })
  if (!shop) throw new Error("Shop not found")
  return shop
})
