import db from "db"
import { z } from "zod"
import { Prisma } from "@prisma/client" // 👈 add this

export const UpdateProductInput = z.object({
  id: z.number(),
  name: z.string(),
  deliveryOption: z.string(),
  description: z.string(),
  status: z.string(),
  categoryid: z.number(),
  variants: z.array(
    z.object({
      id: z.number().optional(), // 👈 allow optional for new variants
      size: z.string(),
      colorId: z.number(),
      quantity: z.number(),
      price: z.number(),
      replacementCost: z.number(),
      manualRepairCost: z.number(),
      damagePolicies: z.array(
        z.object({
          id: z.number().optional(), // 👈 also optional for new
          damageSeverity: z.string(),
          damageSeverityPercent: z.number(),
        })
      ),
    })
  ),
})

export default async function updateProduct(input: z.infer<typeof UpdateProductInput>) {
  const { id, name, deliveryOption, status, categoryid, description, variants } = input

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
    await db.productVariant.deleteMany({
      where: { id: { in: toDeleteVariantIds } },
    })
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
      variants: {
        upsert: variants.map(
          (v): Prisma.ProductVariantUpsertWithWhereUniqueWithoutProductInput => ({
            where: { id: v.id ?? 0 }, // 👈 if id is missing, Prisma will create
            update: {
              size: v.size,
              colorId: v.colorId,
              price: v.price,
              quantity: v.quantity,
              replacementCost: v.replacementCost,
              manualRepairCost: v.manualRepairCost,
              damagePolicies: {
                upsert: v.damagePolicies.map(
                  (d): Prisma.DamagePoliciesUpsertWithWhereUniqueWithoutProductVariantInput => ({
                    where: { id: d.id ?? 0 },
                    update: { damageSeverityPercent: d.damageSeverityPercent },
                    create: {
                      damageSeverity: d.damageSeverity,
                      damageSeverityPercent: d.damageSeverityPercent,
                    },
                  })
                ),
              },
            },
            create: {
              size: v.size,
              colorId: v.colorId,
              price: v.price,
              quantity: v.quantity,
              replacementCost: v.replacementCost,
              manualRepairCost: v.manualRepairCost,
              damagePolicies: {
                create: v.damagePolicies.map((d) => ({
                  damageSeverity: d.damageSeverity,
                  damageSeverityPercent: d.damageSeverityPercent,
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

  return product
}
