import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async () => {
  const barangays = await db.barangay.findMany({
    orderBy: { name: "asc" },
  })
  return barangays
})
