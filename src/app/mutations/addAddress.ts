import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const CreateAddressSchema = z.object({
  street: z.string(),
  barangay: z.string(),
  city: z.string(),
  province: z.string(),
  country: z.string(),
  zipCode: z.string(),
  isDefault: z.boolean().optional(),
  userId: z.string(),
})

export default resolver.pipe(
  resolver.zod(CreateAddressSchema),
  resolver.authorize(),
  async (input) => {
    const data = {
      ...input,
      userId: parseInt(input.userId),
    }

    if (data.isDefault) {
      await db.address.updateMany({
        where: { userId: data.userId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const address = await db.address.create({
      data,
    })

    return address
  }
)
