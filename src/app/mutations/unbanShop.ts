"use server"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { Ctx } from "blitz"

const UnbanShop = z.object({
  shopId: z.number(),
})

export default resolver.pipe(
  resolver.zod(UnbanShop),
  resolver.authorize("ADMIN"),
  async ({ shopId }, ctx: Ctx) => {
    const [shop] = await db.$transaction(async (tx) => {
      // 1. Update the shop status
      const unbannedShop = await tx.shop.update({
        where: { id: shopId },
        data: {
          status: "approved",
          rejectionReason: null, // Clear the rejection reason
          banReason: null, // Clear the ban reason
        },
      })

      // 2. Create audit log entry
      await tx.shopAuditLog.create({
        data: {
          shopId: shopId,
          action: "UNBANNED",
          details: "Shop has been reinstated",
          adminId: ctx.session?.userId,
        },
      })

      // 3. Mark any pending appeals as approved (since un-ban means appeal was successful)
      await tx.suspensionAppeal.updateMany({
        where: { shopId: shopId, status: "pending" },
        data: { status: "approved" },
      })

      // 4. Re-activate products that were banned when the shop was.
      // This assumes products banned with the shop should be re-activated.
      await tx.product.updateMany({
        where: { shopId: shopId, status: "suspended" },
        data: { status: "active" },
      })

      // 5. Re-enable shop mode for the user
      await tx.user.update({
        where: { id: unbannedShop.userId },
        data: { isShopMode: true },
      })

      // 6. Notify the shop owner
      await tx.notification.create({
        data: {
          userId: unbannedShop.userId,
          title: "Your Shop Has Been Reinstated",
          message: `Congratulations! Your shop "${unbannedShop.shopName}" has been reinstated by an administrator and is now active.`,
          isRead: false,
        },
      })

      return [unbannedShop]
    })
    return shop!
  }
)
