import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const ToggleSavedItemInput = z.object({
  productId: z.number(),
})

export default resolver.pipe(
  resolver.zod(ToggleSavedItemInput),
  resolver.authorize(),
  async ({ productId }, ctx) => {
    const userId = ctx.session.userId

    // Check if the item is already saved by the user
    const existingSavedItem = await db.savedItem.findFirst({
      where: {
        userId,
        productId,
      },
    })

    if (existingSavedItem) {
      // If already saved, remove it
      await db.savedItem.delete({
        where: { id: existingSavedItem.id },
      })
      return { saved: false }
    } else {
      // If not saved, create a new record
      await db.savedItem.create({
        data: {
          userId,
          productId,
        },
      })
      return { saved: true }
    }
  }
)
