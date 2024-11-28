import { resolver } from "@blitzjs/rpc"
import db from "db"

const getUsersRegisteringShop = resolver.pipe(async () => {
  // Fetch users who are registering a shop
  const users = await db.user.findMany({
    where: {
      OR: [
        { isShopMode: true }, // Users in "shop mode"
        { isShopRegistered: true }, // Users who have already registered a shop
      ],
    },
    include: {
      shop: true, // Include related shop data, if it exists
    },
  })

  return users
})

export default getUsersRegisteringShop
