import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DismissAllShopReports = z.object({
  shopId: z.number(),
  note: z.string().min(1, "A note is required."),
  adminId: z.number(),
})

export default resolver.pipe(
  resolver.zod(DismissAllShopReports),
  resolver.authorize("ADMIN"),
  async ({ shopId, note, adminId }) => {
    await db.reportShop.updateMany({
      where: {
        shopId: shopId,
        status: "pending",
      },
      data: { status: "resolved", note, resolvedById: adminId },
    })

    // Create audit log entry
    await db.shopAuditLog.create({
      data: {
        shopId: shopId,
        action: "REPORTS_DISMISSED",
        details: `All pending reports dismissed. Note: ${note}`,
        adminId: adminId,
      },
    })
  }
)
