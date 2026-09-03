import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateProductStatus = z.object({
  productId: z.number(),
  status: z.string(),
  banReason: z.string().optional(),
  adminId: z.number().optional(),
})

export default resolver.pipe(
  resolver.zod(UpdateProductStatus),
  resolver.authorize(),
  async ({ productId, status, banReason, adminId }) => {
    const product = await db.product.findUnique({ where: { id: productId } })

    if (!product) {
      throw new Error("Product not found")
    }

    const [updatedProduct] = await db.$transaction([
      db.product.update({
        where: { id: productId },
        data: {
          status,
          banReason: status === "banned" ? banReason : null,
        },
      }),
      ...(status === "banned"
        ? [
            db.report.updateMany({
              where: { productId: productId, status: "pending" },
              data: { status: "resolved" },
            }),
          ]
        : []),
    ])

    return updatedProduct!
  }
)
