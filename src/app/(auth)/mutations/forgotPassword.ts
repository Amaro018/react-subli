// import { generateToken, hash256 } from "@blitzjs/auth"
// import { resolver } from "@blitzjs/rpc"
// import db from "db"
// import { forgotPasswordMailer } from "mailers/forgotPasswordMailer"
// import { ForgotPassword } from "../validations"
// import { sendEmail } from "src/app/utils/mailer"

// const RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS = 4

// export default resolver.pipe(resolver.zod(ForgotPassword), async ({ email }) => {
//   // 1. Get the user
//   const user = await db.user.findFirst({ where: { email: email.toLowerCase() } })

//   // 2. Generate the token and expiration date.
//   const token = generateToken()
//   const hashedToken = hash256(token)
//   const expiresAt = new Date()
//   expiresAt.setHours(expiresAt.getHours() + RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS)

//   // 3. If user with this email was found
//   if (user) {
//     // 4. Delete any existing password reset tokens
//     await db.token.deleteMany({ where: { type: "RESET_PASSWORD", userId: user.id } })
//     // 5. Save this new token in the database.
//     await db.token.create({
//       data: {
//         user: { connect: { id: user.id } },
//         type: "RESET_PASSWORD",
//         expiresAt,
//         hashedToken,
//         sentTo: user.email,
//       },
//     })

//     await sendEmail(
//       user.email,token,
//       "Test Email from Blitz.js",
//       "<h1>Hello!</h1><p>This is a test email from Blitz.js using Mailtrap.</p>"
//     );
//     // 6. Send the email
//     // await forgotPasswordMailer({ to: user.email, token }).send()
//   } else {
//     // 7. If no user found wait the same time so attackers can't tell the difference
//     await new Promise((resolve) => setTimeout(resolve, 750))
//   }

//   // 8. Return the same result whether a password reset email was sent or not
//   return
// })

import { generateToken, hash256 } from "@blitzjs/auth"
import { resolver } from "@blitzjs/rpc"
import db from "db"
import { ForgotPassword } from "../validations"
import { sendEmail } from "src/app/utils/mailer"

const RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS = 4

export default resolver.pipe(resolver.zod(ForgotPassword), async ({ email }) => {
  // 1. Get the user by email
  const user = await db.user.findFirst({
    where: { email: email.toLowerCase() },
    include: { personalInfo: true },
  })

  // 2. Generate the reset token and expiration
  const token = generateToken()
  const hashedToken = hash256(token)
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS)

  // 3. If user exists
  if (user) {
    // 4. Delete any existing reset tokens for the user
    await db.token.deleteMany({ where: { type: "RESET_PASSWORD", userId: user.id } })

    // 5. Save the new reset token in the database
    await db.token.create({
      data: {
        user: { connect: { id: user.id } },
        type: "RESET_PASSWORD",
        expiresAt,
        hashedToken,
        sentTo: user.email,
      },
    })

    // 6. Construct the reset URL
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`

    // 7. Send the reset password email
    const emailSubject = "Reset your password"
    const emailHtml = `
      <h1>Reset Your Password</h1>
      <p>Hello ${user.personalInfo?.firstName || "there"},</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in ${RESET_PASSWORD_TOKEN_EXPIRATION_IN_HOURS} hours.</p>
    `

    await sendEmail(user.email, emailSubject, emailHtml)
  } else {
    // 8. If no user found, wait the same time to prevent timing attacks
    await new Promise((resolve) => setTimeout(resolve, 750))
  }

  // 9. Return a generic response for security purposes
  return
})
