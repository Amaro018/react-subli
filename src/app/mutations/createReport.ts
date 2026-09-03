import { Ctx } from "blitz"
import db from "db"
import { z } from "zod"

const CreateReportInput = z.object({
  productId: z.number(),
  reason: z.string().min(1, "Reason is required"),
  description: z.string().optional(),
})

export default async function createReport(input: z.infer<typeof CreateReportInput>, ctx: Ctx) {
  ctx.session.$authorize()
  const { productId, reason, description } = CreateReportInput.parse(input)

  const existingReport = await db.report.findFirst({
    where: {
      productId: productId,
      userId: ctx.session.userId,
      status: "pending",
    },
  })

  if (existingReport) {
    throw new Error(
      "You already have a pending report for this product. Please wait for it to be reviewed."
    )
  }

  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product) {
    throw new Error("Product not found")
  }

  const report = await db.report.create({
    data: {
      productId,
      reason,
      description,
      userId: ctx.session.userId,
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
            title: "New Product Report",
            message: `Product "${product.name}" has been reported for "${reason}". [Report ID: ${report.id}]`,
          },
        })
      )
    )
  }

  return report
}
