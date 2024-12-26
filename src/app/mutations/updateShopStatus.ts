import db from "db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"

// Define schema for the mutation
const UpdateShopStatus = z.object({
  shopId: z.number(), // ID of the shop
  documentType: z.enum(["DTI", "PERMIT", "TAX_CLEARANCE"]),
  status: z.enum(["pending", "approved", "rejected"]),
  shopUserId: z.number(),
})

// Mutation to update shop status
export default resolver.pipe(
  resolver.zod(UpdateShopStatus),
  resolver.authorize(), // Ensure user is authorized
  async ({ shopId, documentType, status, shopUserId }) => {
    // Map document types to corresponding fields
    const fieldMapping = {
      DTI: "dtiStatus",
      PERMIT: "permitStatus",
      TAX_CLEARANCE: "taxStatus",
    }

    // Get the field name dynamically
    const fieldToUpdate = fieldMapping[documentType]

    // Update the specific document status in the database
    const updatedShop = await db.shop.update({
      where: { id: shopId },
      data: {
        [fieldToUpdate]: status,
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

      const finalUpdatedUser = await db.user.update({
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
