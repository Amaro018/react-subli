import db from "db"
import { z } from "zod"

// Zod schema for input validation
const CreateProductInput = z.object({
  shopId: z.number().int().positive("Shop ID is required"),
  name: z.string().nonempty("Product name is required"),
  description: z.string().nullable().optional(),
  status: z.string().optional(),
  deliveryOption: z.string(),
  images: z.array(
    z.object({
      url: z.string().nonempty("Image URL is required"),
      attributeValueId: z.number().int().nullable().optional(),
    })
  ),
  variants: z.array(
    z.object({
      attributes: z.array(z.object({ attributeValueId: z.number() })).optional(),
      quantity: z.number().min(0, "Quantity must be a positive number"),
      price: z.number().min(0, "Price must be a positive number"),
      originalMSRP: z.coerce.number().min(0).optional(),
      originalPurchaseDate: z.union([z.string(), z.date()]).optional(),
      condition: z.string().optional(),
      replacementCost: z.coerce.number().min(0).optional(),
      manualRepairCost: z.coerce.number().min(0).optional(),
      damagePolicies: z
        .array(
          z.object({
            damageSeverity: z.string(),
            damageSeverityPercent: z.number(),
            description: z.string().nullable().optional(),
          })
        )
        .optional(),
    })
  ),
  categoryid: z.number(),
  category: z.any().optional(), // ignore this, passed by form but unneeded
})

export default async function createProduct(input: z.infer<typeof CreateProductInput>) {
  const data = CreateProductInput.parse(input) // Validate input using the Zod schema

  const product = await db.product.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      status: data.status ?? "active",
      deliveryOption: data.deliveryOption,
      images: {
        create: data.images.map((img) => ({
          url: img.url,
          ...(img.attributeValueId
            ? { attributeValue: { connect: { id: img.attributeValueId } } }
            : {}),
        })),
      },
      variants: {
        create: data.variants.map((variant) => ({
          quantity: variant.quantity,
          price: variant.price,
          originalMSRP: variant.originalMSRP ?? 0,
          originalPurchaseDate: variant.originalPurchaseDate
            ? new Date(variant.originalPurchaseDate)
            : new Date(),
          condition: variant.condition ?? "New",
          attributes: {
            create:
              variant.attributes?.map((attr) => ({
                attributeValue: { connect: { id: attr.attributeValueId } },
              })) || [],
          },
          damagePolicies: {
            create:
              variant.damagePolicies?.map((dp) => ({
                damageSeverity: dp.damageSeverity,
                damageSeverityPercent: dp.damageSeverityPercent,
                description: dp.description,
              })) || [],
          },
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
