import db from "db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { Ctx } from "blitz"

// Define schema for the mutation
const UpdateShopStatus = z.object({
  shopId: z.number(), // ID of the shop
  documentType: z.enum(["DTI", "PERMIT", "TAX_CLEARANCE"]).optional(),
  status: z.enum(["pending", "approved", "rejected", "banned"]),
  shopUserId: z.number(),
  note: z.string().nullable().optional(), // <-- Add note here
  documentUpdates: z
    .record(z.object({ status: z.string(), note: z.string().nullable().optional() }))
    .optional(),
})

// Mutation to update shop status
export default resolver.pipe(
  resolver.zod(UpdateShopStatus),
  resolver.authorize(), // Ensure user is authorized
  async ({ shopId, documentType, status, shopUserId, note, documentUpdates }, ctx: Ctx) => {
    if (documentType) {
      // Map document types to corresponding fields
      const fieldMapping = {
        DTI: { status: "dtiStatus", note: "dtiNotes" },
        PERMIT: { status: "permitStatus", note: "permitNotes" },
        TAX_CLEARANCE: { status: "taxStatus", note: "taxNotes" },
      }

      // Get the field names dynamically
      const statusField = fieldMapping[documentType].status
      const noteField = fieldMapping[documentType].note

      // Update the specific document status and note in the database
      const updatedShop = await db.shop.update({
        where: { id: shopId },
        data: {
          [statusField]: status,
          [noteField]: note,
        },
        include: {
          user: {
            include: { personalInfo: true },
          },
          products: {
            include: {
              category: true,
            },
          },
        },
      })

      return updatedShop // Return the updated shop
    } else {
      // Update the shop status directly
      const currentShop = await db.shop.findUnique({ where: { id: shopId } })
      const docUpdates: any = {}

      // Apply manual document updates if provided
      if (documentUpdates) {
        if (documentUpdates.DTI) {
          docUpdates.dtiStatus = documentUpdates.DTI.status
          if (documentUpdates.DTI.note !== undefined) docUpdates.dtiNotes = documentUpdates.DTI.note
        }
        if (documentUpdates.PERMIT) {
          docUpdates.permitStatus = documentUpdates.PERMIT.status
          if (documentUpdates.PERMIT.note !== undefined)
            docUpdates.permitNotes = documentUpdates.PERMIT.note
        }
        if (documentUpdates.TAX_CLEARANCE) {
          docUpdates.taxStatus = documentUpdates.TAX_CLEARANCE.status
          if (documentUpdates.TAX_CLEARANCE.note !== undefined)
            docUpdates.taxNotes = documentUpdates.TAX_CLEARANCE.note
        }
      } else {
        // Fallback to auto-update logic if no specific updates provided
        if (status === "approved") {
          if (currentShop?.dtiStatus === "pending" || currentShop?.dtiStatus === "resubmit")
            docUpdates.dtiStatus = "approved"
          if (currentShop?.permitStatus === "pending" || currentShop?.permitStatus === "resubmit")
            docUpdates.permitStatus = "approved"
          if (currentShop?.taxStatus === "pending" || currentShop?.taxStatus === "resubmit")
            docUpdates.taxStatus = "approved"
        } else if (status === "rejected") {
          if (currentShop?.dtiStatus === "pending" || currentShop?.dtiStatus === "resubmit") {
            docUpdates.dtiStatus = "rejected"
            docUpdates.dtiNotes = note || "Shop rejected"
          }
          if (currentShop?.permitStatus === "pending" || currentShop?.permitStatus === "resubmit") {
            docUpdates.permitStatus = "rejected"
            docUpdates.permitNotes = note || "Shop rejected"
          }
          if (currentShop?.taxStatus === "pending" || currentShop?.taxStatus === "resubmit") {
            docUpdates.taxStatus = "rejected"
            docUpdates.taxNotes = note || "Shop rejected"
          }
        }
      }

      if (status === "banned") {
        await Promise.all([
          db.reportShop.updateMany({
            where: { shopId: shopId, status: "pending" },
            data: { status: "resolved" },
          }),
          db.product.updateMany({
            where: { shopId: shopId, status: "active" },
            data: { status: "suspended" },
          }),
        ])
      }

      const updatedShop = await db.shop.update({
        where: { id: shopId },
        data: {
          status: status,
          rejectionReason: status === "rejected" ? note : null,
          banReason: status === "banned" ? note : currentShop?.banReason,
          ...docUpdates,
        },
        include: {
          user: {
            include: { personalInfo: true },
          },
          products: {
            include: {
              category: true,
            },
          },
        },
      })

      // Create audit log entry
      let action = "STATUS_CHANGED"
      let details = `Status changed to ${status}`
      if (status === "approved") {
        action = "APPROVED"
        details = "Shop application approved"
      } else if (status === "rejected") {
        action = "REJECTED"
        details = `Reason: ${note || "No reason provided"}`
      } else if (status === "banned") {
        action = "BANNED"
        details = `Reason: ${note || "No reason provided"}`
      }

      await db.shopAuditLog.create({
        data: {
          shopId: shopId,
          action: action,
          details: details,
          adminId: ctx.session?.userId,
        },
      })

      await db.user.update({
        where: { id: shopUserId },
        data: {
          isShopMode: status === "approved",
        },
      })

      // Notify the user about the shop status change
      if (status === "approved" || status === "rejected" || status === "banned") {
        let title = `Shop Registration ${status === "approved" ? "Approved" : "Rejected"}`
        let message = ""

        if (status === "approved") {
          title = "Shop Registration Approved"
          message = `Congratulations! Your shop "${updatedShop.shopName}" has been approved.`
        } else if (status === "rejected") {
          title = "Shop Registration Rejected"
          message = `Your shop registration for "${
            updatedShop.shopName
          }" has been rejected. Reason: ${note || "No reason provided."}`
        } else if (status === "banned") {
          title = "Your Shop Has Been Banned"
          message = `Your shop "${
            updatedShop.shopName
          }" has been banned by an administrator. Reason: ${note || "No reason provided."}`
        }

        await db.notification.create({
          data: {
            userId: shopUserId,
            title,
            message,
            isRead: false,
          },
        })
      }

      return updatedShop
    }
  }
)
