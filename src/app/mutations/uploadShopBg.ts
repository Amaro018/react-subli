// app/mutations/uploadProductImage.ts
import { resolver } from "@blitzjs/rpc"
import fs from "fs"
import path from "path"

interface UploadProductImageInput {
  fileName: string
  data: string // Base64 data string
  targetDirectory: "shop-bg" | "dti" | "shop-profile" | "permit" | "tax"
}

export default resolver.pipe(
  async ({ fileName, data, targetDirectory }: UploadProductImageInput) => {
    const buffer = Buffer.from(data.split(",")[1], "base64") // Convert base64 to buffer
    const uniqueFileName = `${fileName}`

    const filePath = path.join(process.cwd(), "public", "uploads", targetDirectory, uniqueFileName)
    // Save the file to the local filesystem
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true })

    await fs.promises.writeFile(filePath, buffer)
    // Construct the absolute URL
    const fileUrl = `${
      process.env.BASE_URL || "http://localhost:3000"
    }/uploads/${targetDirectory}/${uniqueFileName}`

    return fileUrl // Return absolute URL
  }
)
