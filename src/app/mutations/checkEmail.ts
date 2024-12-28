// app/auth/mutations/checkEmail.ts
import { resolver } from "@blitzjs/rpc"
import db from "db"
import * as z from "zod"

const CheckEmail = z.object({
  email: z.string().email(),
})

export default resolver.pipe(
  resolver.zod(CheckEmail), // Validate email format
  async ({ email }) => {
    // Check if the email format is valid
    const isValidEmail = CheckEmail.safeParse({ email })

    if (!isValidEmail.success) {
      return {
        success: false,
        message: "Email is not valid",
      }
    }

    // Check if the email already exists in the database
    const existingUser = await db.user.findFirst({ where: { email } })

    if (existingUser) {
      return {
        success: false,
        message: "This email is already being used",
      }
    }

    return {
      success: true,
      message: "The email is available",
    }
  }
)
