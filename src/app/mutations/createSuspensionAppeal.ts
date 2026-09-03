"use server"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateSuspensionAppeal = z.object({
  shopId: z.number(),
  message: z.string().min(1, "An appeal message is required."),
})

export default resolver.pipe(
  resolver.zod(CreateSuspensionAppeal),
  resolver.authorize(),
  async ({ shopId, message }, ctx) => {
    const shop = await db.shop.findFirst({
      where: { id: shopId, userId: ctx.session.userId },
    })

    if (!shop) throw new Error("Shop not found or you are not the owner.")

    const existingAppeal = await db.suspensionAppeal.findFirst({
      where: {
        shopId: shopId,
        status: "pending",
      },
    })

    if (existingAppeal) throw new Error("You already have a pending appeal for this shop.")

    const appeal = await db.suspensionAppeal.create({
      data: {
        shopId: shopId,
        message: message,
      },
    })

    const admins = await db.user.findMany({ where: { role: "ADMIN" } })
    await Promise.all(
      admins.map((admin) =>
        db.notification.create({
          data: {
            title: "Shop Suspension Appeal Submitted",
            message: `Shop "${
              shop.shopName
            }" has submitted an appeal for reinstatement: "${message.substring(0, 100)}${
              message.length > 100 ? "..." : ""
            }"`,
            userId: admin.id,
            isRead: false,
          },
        })
      )
    )

    return appeal
  }
)
