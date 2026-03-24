import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async () => {
  const attributes = await db.attribute.findMany({
    include: {
      values: true,
    },
  })
  return attributes
})
