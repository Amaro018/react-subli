"use server"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetShopAppeals = z.object({
  shopId: z.number(),
})

export default resolver.pipe(
  resolver.zod(GetShopAppeals),
  resolver.authorize(),
  async ({ shopId }, ctx) => {
    const shop = await db.shop.findFirst({
      where: { id: shopId, userId: ctx.session.userId },
      select: { userId: true },
    })

    if (!shop) {
      throw new Error("Not authorized to view appeals for this shop.")
    }

    const appeals = await db.suspensionAppeal.findMany({
      where: { shopId: shopId },
      orderBy: { createdAt: "desc" },
    })

    return appeals
  }
)
