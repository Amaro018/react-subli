import { resolver } from "@blitzjs/rpc"
import db from "db"

export default async function getProductVariantById({ id }: { id: number }) {
  const productVariant = await db.productVariant.findFirst({
    where: { id },
  })

  if (!productVariant) throw new Error("ProductVariant not found")

  return productVariant
}
