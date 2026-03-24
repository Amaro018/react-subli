import { Ctx } from "blitz"
import db from "db"
import { z } from "zod"

const GetReportedProductsInput = z.object({
  shopId: z.number(),
})

export default async function getReportedProductsByShop(
  input: z.infer<typeof GetReportedProductsInput>,
  ctx: Ctx
) {
  ctx.session.$authorize()
  const { shopId } = GetReportedProductsInput.parse(input)

  const shop = await db.shop.findUnique({
    where: { userId: ctx.session.userId },
    select: { id: true },
  })

  if (!shop || shop.id !== shopId) {
    throw new Error("You are not authorized to view reports for this shop.")
  }

  const products = await db.product.findMany({
    where: {
      shopId: shopId,
      reports: {
        some: {},
      },
    },
    include: {
      _count: {
        select: { reports: true },
      },
      reports: {
        include: {
          user: {
            select: {
              email: true,
              personalInfo: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  })

  return products
}
