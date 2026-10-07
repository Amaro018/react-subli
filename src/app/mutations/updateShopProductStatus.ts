import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateShopProductStatus = z.object({
  productId: z.number().int().positive(),
  status: z.enum(["deleted", "inactive"]),
})

export default resolver.pipe(
  resolver.zod(UpdateShopProductStatus),
  resolver.authorize(),
  async ({ productId, status }, ctx) => {
    const product = await db.product.findFirst({
      where: {
        id: productId,
        shop: { userId: ctx.session.userId },
      },
      select: { id: true, shopId: true, status: true },
    })

    if (!product) {
      throw new Error("Product not found or you are not authorized to manage it.")
    }
    if (product.status === "banned") {
      throw new Error(
        "Banned products can only be relisted after an administrator approves an appeal."
      )
    }
    if (status === "deleted" && product.status === "deleted") {
      throw new Error("This product is already archived.")
    }
    if (status === "inactive" && product.status !== "deleted") {
      throw new Error("Only archived products can be restored.")
    }

    const updated = await db.product.updateMany({
      where: {
        id: productId,
        shopId: product.shopId,
        status: product.status,
      },
      data: { status },
    })

    if (updated.count !== 1) {
      throw new Error("The product status changed. Refresh and try again.")
    }

    return { id: productId, status }
  }
)
