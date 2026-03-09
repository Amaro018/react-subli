import { Ctx } from "blitz"
import db from "db"
import { z } from "zod"

const MarkNotificationAsRead = z.object({
  id: z.number(),
})

export default async function markNotificationAsRead(
  input: z.infer<typeof MarkNotificationAsRead>,
  ctx: Ctx
) {
  ctx.session.$authorize()
  const { id } = MarkNotificationAsRead.parse(input)

  const notification = await (db as any).notification.update({
    where: { id },
    data: { isRead: true },
  })

  return notification
}
