import { resolver } from "@blitzjs/rpc"
import db from "db"
import * as z from "zod"

const CheckEmail = z.object({
  email: z.string().email(),
})

export default resolver.pipe(resolver.zod(CheckEmail), async ({ email }) => {
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
})
