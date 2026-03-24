import db from "db"
import { z } from "zod"
import { Prisma } from "@prisma/client" // 👈 add this
import fs from "fs"
import path from "path"

export const UpdateProductInput = z.object({
  id: z.number(),
  name: z.string(),
  deliveryOption: z.string(),
  description: z.string().nullable().optional(),
  status: z.string(),
  categoryid: z.number(),
  images: z
    .array(
      z.object({
        url: z.string().nonempty("Image URL is required"),
        attributeValueId: z.number().int().nullable().optional(),
      })
    )
    .optional(),
  variants: z.array(
    z.object({
      id: z.number().optional(), // 👈 allow optional for new variants
      attributes: z.array(z.object({ attributeValueId: z.number() })).optional(),
      quantity: z.number(),
      price: z.number(),
      originalMSRP: z.number().optional(),
      originalPurchaseDate: z.union([z.string(), z.date()]).optional(),
      condition: z.string().optional(),
      damagePolicies: z.array(
        z.object({
          id: z.number().optional(), // 👈 also optional for new
          damageSeverity: z.string(),
          damageSeverityPercent: z.number(),
          description: z.string().nullable().optional(),
        })
      ),
    })
  ),
})

export default async function updateProduct(input: z.infer<typeof UpdateProductInput>) {
  const { id, name, deliveryOption, status, categoryid, description, variants, images } = input

  // 0. Get existing product images to find which ones are being removed
  const existingProduct = await db.product.findUnique({
    where: { id },
    include: { images: true },
  })
  const existingImageUrls = existingProduct?.images.map((img) => img.url) || []
  const incomingImageUrls = images?.map((img) => img.url) || []
  const removedImageUrls = existingImageUrls.filter((url) => !incomingImageUrls.includes(url))

  // 1. Find existing variant IDs for this product
  const existingVariants = await db.productVariant.findMany({
    where: { productId: id },
    select: { id: true },
  })

  const existingVariantIds = existingVariants.map((v) => v.id)
  const incomingVariantIds = variants.filter((v) => v.id).map((v) => v.id!) // only keep defined

  // 2. Find variants to delete
  const toDeleteVariantIds = existingVariantIds.filter((vid) => !incomingVariantIds.includes(vid))

  // 3. Delete them
  if (toDeleteVariantIds.length > 0) {
    try {
      await db.productVariant.deleteMany({
        where: { id: { in: toDeleteVariantIds } },
      })
    } catch (error) {
      throw new Error(
        "Cannot completely delete variants that have rental history. Please keep them and set their quantity to 0 instead."
      )
    }
  }

  // 4. Proceed with update + upserts
  const product = await db.product.update({
    where: { id },
    data: {
      name,
      deliveryOption,
      description,
      status,
      categoryid,
      ...(images
        ? {
            images: {
              deleteMany: {}, // Clean up old image references
              create: images.map((img) => ({
                url: img.url,
                ...(img.attributeValueId
                  ? { attributeValue: { connect: { id: img.attributeValueId } } }
                  : {}),
              })),
            },
          }
        : {}),
      variants: {
        upsert: variants.map(
          (v): Prisma.ProductVariantUpsertWithWhereUniqueWithoutProductInput => ({
            where: { id: v.id ?? 0 }, // 👈 if id is missing, Prisma will create
            update: {
              price: v.price,
              quantity: v.quantity,
              originalMSRP: v.originalMSRP ?? 0,
              originalPurchaseDate: v.originalPurchaseDate
                ? new Date(v.originalPurchaseDate)
                : new Date(),
              condition: v.condition ?? "New",
              attributes: {
                deleteMany: {}, // Delete old attributes and recreate them to ensure synchronization
                create:
                  v.attributes?.map((attr) => ({
                    attributeValue: { connect: { id: attr.attributeValueId } },
                  })) || [],
              },
              damagePolicies: {
                upsert: v.damagePolicies.map(
                  (d): Prisma.DamagePoliciesUpsertWithWhereUniqueWithoutProductVariantInput => ({
                    where: { id: d.id ?? 0 },
                    update: {
                      damageSeverityPercent: d.damageSeverityPercent,
                      description: d.description,
                    },
                    create: {
                      damageSeverity: d.damageSeverity,
                      damageSeverityPercent: d.damageSeverityPercent,
                      description: d.description,
                    },
                  })
                ),
              },
            },
            create: {
              price: v.price,
              quantity: v.quantity,
              originalMSRP: v.originalMSRP ?? 0,
              originalPurchaseDate: v.originalPurchaseDate
                ? new Date(v.originalPurchaseDate)
                : new Date(),
              condition: v.condition ?? "New",
              attributes: {
                create:
                  v.attributes?.map((attr) => ({
                    attributeValue: { connect: { id: attr.attributeValueId } },
                  })) || [],
              },
              damagePolicies: {
                create: v.damagePolicies.map((d) => ({
                  damageSeverity: d.damageSeverity,
                  damageSeverityPercent: d.damageSeverityPercent,
                  description: d.description,
                })),
              },
            },
          })
        ),
      },
    },
    include: {
      category: true,
      variants: { include: { damagePolicies: true } },
    },
  })

  // 5. Clean up orphaned images from the server
  for (const url of removedImageUrls) {
    // Safety check: Ensure no OTHER product (e.g., a duplicated copy) is still using this image
    const usageCount = await db.product.count({
      where: { images: { some: { url } } },
    })

    if (usageCount === 0) {
      try {
        const filePath = path.join(process.cwd(), "public", "uploads", "products", url)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch (err) {
        console.error(`Failed to delete image file: ${url}`, err)
      }
    }
  }

  return product
}
