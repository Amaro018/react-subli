import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CancelRentItem = z.object({
  itemId: z.number(),
})

export default resolver.pipe(
  resolver.zod(CancelRentItem),
  resolver.authorize(),
  async ({ itemId }, ctx) => {
    // Update the rental item status to canceled
    const updatedItem = await db.rentItem.update({
      where: { id: itemId },
      data: { status: "canceled" },
    })
    return updatedItem
  }
)
