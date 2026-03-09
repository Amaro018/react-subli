import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const SetDefaultAddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
})

export default resolver.pipe(
  resolver.zod(SetDefaultAddressSchema),
  resolver.authorize(),
  async ({ id, userId }) => {
    const idInt = parseInt(id)
    const userIdInt = parseInt(userId)

    await db.address.updateMany({
      where: { userId: userIdInt, isDefault: true },
      data: { isDefault: false },
    })

    const address = await db.address.update({
      where: { id: idInt },
      data: { isDefault: true },
    })

    return address
  }
)
