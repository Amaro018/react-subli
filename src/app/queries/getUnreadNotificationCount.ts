import { Ctx } from "blitz"
import db from "db"

export default async function getUnreadNotificationCount(_ = null, ctx: Ctx) {
  ctx.session.$authorize()

  const count = await (db as any).notification.count({
    where: {
      userId: ctx.session.userId,
      isRead: false,
    },
  })

  return count
}
