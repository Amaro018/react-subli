import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

// Input validation schema
const CreateProductInput = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  deliveryOption: z.enum(["DELIVERY", "PICKUP", "BOTH"]),
  variants: z
    .array(
      z.object({
        size: z.string(),
        color: z.string(),
        quantity: z.number(),
        price: z.number(),
      })
    )
    .optional(),
  images: z.array(z.string()), // We'll use image URLs (assumes you handle uploads elsewhere)
  category: z.number(),
})

export default resolver.pipe(
  resolver.zod(CreateProductInput),
  resolver.authorize(), // Ensure user is authenticated
  async (input) => {
    // Create product in the database
    const product = await db.product.create({
      data: {
        name: input.name,
        description: input.description,
        price: input.price,
        deliveryOption: input.deliveryOption,
        category: { connect: { id: input.category } },
        variants: {
          create: input.variants || [],
        },
        images: {
          create: input.images.map((url) => ({ url })), // Assuming image URLs
        },
      },
    })

    return product
  }
)
