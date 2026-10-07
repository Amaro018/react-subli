import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const SubmitProductReportResponse = z.object({
  reportId: z.number().int().positive(),
  message: z.string().trim().min(1, "A response is required.").max(5000),
})

export default resolver.pipe(
  resolver.zod(SubmitProductReportResponse),
  resolver.authorize(),
  async ({ reportId, message }, ctx) => {
    return db.$transaction(async (tx) => {
      const report = await tx.report.findFirst({
        where: {
          id: reportId,
          status: "pending",
          product: { shop: { userId: ctx.session.userId } },
        },
        select: {
          id: true,
          product: { select: { name: true, shop: { select: { shopName: true } } } },
        },
      })

      if (!report) {
        throw new Error("This report is no longer pending or does not belong to your shop.")
      }

      const response = await tx.productReportResponse.upsert({
        where: { reportId },
        create: { reportId, message },
        update: { message },
      })

      const admins = await tx.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      })

      await Promise.all(
        admins.map(({ id }) =>
          tx.notification.create({
            data: {
              title: "Shop Responded to a Product Report",
              message: `${report.product.shop.shopName} responded to a report about "${report.product.name}".`,
              userId: id,
              isRead: false,
            },
          })
        )
      )

      return response
    })
  }
)
