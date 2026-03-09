import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const SetHomeAddressDefaultSchema = z.object({
  userId: z.string(),
})

export default resolver.pipe(
  resolver.zod(SetHomeAddressDefaultSchema),
  resolver.authorize(),
  async ({ userId }) => {
    const userIdInt = parseInt(userId)

    await db.address.updateMany({
      where: { userId: userIdInt, isDefault: true },
      data: { isDefault: false },
    })

    return true
  }
)
