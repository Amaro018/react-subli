import db from "db"
import { z } from "zod"
import fs from "fs"
import path from "path"

// Zod schema for input validation
const CreateProductInput = z.object({
  shopId: z.number().int().positive("Shop ID is required"),
  name: z.string().nonempty("Product name is required"),
  description: z.string().nullable().optional(),
  status: z.string().optional(),
  deliveryOption: z.string(),
  images: z.array(
    z.object({
      fileName: z.string().nonempty("Image file name is required"),
      fileData: z.string().nonempty("Image data is required"),
      attributeValueId: z.number().int().nullable().optional(),
      isThumbnail: z.boolean().optional(),
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

  const uploadedImageUrls: string[] = []

  try {
    // 1. Save images to the filesystem
    const imageCreateData = await Promise.all(
      data.images.map(async (img) => {
        const base64Data = img.fileData.includes(",") ? img.fileData.split(",")[1] : img.fileData
        const buffer = Buffer.from(base64Data || "", "base64")
        const uniqueFileName = `${Date.now()}-${path.basename(img.fileName)}`
        const filePath = path.join(process.cwd(), "public", "uploads", "products", uniqueFileName)

        await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
        await fs.promises.writeFile(filePath, buffer as any)

        uploadedImageUrls.push(uniqueFileName) // Track saved files for potential cleanup

        return {
          url: uniqueFileName,
          attributeValueId: img.attributeValueId,
          isThumbnail: img.isThumbnail,
        }
      })
    )

    // 2. Create the product and all its relations in the database
    const product = await db.product.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        status: data.status ?? "active",
        deliveryOption: data.deliveryOption,
        images: {
          create: imageCreateData.map((img) => ({
            url: img.url,
            ...(img.attributeValueId
              ? { attributeValue: { connect: { id: img.attributeValueId } } }
              : {}),
            isThumbnail: img.isThumbnail,
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
          })),
        },
        category: {
          connect: { id: data.categoryid },
        },
        shop: {
          connect: { id: data.shopId },
        },
      },
    })

    // 3. Create notifications
    const shop = await db.shop.findUnique({ where: { id: data.shopId } })
    const admins = await db.user.findMany({ where: { OR: [{ isAdmin: true }, { role: "ADMIN" }] } })

    if (shop) {
      const notificationsData: {
        userId: number
        title: string
        message: string
        isRead: boolean
      }[] = []

      notificationsData.push({
        userId: shop.userId,
        title: "Product Created",
        message: `Your product "${product.name}" has been created successfully. [ID: ${product.id}]`,
        isRead: false,
      })

      admins.forEach((admin) => {
        if (admin.id !== shop.userId) {
          notificationsData.push({
            userId: admin.id,
            title: "New Product Listed",
            message: `A new product "${product.name}" was just listed by shop "${shop.shopName}". [ID: ${product.id}]`,
            isRead: false,
          })
        }
      })

      if (notificationsData.length > 0) {
        await Promise.all(notificationsData.map((data) => db.notification.create({ data })))
      }
    }

    return product
  } catch (error) {
    // 4. If any step fails, clean up the images that were saved to the filesystem
    for (const url of uploadedImageUrls) {
      try {
        const filePath = path.join(process.cwd(), "public", "uploads", "products", url)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      } catch (cleanupError) {
        console.error(
          `Failed to cleanup orphaned image file during createProduct error: ${url}`,
          cleanupError
        )
      }
    }

    // 5. Re-throw the original error to be handled by the client
    throw error
  }
}
