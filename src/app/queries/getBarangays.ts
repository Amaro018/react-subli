import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async () => {
  return await db.barangay.findMany({
    orderBy: { name: "asc" },
  })
})
