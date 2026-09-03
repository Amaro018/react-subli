import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetShopActionHistory = z.object({
  shopId: z.number(),
  shopName: z.string(),
})

export default resolver.pipe(
  resolver.zod(GetShopActionHistory),
  resolver.authorize(),
  async ({ shopId, shopName }) => {
    // Fetch all audit logs for this shop, sorted by most recent first
    const auditLogs = await db.shopAuditLog.findMany({
      where: { shopId: shopId },
      orderBy: { createdAt: "desc" },
    })

    // Transform audit logs into the history format
    const history = auditLogs.map((log) => ({
      date: log.createdAt,
      action: formatAction(log.action),
      details: log.details,
      actor: log.adminId ? `Admin ID: ${log.adminId}` : "System",
    }))

    return history
  }
)

function formatAction(action: string): string {
  const actionMap: { [key: string]: string } = {
    BANNED: "Shop Banned",
    UNBANNED: "Shop Reinstated",
    APPROVED: "Shop Approved",
    REJECTED: "Shop Rejected",
    STATUS_CHANGED: "Status Changed",
    REPORT_DISMISSED: "Report Dismissed",
    REPORTS_DISMISSED: "All Reports Dismissed",
    REPORT_CREATED: "Report Created",
    SHOP_CREATED: "Shop Created",
    DOCUMENTS_RESUBMITTED: "Documents Resubmitted",
  }
  return actionMap[action] || action
}
