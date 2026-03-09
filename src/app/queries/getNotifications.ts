import { Ctx } from "blitz"
import db from "db"

export default async function getNotifications(_ = null, ctx: Ctx) {
  ctx.session.$authorize()

  const notifications = await (db as any).notification.findMany({
    where: { userId: ctx.session.userId },
    orderBy: { createdAt: "desc" },
  })

  return notifications
}
