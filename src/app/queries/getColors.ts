import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async () => {
  const colors = await db.color.findMany()
  return colors
})
