import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize(), async (_, ctx) => {
  const userId = ctx.session.userId

  const invoices = await db.invoice.findMany({
    where: {
      rent: {
        userId: userId,
      },
    },
    include: {
      items: true,
      payments: true,
      rent: {
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: {
                    select: {
                      name: true,
                      images: {
                        where: { isThumbnail: true },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      issuedAt: "desc",
    },
  })

  return invoices
})
