import db from "db"
import { Ctx } from "blitz"

export default async function getProductById({ id }: { id: number }, ctx: Ctx) {
  ctx.session.$authorize()

  const product = await db.product.findFirst({
    where: { id },
    include: {
      category: true,

      variants: {
        include: {
          color: true, // Include the associated Color for each variant
        },
      }, // Include related variants if needed
      images: true,
      shop: true,
    },
  })

  if (!product) throw new Error("Product not found")

  return product
}
