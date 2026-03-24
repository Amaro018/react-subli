import db from "db"
import { z } from "zod"

export const DuplicateProductInput = z.object({
  id: z.number(),
})

export default async function duplicateProduct(input: z.infer<typeof DuplicateProductInput>) {
  const { id } = input

  // 1. Fetch the original product with all its nested configurations
  const original = await db.product.findUnique({
    where: { id },
    include: {
      images: true,
      variants: {
        include: {
          attributes: true,
          damagePolicies: true,
        },
      },
    },
  })

  if (!original) throw new Error("Product not found")

  // Smart Copy Naming Logic (Prevents "Name (Copy) (Copy)")
  let newName = `${original.name} (Copy)`
  const copyMatch = original.name.match(/\(Copy(?: (\d+))?\)$/)
  if (copyMatch) {
    const nextNumber = copyMatch[1] ? parseInt(copyMatch[1]) + 1 : 2
    newName = original.name.replace(/\(Copy(?: \d+)?\)$/, `(Copy ${nextNumber})`)
  }

  // 2. Create the duplicated product (Set status to 'inactive' / Draft)
  const duplicatedProduct = await db.product.create({
    data: {
      name: newName,
      description: original.description,
      deliveryOption: original.deliveryOption,
      status: "inactive",
      categoryid: original.categoryid,
      shopId: original.shopId,
      images: {
        create: original.images.map((img) => ({
          url: img.url,
          attributeValueId: img.attributeValueId,
        })),
      },
      variants: {
        create: original.variants.map((v) => ({
          price: v.price,
          quantity: v.quantity,
          originalMSRP: v.originalMSRP,
          originalPurchaseDate: v.originalPurchaseDate,
          condition: v.condition,
          attributes: {
            create: v.attributes.map((attr) => ({ attributeValueId: attr.attributeValueId })),
          },
          damagePolicies: {
            create: v.damagePolicies.map((dp) => ({
              damageSeverity: dp.damageSeverity,
              damageSeverityPercent: dp.damageSeverityPercent,
              description: dp.description,
            })),
          },
        })),
      },
    },
  })

  return duplicatedProduct
}
