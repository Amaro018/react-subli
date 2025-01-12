import { resolver } from "@blitzjs/rpc"
import db from "db"
import { generateToken, hash256 } from "@blitzjs/auth"
import { sendEmail } from "src/app/utils/mailer"
import { z } from "zod"

const EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS = 24

export default resolver.pipe(
  resolver.zod(
    z.object({
      email: z.string().email(),
    })
  ),
  async ({ email }) => {
    // Check if the user exists
    const user = await db.user.findFirst({ where: { email } })
    if (!user) {
      throw new Error("User not found")
    }

    // Generate a new verification token
    const token = generateToken()
    const hashedToken = hash256(token)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS)

    // Save the token in the database
    await db.token.create({
      data: {
        user: { connect: { id: user.id } },
        type: "EMAIL_VERIFICATION",
        expiresAt,
        hashedToken,
        sentTo: email,
      },
    })

    // Send verification email
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
    const emailSubject = "Verify your email address"
    const emailHtml = `
      <h1>Verify Your Email</h1>
      <p>Hello,</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in ${EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS} hours.</p>
    `
    await sendEmail(email, emailSubject, emailHtml)

    return { success: true }
  }
)
