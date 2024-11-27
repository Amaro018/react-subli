import formidable from "formidable"
import path from "path"
import fs from "fs"
import { resolver } from "@blitzjs/rpc"

// Ensure the uploads folder exists
const uploadDir = path.join(process.cwd(), "public/uploads")
if (!fs.existsSync(uploadDir)) {
fs.mkdirSync(uploadDir, { recursive: true })
}

export default resolver.pipe(async (req, res) => {
return new Promise((resolve, reject) => {
const form = formidable({
multiples: false, // Set true if uploading multiple files
uploadDir: uploadDir, // Path to save files
keepExtensions: true, // Preserve file extensions
})

    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }

      // `files` contains the uploaded file details
      // Example: { myFile: { filepath: '/uploads/file.jpg', ... } }

      const uploadedFile = files.file // Access the file via its field name in the form
      if (!uploadedFile) {
        reject(new Error("File not uploaded"))
        return
      }

      const savedFilePath = path.join("/uploads", path.basename(uploadedFile.filepath))

      resolve({ fields, filePath: savedFilePath }) // Return fields and the saved file path
    })

})
})
