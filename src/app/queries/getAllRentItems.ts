import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(async () => {
  // Automatically flag items as overdue if they pass their end date and haven't been returned
  await db.rentItem.updateMany({
    where: {
      status: { in: ["rendering", "on_hand"] },
      endDate: { lt: new Date() },
    },
    data: { status: "overdue" },
  })

  const rentItems = await db.rentItem.findMany({
    include: {
      productVariant: {
        include: {
          attributes: {
            include: {
              attributeValue: {
                include: {
                  attribute: true,
                },
              },
            },
          },
          product: {
            include: {
              variants: true,
              images: true,
              category: true,
              shop: true,
            },
          },
          damagePolicies: true,
        },
      },
    },
  })

  return rentItems
})
