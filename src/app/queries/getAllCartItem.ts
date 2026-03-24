import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"

export default resolver.pipe(resolver.authorize(), async (_, ctx) => {
  const cartItems = await db.cartItem.findMany({
    where: {
      userId: ctx.session.userId!, // <--- Add '!' here to assert it's not null
    },
    include: {
      product: {
        include: {
          images: true,
          shop: true,
        },
      },
      user: {
        include: {
          personalInfo: true,
        },
      },
      variant: {
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
        },
      },
    },
  })

  return cartItems
})
