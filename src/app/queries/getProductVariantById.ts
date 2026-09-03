import { resolver } from "@blitzjs/rpc"
import db from "db"

export default async function getProductVariantById({ id }: { id: number }) {
  const productVariant = await db.productVariant.findFirst({
    where: { id },
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
      rentItems: {
        include: {
          rent: true,
          payments: true,
        },
      },
      product: {
        include: {
          variants: true,
          images: true,
          category: true,
          shop: true,
        },
      },
    },
  })

  if (!productVariant) throw new Error("ProductVariant not found")

  return productVariant
}
