import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CancelRentItem = z.object({
  itemId: z.number().int().positive(),
})

export default resolver.pipe(
  resolver.zod(CancelRentItem),
  resolver.authorize(),
  async ({ itemId }, ctx) => {
    return db.$transaction(async (tx) => {
      const result = await tx.rentItem.updateMany({
        where: {
          id: itemId,
          status: "pending",
          rent: { userId: ctx.session.userId },
        },
        data: { status: "canceled" },
      })

      if (result.count !== 1) {
        throw new Error("This rental request was not found or can no longer be canceled.")
      }

      return tx.rentItem.findUniqueOrThrow({ where: { id: itemId } })
    })
  }
)
