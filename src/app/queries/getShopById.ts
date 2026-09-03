import db from "db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const GetShopById = z.object({
  id: z.string().or(z.number()),
})

export default resolver.pipe(resolver.zod(GetShopById), async ({ id }) => {
  // If not banned, fetch the full shop details
  const fullShopDetails = await db.shop.findFirst({
    where: { id: typeof id === "string" ? parseInt(id) : id },
    include: {
      products: {
        include: {
          category: true,
          variants: {
            include: {
              attributes: { include: { attributeValue: { include: { attribute: true } } } },
            },
          },
          reviews: { include: { user: { include: { personalInfo: true } } } },
          images: true,
        },
      },
    },
  })

  if (!fullShopDetails) {
    throw new Error("Shop not found")
  }

  return fullShopDetails
})
