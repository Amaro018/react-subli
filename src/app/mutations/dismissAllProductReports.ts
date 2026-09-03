import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DismissAllProductReports = z.object({
  productId: z.number(),
  note: z.string().min(1, "A note is required."),
  adminId: z.number(),
})

export default resolver.pipe(
  resolver.zod(DismissAllProductReports),
  resolver.authorize("ADMIN"),
  async ({ productId, note, adminId }) => {
    await db.report.updateMany({
      where: {
        productId: productId,
        status: "pending",
      },
      data: { status: "resolved", note, resolvedById: adminId },
    })
  }
)
