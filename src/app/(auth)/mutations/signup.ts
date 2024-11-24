import db from "db"
import { SecurePassword } from "@blitzjs/auth/secure-password"

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

    // Create a session for the user
    await blitzContext.session.$create({
      userId: user.id,
      role: user.role,
    })

    return { userId: blitzContext.session.userId, ...user }
  } catch (error) {
    throw new Error("Error creating user: " + error)
  }
}
