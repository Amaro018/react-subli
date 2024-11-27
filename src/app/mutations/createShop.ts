import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

// Define input validation schema
const CreateShopInput = z.object({
  userId: z.number(),
  shopName: z.string(),
  email: z.string().email(),
  street: z.string(),
  city: z.string(),
  region: z.string(),
  country: z.string(),
  zipCode: z.string(),
  contact: z.string(),
  description: z.string().optional(),
  imageProfile: z.string().optional(),
  linkFacebook: z.string().optional(),
  imageBg: z.string().optional(),
  documentDTI: z.string(),
  documentPermit: z.string(),
  documentTax: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreateShopInput),
  resolver.authorize(), // Ensure the user is logged in
  async (input) => {
    // Create the shop in the database
    const shop = await db.shop.create({
      data: {
        ...input,
        status: "pending", // Set default status
        dtiStatus: "pending",
        permitStatus: "pending",
        taxStatus: "pending",
      },
    })

    return shop
  }
)
