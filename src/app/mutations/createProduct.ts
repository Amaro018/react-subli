import db from "db"
import { connect } from "http2"
import { z } from "zod"

// Zod schema for input validation
const CreateProductInput = z.object({
  shopId: z.number().int().positive("Shop ID is required"),
  productName: z.string().nonempty("Product name is required"),
  description: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  deliveryOption: z.enum(["DELIVERY", "PICKUP", "BOTH"]),
  productImages: z.array(z.string().nonempty("Image URL is required")),
  variants: z.array(
    z.object({
      size: z.string().optional(),
      color: z.number().int().optional(),
      quantity: z.number().min(0, "Quantity must be a positive number"),
      price: z.number().min(0, "Price must be a positive number"),
    })
  ),
  category: z.number(),
})

export default async function createProduct(input: z.infer<typeof CreateProductInput>) {
  const data = CreateProductInput.parse(input) // Validate input using the Zod schema

  const product = await db.product.create({
    data: {
      name: data.productName,
      description: data.description,
      status: data.status ?? "active",
      deliveryOption: data.deliveryOption,
      images: {
        create: data.productImages.map((url) => ({ url })), // Create associated images
      },
      variants: {
        create: data.variants.map((variant) => ({
          size: variant.size,
          colorId: variant.color, // Associate color with colorId
          quantity: variant.quantity,
          price: variant.price,
        })), // Create associated variants
      },
      category: {
        connect: { id: data.category }, // Connect category via its ID
      },
      shop: {
        connect: { id: data.shopId },
      },
    },
  })

  return product
}
