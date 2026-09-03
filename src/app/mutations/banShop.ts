"use server"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { Ctx } from "blitz"

const BanShop = z.object({
  shopId: z.number(),
  banReason: z.string().min(1, "A reason for banning the shop is required."),
})

export default resolver.pipe(
  resolver.zod(BanShop),
  resolver.authorize("ADMIN"),
  async ({ shopId, banReason }, ctx: Ctx) => {
    const [shop] = await db.$transaction(async (tx) => {
      // The transaction function
      await Promise.all([
        tx.shop.update({
          where: { id: shopId },
          data: {
            status: "banned",
            banReason: banReason,
          },
        }),
        tx.reportShop.updateMany({
          where: { shopId: shopId, status: "pending" },
          data: { status: "resolved" },
        }),
        // Also ban all of the shop's active products
        tx.product.updateMany({
          where: { shopId: shopId, status: "active" },
          data: { status: "suspended" },
        }),
      ])

      const updatedShop = await tx.shop.findUnique({ where: { id: shopId } })
      if (!updatedShop) throw new Error("Shop not found after update.")

      // Create audit log entry
      await tx.shopAuditLog.create({
        data: {
          shopId: shopId,
          action: "BANNED",
          details: `Reason: ${banReason}`,
          adminId: ctx.session?.userId,
        },
      })

      // Notify the shop owner
      await tx.notification.create({
        data: {
          userId: updatedShop.userId,
          title: "Your Shop Has Been Banned",
          message: `Your shop "${updatedShop.shopName}" has been banned by an administrator. Reason: ${banReason}`,
          isRead: false,
        },
      })

      // Disable shop mode for the user
      await tx.user.update({
        where: { id: updatedShop.userId },
        data: { isShopMode: false },
      })

      return [updatedShop]
    })
    return shop!
  }
)
