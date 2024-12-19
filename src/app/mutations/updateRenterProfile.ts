import db from "db"
import { z } from "zod"

// Validate the input
const UpdateFirstName = z.object({
  userId: z.number(), // Ensure you pass the userId
  firstName: z.string().nonempty("First name cannot be empty"),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  birthDate: z.date().optional(),
  phoneNumber: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
})

export default async function updateFirstName(input: z.infer<typeof UpdateFirstName>) {
  const data = UpdateFirstName.parse(input)

  // Update the user in the database
  const user = await db.user.update({
    where: { id: data.userId },
    data: {
      personalInfo: {
        update: {
          firstName: data.firstName,
          middleName: data.middleName,
          lastName: data.lastName,
          birthDate: data.birthDate,
          phoneNumber: data.phoneNumber,
          street: data.street,
          city: data.city,
          region: data.region,
          country: data.country,
          zipCode: data.zipCode,
        },
      },
    }, // Assuming you are using Prisma's nested writes
  })

  return user
}
