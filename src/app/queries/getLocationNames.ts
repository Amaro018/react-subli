// app/queries/locations/getLocationNames.ts

import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async () => {
  const shopStreet = await db.shop.findMany({
    select: {
      id: true,
      street: true,
      products: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  const uniqueStreets = [...new Set(shopStreet.map((loc) => loc.street))]
  return uniqueStreets
})

// import { resolver } from "@blitzjs/rpc"
// import db from "db"

// export default resolver.pipe(async () => {
//   const locations = await db.location.findMany({
//     select: {
//       name: true,
//     },
//   })

//   // return locations
//   return locations.map((loc) => loc.name)
// })
