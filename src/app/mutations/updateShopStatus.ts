import db from "db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

// Define schema for the mutation
const UpdateShopStatus = z.object({
  shopId: z.number(), // ID of the shop
  documentType: z.enum(["DTI", "PERMIT", "TAX_CLEARANCE"]),
  status: z.enum(["pending", "approved", "rejected"]),
  shopUserId: z.number(),
  note: z.string().optional(), // <-- Add note here
})

// Mutation to update shop status
export default resolver.pipe(
  resolver.zod(UpdateShopStatus),
  resolver.authorize(), // Ensure user is authorized
  async ({ shopId, documentType, status, shopUserId, note }) => {
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
    })

    // Check if all three statuses are approved
    if (
      updatedShop.dtiStatus === "approved" &&
      updatedShop.permitStatus === "approved" &&
      updatedShop.taxStatus === "approved"
    ) {
      // Update the overall shop status to "approved"
      const finalUpdatedShop = await db.shop.update({
        where: { id: shopId },
        data: {
          status: "approved",
        },
      })

      await db.user.update({
        where: { id: shopUserId },
        data: {
          isShopMode: true,
        },
      })
      return finalUpdatedShop
    }

    return updatedShop // Return the updated shop
  }
)
