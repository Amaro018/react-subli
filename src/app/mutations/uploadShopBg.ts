// app/mutations/uploadProductImage.ts
import { resolver } from "@blitzjs/rpc"
import fs from "fs"
import path from "path"

interface UploadProductImageInput {
  fileName: string
  data: string // Base64 data string
  targetDirectory:
    | "shop-bg"
    | "dti"
    | "shop-profile"
    | "permit"
    | "tax"
    | "products"
    | "renter-profile"
}

export default resolver.pipe(
  async ({ fileName, data, targetDirectory }: UploadProductImageInput) => {
    // Handle data URI prefix if present (e.g. "data:image/png;base64,...")
    const base64Data = data.includes(",") ? data.split(",")[1] : data
    const buffer = Buffer.from(base64Data || "", "base64")
    const uniqueFileName = path.basename(fileName)

    const filePath = path.join(process.cwd(), "public", "uploads", targetDirectory, uniqueFileName)
    // Save the file to the local filesystem
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })

    await fs.promises.writeFile(filePath, buffer as any)
    // Construct the absolute URL
    const fileUrl = `${
      process.env.BASE_URL || "http://localhost:3000"
    }/uploads/${targetDirectory}/${uniqueFileName}`

    return fileUrl // Return absolute URL
  }
)
