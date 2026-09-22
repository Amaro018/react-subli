import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateReportStatus = z.object({
  reportId: z.number(),
  status: z.string(),
  note: z.string().optional(),
  adminId: z.number().optional(),
})

export default resolver.pipe(
  resolver.zod(UpdateReportStatus),
  resolver.authorize("ADMIN"),
  async ({ reportId, status, note }) => {
    const report = await db.report.update({
      where: { id: reportId },
      data: { status, note },
    })

    return report
  }
)
