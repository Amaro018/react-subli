import { Ctx } from "blitz"
import db from "db"

export default async function markAllNotificationsAsRead(_ = null, ctx: Ctx) {
  ctx.session.$authorize()

  const notifications = await (db as any).notification.updateMany({
    where: { userId: ctx.session.userId, isRead: false },
    data: { isRead: true },
  })

  return notifications
}
