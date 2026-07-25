import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteNotificationInput = z.object({
  id: z.number(),
})

export default resolver.pipe(
  resolver.zod(DeleteNotificationInput),
  resolver.authorize(),
  async ({ id }, ctx) => {
    const notification = await db.notification.deleteMany({
      where: {
        id,
        userId: ctx.session.userId,
      },
    })

    return notification
  }
)
