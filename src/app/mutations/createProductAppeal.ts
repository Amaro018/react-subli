import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateProductAppeal = z.object({
  productId: z.number().int().positive(),
  message: z.string().trim().min(1, "An appeal statement is required.").max(5000),
})

export default resolver.pipe(
  resolver.zod(CreateProductAppeal),
  resolver.authorize(),
  async ({ productId, message }, ctx) => {
    try {
      return await db.$transaction(async (tx) => {
        const product = await tx.product.findFirst({
          where: { id: productId, status: "banned", shop: { userId: ctx.session.userId } },
          select: { id: true, name: true, shop: { select: { shopName: true } } },
        })

        if (!product) {
          throw new Error("Only the owning shop can appeal a banned product.")
        }

        const existingAppeal = await tx.productAppeal.findFirst({
          where: { productId, status: "pending" },
          select: { id: true },
        })

        if (existingAppeal) {
          throw new Error("This product already has a pending appeal.")
        }

        const appeal = await tx.productAppeal.create({
          data: { productId, message },
        })
        const admins = await tx.user.findMany({
          where: { role: "ADMIN" },
          select: { id: true },
        })

        await Promise.all(
          admins.map(({ id }) =>
            tx.notification.create({
              data: {
                title: "Product Ban Appeal Submitted",
                message: `${product.shop.shopName} appealed the ban on "${product.name}".`,
                userId: id,
                isRead: false,
              },
            })
          )
        )

        return appeal
      })
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2002"
      ) {
        throw new Error("This product already has a pending appeal.")
      }

      throw error
    }
  }
)
