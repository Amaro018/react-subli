import db from "db"
import { z } from "zod"
import fs from "fs"
import path from "path"

export const DeleteProductInput = z.object({
  id: z.number(),
})

export default async function deleteProduct(input: z.infer<typeof DeleteProductInput>) {
  const { id } = input

  const product = await db.product.findUnique({
    where: { id },
    include: {
      variants: { include: { rentItems: true } },
      images: true,
    },
  })

  if (!product) throw new Error("Product not found")

  // Backend Safety Check: Prevent permanent deletion if there is any rental history
  const hasRentalHistory = product.variants.some((v) => v.rentItems.length > 0)
  if (hasRentalHistory) {
    throw new Error(
      "Cannot permanently delete a product with rental history. Please archive it instead."
    )
  }

  // Extract image URLs before deleting the product
  const imageUrls = product.images.map((img) => img.url)

  // Permanently wipe the product from the database
  await db.product.delete({ where: { id } })

  // Clean up orphaned images from the server
  for (const url of imageUrls) {
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

  return true
}
