import db from "db"
import { z } from "zod"

const UpdateProductStatusInput = z.object({
  id: z.number(),
  status: z.string(),
})

export default async function updateProductStatus(input: z.infer<typeof UpdateProductStatusInput>) {
  const data = UpdateProductStatusInput.parse(input)

  const product = await db.product.update({
    where: { id: data.id },
    data: { status: data.status },
  })

  return product
}
