import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

// Define input validation schema
const CreateShopInput = z.object({
  userId: z.number(),
  shopName: z.string(),
  email: z.string().email(),
  street: z.string(),
  barangay: z.string(),
  city: z.string(),
  province: z.string(),
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

    await db.user.update({
      where: { id: input.userId },
      data: { isShopRegistered: true },
    })

    // Notify Admins
    const admins = await db.user.findMany({
      where: { isAdmin: true },
    })

    await Promise.all(
      admins.map((admin) =>
        (db as any).notification.create({
          data: {
            userId: admin.id,
            title: "New Shop Registration",
            message: `Shop "${shop.shopName}" has registered and is waiting for approval.`,
            isRead: false,
          },
        })
      )
    )

    // Notify the Renter (Shop Owner)
    await (db as any).notification.create({
      data: {
        userId: input.userId,
        title: "Registration Submitted",
        message: `Your shop "${shop.shopName}" has been successfully registered and is pending approval.`,
        isRead: false,
      },
    })

    return shop
  }
)
