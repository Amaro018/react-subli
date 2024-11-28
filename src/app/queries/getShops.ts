import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async () => {
  const shops = await db.shop.findMany()
  return shops
})
