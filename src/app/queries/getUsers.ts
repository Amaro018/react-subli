import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

// Define the schema
export default resolver.pipe(resolver.authorize(), async () => {
  return await db.user.findMany()
})
