import { Ctx } from "blitz"
import db from "db"
import { z } from "zod"

const CreateShopReport = z.object({
  shopId: z.number(),
  reason: z.string().min(1),
  description: z.string().optional(),
})

export default async function createShopReport(input: z.infer<typeof CreateShopReport>, ctx: Ctx) {
  ctx.session.$authorize()

  const { shopId, reason, description } = CreateShopReport.parse(input)

  const existingReport = await db.reportShop.findFirst({
    where: {
      shopId: shopId,
      userId: ctx.session.userId,
      status: "pending",
    },
  })

  if (existingReport) {
    throw new Error(
      "You already have a pending report for this shop. Please wait for it to be reviewed."
    )
  }

  const shop = await db.shop.findUnique({
    where: { id: shopId },
    select: { shopName: true },
  })

  const report = await db.reportShop.create({
    data: {
      shopId,
      reason,
      description,
      userId: ctx.session.userId,
      status: "pending",
    },
  })

  // Create audit log entry
  await db.shopAuditLog.create({
    data: {
      shopId: shopId,
      action: "REPORT_CREATED",
      details: `Report created - Reason: ${reason}`,
      adminId: null, // Regular user created this, not an admin
    },
  })

  // Notify all admins
  const admins = await db.user.findMany({ where: { role: "ADMIN" } })
  if (admins.length > 0) {
    await Promise.all(
      admins.map((admin) =>
        db.notification.create({
          data: {
            userId: admin.id,
            title: "New Shop Report",
            message: `A new report has been submitted for shop "${shop?.shopName}".`,
          },
        })
      )
    )
  }

  return report
}
