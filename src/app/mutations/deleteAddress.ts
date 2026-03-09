import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const DeleteAddressSchema = z.object({
  id: z.string(),
})

export default resolver.pipe(
  resolver.zod(DeleteAddressSchema),
  resolver.authorize(),
  async ({ id }) => {
    const address = await db.address.delete({
      where: { id: parseInt(id) },
    })

    return address
  }
)
