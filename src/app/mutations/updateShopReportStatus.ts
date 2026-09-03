import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateShopReportStatus = z.object({
  reportId: z.number(),
  status: z.string(),
  note: z.string().optional(),
  adminId: z.number(),
})

export default resolver.pipe(
  resolver.zod(UpdateShopReportStatus),
  resolver.authorize(),
  async ({ reportId, status, note, adminId }) => {
    const shopReport = await db.reportShop.update({
      where: { id: reportId },
      data: { status, note, resolvedById: adminId },
    })

    // Create audit log entry
    if (status === "resolved" && shopReport.shopId) {
      await db.shopAuditLog.create({
        data: {
          shopId: shopReport.shopId,
          action: "REPORT_DISMISSED",
          details: `Report #${reportId} dismissed. Note: ${note || "No note provided"}`,
          adminId: adminId,
        },
      })
    }

    return shopReport
  }
)
