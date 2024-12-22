import db from "db"
import { SecurePassword } from "@blitzjs/auth/secure-password"
import { generateToken, hash256 } from "@blitzjs/auth"
import { sendEmail } from "src/app/utils/mailer"

const EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS = 24

export default async function signup(
  input: {
    email: string
    password: string
    firstName: string
    middleName?: string
    lastName: string
    birthDate: Date
    phoneNumber?: string
    street: string
    city: string
    region: string
    country: string
    zipCode: string
  },
  ctx: any
) {
  const blitzContext = ctx

  // Hash the user's password
  const hashedPassword = await SecurePassword.hash(input.password)

  try {
    // Create the user with associated PersonalInfo
    const user = await db.user.create({
      data: {
        email: input.email,
        hashedPassword,
        emailVerified: false, // User starts unverified
        personalInfo: {
          create: {
            firstName: input.firstName,
            middleName: input.middleName,
            lastName: input.lastName,
            birthDate: input.birthDate,
            phoneNumber: input.phoneNumber,
            street: input.street,
            city: input.city,
            region: input.region,
            country: input.country,
            zipCode: input.zipCode,
          },
        },
      },
    })

    // Generate the email verification token
    const token = generateToken()
    const hashedToken = hash256(token)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS)

    // Save the verification token in the database
    await db.token.create({
      data: {
        user: { connect: { id: user.id } },
        type: "EMAIL_VERIFICATION",
        hashedToken,
        expiresAt,
        sentTo: user.email,
      },
    })

    // Send the email verification email
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
    const emailSubject = "Verify Your Email Address"
    const emailHtml = `
      <h1>Welcome to Our App!</h1>
      <p>Hello ${input.firstName},</p>
      <p>Thank you for signing up! Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in ${EMAIL_VERIFICATION_TOKEN_EXPIRATION_HOURS} hours.</p>
    `

    await sendEmail(user.email, emailSubject, emailHtml)

    // Create a session for the user but prevent access to restricted routes until email is verified
    await blitzContext.session.$create({
      userId: user.id,
      role: user.role,
      emailVerified: false,
    })

    return { userId: blitzContext.session.userId, ...user }
  } catch (error) {
    throw new Error("Error creating user: " + error)
  }
}
