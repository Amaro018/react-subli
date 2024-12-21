import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

// Define input validation schema for updating documents
const UpdateShopDocumentsInput = z.object({
  shopId: z.number(), // Ensure shop ID is provided
  documentDTI: z.string().optional(),
  documentPermit: z.string().optional(),
  documentTax: z.string().optional(),
  dtiStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  permitStatus: z.enum(["pending", "approved", "rejected"]).optional(),
  taxStatus: z.enum(["pending", "approved", "rejected"]).optional(),
})

export default resolver.pipe(
  resolver.zod(UpdateShopDocumentsInput),
  resolver.authorize(), // Ensure the user is logged in
  async (input) => {
    const { shopId, ...updateData } = input

    // Update only the provided fields
    const shop = await db.shop.update({
      where: { id: shopId },
      data: {
        ...updateData,
      },
    })

    return shop
  }
)
