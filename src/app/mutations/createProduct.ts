import db from "db"
import { connect } from "http2"
import { z } from "zod"

// Zod schema for input validation
const CreateProductInput = z.object({
  shopId: z.number().int().positive("Shop ID is required"),
  name: z.string().nonempty("Product name is required"),
  description: z.string(),
  status: z.enum(["active", "inactive"]),
  deliveryOption: z.enum(["DELIVERY", "PICKUP", "BOTH"]),
  images: z.array(z.string().nonempty("Image URL is required")),
  variants: z.array(
    z.object({
      size: z.string(),
      colorId: z.number().int(),
      quantity: z.number().min(0, "Quantity must be a positive number"),
      price: z.number().min(0, "Price must be a positive number"),
    })
  ),
  categoryid: z.number(),
  category: z.object({
    id: z.number(),
    name: z.string(),
  }),
})

export default async function createProduct(input: z.infer<typeof CreateProductInput>) {
  const data = CreateProductInput.parse(input) // Validate input using the Zod schema

  const uniqueVariants = data.variants.filter(
    (variant, index, self) =>
      index === self.findIndex((v) => v.size === variant.size && v.colorId === variant.colorId)
  )

  const product = await db.product.create({
    data: {
      name: data.name,
      description: data.description,
      status: data.status ?? "active",
      deliveryOption: data.deliveryOption,
      images: {
        create: data.images.map((url) => ({ url })), // Create associated images
      },
      variants: {
        create: uniqueVariants.map((variant) => ({
          size: variant.size,
          quantity: variant.quantity,
          price: variant.price,
          colorId: variant.colorId, // Associate color with colorId
        })), // Create associated variants
      },
      category: {
        connect: { id: data.categoryid },
      },
      shop: {
        connect: { id: data.shopId },
      },
    },
  })

  return product
}
