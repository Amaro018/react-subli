import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async () => {
  return db.category.findMany({
    orderBy: { name: "asc" },
  })
})
