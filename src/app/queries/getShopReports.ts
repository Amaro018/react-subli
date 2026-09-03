"use server"
import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize("ADMIN"), async () => {
  const shops = await db.shop.findMany({
    where: {
      reports: {
        some: {
          status: "pending",
        },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          personalInfo: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      reports: {
        where: {
          status: "pending",
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return shops.map((shop) => ({
    shop: {
      ...shop,
      user: shop.user,
    },
    reports: shop.reports,
  }))
})
