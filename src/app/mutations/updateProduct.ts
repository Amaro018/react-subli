import db from "db"
import { connect } from "http2"
import { z } from "zod"

export default async function updateProduct(input: z.infer<typeof CreateProductInput>) {
  const product = await db.product.count()
  return product
}
