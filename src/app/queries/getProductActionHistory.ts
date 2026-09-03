import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetProductActionHistory = z.object({
  productId: z.number(),
  productName: z.string(),
})

export default resolver.pipe(
  resolver.zod(GetProductActionHistory),
  resolver.authorize(),
  async ({ productId, productName }) => {
    const history: { date: Date; action: string; details: string; actor?: string | null }[] = []

    // 1. Check for Ban History
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { bannedBy: true },
    })
    if (product?.status === "banned" && product.banReason) {
      history.push({
        date: product.updatedAt,
        action: "Product Banned",
        details: `Reason: ${product.banReason}`,
        actor: product.bannedBy?.email,
      })
    }

    // 3. Check for Report Dismissal History
    const dismissedReports = await db.report.findMany({
      where: {
        productId: productId,
        status: "resolved",
        note: {
          not: null,
        },
      },
      include: { resolvedBy: true },
      orderBy: { updatedAt: "desc" },
    })

    dismissedReports.forEach((report) => {
      history.push({
        date: report.updatedAt,
        action: "Report Dismissed",
        details: `Note: ${report.note}`,
        actor: report.resolvedBy?.email,
      })
    })

    // Sort history chronologically
    history.sort((a, b) => b.date.getTime() - a.date.getTime())

    return history
  }
)
