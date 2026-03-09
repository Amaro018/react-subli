import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const UpdateAddressSchema = z.object({
  id: z.string(),
  street: z.string().optional(),
  barangay: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  isDefault: z.boolean().optional(),
})

export default resolver.pipe(
  resolver.zod(UpdateAddressSchema),
  resolver.authorize(),
  async ({ id, ...data }) => {
    const idInt = parseInt(id)

    if (data.isDefault) {
      const address = await db.address.findUnique({ where: { id: idInt } })
      if (address) {
        await db.address.updateMany({
          where: { userId: address.userId, isDefault: true },
          data: { isDefault: false },
        })
      }
    }

    const address = await db.address.update({
      where: { id: idInt },
      data,
    })

    return address
  }
)
