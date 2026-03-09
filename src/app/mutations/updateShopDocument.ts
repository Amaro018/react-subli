import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import fs from "fs"
import path from "path"

const UpdateShopDocument = z.object({
  shopId: z.number(),
  documentDTI: z.string().optional(),
  dtiFile: z.string().optional(),
  dtiStatus: z.string().optional(),
  documentPermit: z.string().optional(),
  permitFile: z.string().optional(),
  permitStatus: z.string().optional(),
  documentTax: z.string().optional(),
  taxFile: z.string().optional(),
  taxStatus: z.string().optional(),
  status: z.string().optional(),
})

export default resolver.pipe(
  resolver.zod(UpdateShopDocument),
  resolver.authorize(),
  async ({ shopId, ...data }) => {
    // 1. Fetch the current shop to get the old filenames
    const currentShop = await db.shop.findUnique({
      where: { id: shopId },
    })

    if (!currentShop) throw new Error("Shop not found")

    const publicFolder = path.join(process.cwd(), "public")

    // 2. Helper function to delete a file
    const deleteOldFile = (subfolder: string, fileName: string | null) => {
      if (!fileName) return
      const file = fileName.split("/").pop()?.split("?")[0] || fileName
      const filePath = path.join(publicFolder, "uploads", subfolder, file)
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
        } catch (error) {
          console.error(`Failed to delete file ${filePath}:`, error)
        }
      }
    }

    const saveFile = async (subfolder: string, fileName: string, fileData: string) => {
      const base64Data = fileData.includes(",") ? fileData.split(",")[1] : fileData
      const buffer = Buffer.from(base64Data || "", "base64")
      const safeFileName = path.basename(fileName)
      const filePath = path.join(publicFolder, "uploads", subfolder, safeFileName)
      await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
      await fs.promises.writeFile(filePath, buffer as any)
    }

    const updateData: any = { ...data }
    delete updateData.dtiFile
    delete updateData.permitFile
    delete updateData.taxFile

    const changedDocs: string[] = []

    if (data.documentDTI) {
      if (data.dtiFile) {
        const uniqueFileName = `${Date.now()}-${data.documentDTI}`
        await saveFile("dti", uniqueFileName, data.dtiFile)
        updateData.documentDTI = uniqueFileName
      }
      updateData.dtiNotes = ""
      if (currentShop.dtiStatus === "rejected" || data.documentDTI !== currentShop.documentDTI) {
        updateData.dtiStatus = data.dtiStatus || "pending"
        changedDocs.push("DTI")
      }
    }
    if (data.documentPermit) {
      if (data.permitFile) {
        const uniqueFileName = `${Date.now()}-${data.documentPermit}`
        await saveFile("permit", uniqueFileName, data.permitFile)
        updateData.documentPermit = uniqueFileName
      }
      updateData.permitNotes = ""
      if (
        currentShop.permitStatus === "rejected" ||
        data.documentPermit !== currentShop.documentPermit
      ) {
        updateData.permitStatus = data.permitStatus || "pending"
        changedDocs.push("Permit")
      }
    }
    if (data.documentTax) {
      if (data.taxFile) {
        const uniqueFileName = `${Date.now()}-${data.documentTax}`
        await saveFile("tax", uniqueFileName, data.taxFile)
        updateData.documentTax = uniqueFileName
      }
      updateData.taxNotes = ""
      if (currentShop.taxStatus === "rejected" || data.documentTax !== currentShop.taxStatus) {
        updateData.taxStatus = data.taxStatus || "pending"
        changedDocs.push("Tax Clearance")
      }
    }

    // 4. Update the shop in the database
    const shop = await db.shop.update({
      where: { id: shopId },
      data: updateData,
    })

    // 5. Check and delete old files if new ones are provided (Run AFTER DB update)
    if (
      data.documentDTI &&
      currentShop.documentDTI &&
      data.documentDTI !== currentShop.documentDTI
    ) {
      deleteOldFile("dti", currentShop.documentDTI)
    }

    if (
      data.documentPermit &&
      currentShop.documentPermit &&
      data.documentPermit !== currentShop.documentPermit
    ) {
      deleteOldFile("permit", currentShop.documentPermit)
    }

    if (
      data.documentTax &&
      currentShop.documentTax &&
      data.documentTax !== currentShop.documentTax
    ) {
      deleteOldFile("tax", currentShop.documentTax)
    }

    // 5. Notify Admins
    if (changedDocs.length > 0) {
      try {
        const admins = await db.user.findMany({
          where: { role: "ADMIN" },
        })

        if (admins.length > 0) {
          await Promise.all(
            admins.map((admin) =>
              db.notification.create({
                data: {
                  userId: admin.id,
                  title: "Document Resubmitted",
                  message: `Shop "${currentShop.shopName}" has resubmitted their ${changedDocs.join(
                    ", "
                  )}.`,
                  isRead: false,
                },
              })
            )
          )
        }
      } catch (error) {
        console.error("Failed to notify admins:", error)
      }
    }

    return shop
  }
)
