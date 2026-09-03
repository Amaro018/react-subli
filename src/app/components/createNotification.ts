import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateNotification = z.object({
  title: z.string(),
  message: z.string(),
  userId: z.number().nullable(),
  role: z.enum(["ADMIN", "RENTER"]).nullable(),
})

export default resolver.pipe(
  resolver.zod(CreateNotification),
  resolver.authorize(),
  async ({ title, message, userId, role }) => {
    if (role === "ADMIN") {
      const admins = await db.user.findMany({ where: { role: "ADMIN" } })
      await Promise.all(
        admins.map((admin) =>
          db.notification.create({
            data: {
              title,
              message,
              userId: admin.id,
            },
          })
        )
      )
      // We don't return the created notifications for admins to avoid large payloads
      return null
    }

    if (!userId) {
      // If not sending to all admins, a specific userId is required.
      throw new Error("A userId is required to create this notification.")
    }

    return db.notification.create({
      data: {
        title,
        message,
        userId,
      },
    })
  }
)
