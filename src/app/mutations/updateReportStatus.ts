import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateReportStatus = z.object({
  reportId: z.number(),
  status: z.string(),
  note: z.string().optional(),
  adminId: z.number(),
})

export default resolver.pipe(
  resolver.zod(UpdateReportStatus),
  resolver.authorize(),
  async ({ reportId, status, note, adminId }) => {
    const report = await db.report.update({
      where: { id: reportId },
      data: { status, note, resolvedById: adminId },
    })

    return report
  }
)
