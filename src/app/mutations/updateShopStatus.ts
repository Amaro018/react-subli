import db from "db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

// Define schema for the mutation
const UpdateShopStatus = z.object({
  shopId: z.number(), // ID of the shop
  documentType: z.enum(["DTI", "PERMIT", "TAX_CLEARANCE"]).optional(),
  status: z.enum(["pending", "approved", "rejected"]),
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
  async ({ shopId, documentType, status, shopUserId, note, documentUpdates }) => {
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

      const updatedShop = await db.shop.update({
        where: { id: shopId },
        data: {
          status: status,
          rejectionReason: status === "rejected" ? note : null,
          ...docUpdates,
        },
        include: {
          user: {
            include: { personalInfo: true },
          },
        },
      })

      await db.user.update({
        where: { id: shopUserId },
        data: {
          isShopMode: status === "approved",
        },
      })

      // Notify the user about the shop status change
      if (status === "approved" || status === "rejected") {
        await (db as any).notification.create({
          data: {
            userId: shopUserId,
            title: `Shop Registration ${status === "approved" ? "Approved" : "Rejected"}`,
            message:
              status === "approved"
                ? `Congratulations! Your shop "${updatedShop.shopName}" has been approved.`
                : `Your shop registration for "${
                    updatedShop.shopName
                  }" has been rejected. Reason: ${note || "No reason provided."}`,
            isRead: false,
          },
        })
      }

      return updatedShop
    }
  }
)
