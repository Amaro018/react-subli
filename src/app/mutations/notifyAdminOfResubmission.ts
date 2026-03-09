import db from "db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

const NotifyAdmin = z.object({
  shopName: z.string(),
  documentType: z.string(),
  shopId: z.number(),
})

export default resolver.pipe(
  resolver.zod(NotifyAdmin),
  resolver.authorize(),
  async ({ shopName, documentType, shopId }) => {
    // Find all users with ADMIN role
    const admins = await db.user.findMany({
      where: { role: "ADMIN" },
    })

    if (admins.length > 0) {
      await Promise.all(
        admins.map((admin) =>
          db.notification.create({
            data: {
              userId: admin.id,
              title: "Document Resubmitted",
              message: `Shop "${shopName}" has resubmitted their ${documentType}. View here: /admin/shops/${shopId}`,
              isRead: false,
            },
          })
        )
      )
    }
  }
)
