import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize(), async () => {
  const aggregate = await db.rent.aggregate({
    _sum: {
      totalPrice: true,
    },
  })

  return aggregate._sum.totalPrice || 0
})
