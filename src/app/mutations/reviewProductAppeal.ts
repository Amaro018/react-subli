import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const ReviewProductAppeal = z.object({
  appealId: z.number().int().positive(),
  status: z.enum(["approved", "rejected"]),
  adminNote: z.string().trim().min(1, "A decision note is required.").max(2000),
})

export default resolver.pipe(
  resolver.zod(ReviewProductAppeal),
  resolver.authorize("ADMIN"),
  async ({ appealId, status, adminNote }) =>
    db.$transaction(async (tx) => {
      const appeal = await tx.productAppeal.findUnique({
        where: { id: appealId },
        select: {
          id: true,
          productId: true,
          status: true,
          product: {
            select: {
              name: true,
              shop: { select: { userId: true, shopName: true } },
            },
          },
        },
      })

      if (!appeal || appeal.status !== "pending") {
        throw new Error("This appeal has already been reviewed or no longer exists.")
      }

      const updated = await tx.productAppeal.updateMany({
        where: { id: appealId, status: "pending" },
        data: { status, adminNote },
      })

      if (updated.count !== 1) {
        throw new Error("This appeal has already been reviewed.")
      }

      if (status === "approved") {
        await tx.product.update({
          where: { id: appeal.productId },
          data: { status: "active", banReason: null },
        })
      }

      await tx.notification.create({
        data: {
          title: `Product appeal ${status}`,
          message:
            status === "approved"
              ? `Your appeal for "${appeal.product.name}" was approved. The product has been restored.`
              : `Your appeal for "${appeal.product.name}" was rejected. Admin note: ${adminNote}`,
          userId: appeal.product.shop.userId,
          isRead: false,
        },
      })

      return tx.productAppeal.findUniqueOrThrow({
        where: { id: appealId },
      })
    })
)
