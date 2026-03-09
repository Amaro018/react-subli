import { Ctx } from "blitz"
import db from "db"

export default async function deleteAllNotifications(_ = null, ctx: Ctx) {
  ctx.session.$authorize()

  const notifications = await (db as any).notification.deleteMany({
    where: { userId: ctx.session.userId },
  })

  return notifications
}
