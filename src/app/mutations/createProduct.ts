import db from "db"
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
      color: z.string().optional(),
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
      shopId: data.shopId,
      name: data.productName,
      description: data.description,
      status: data.status ?? "active",
      deliveryOption: data.deliveryOption,
      images: {
        create: data.productImages.map((url) => ({ url })), // Replace createMany with create
      },
      variants: {
        create: data.variants, // Replace createMany with create
      },
      categories: {
        connect: { id: data.category },
      },
    },
  })

  return product
}
