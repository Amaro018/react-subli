import { resolver } from "@blitzjs/rpc"
import { Ctx } from "blitz"
import db from "db"
import { z } from "zod"

const CreateReview = z.object({
  productId: z.number(),
  rentItemId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  anonymous: z.boolean().optional(),
})

export default resolver.pipe(
  resolver.zod(CreateReview),
  resolver.authorize(),
  async (input, ctx: Ctx) => {
    const userId = ctx.session.userId

    if (!userId) throw new Error("Not authenticated")

    const review = await db.review.create({
      data: {
        productId: input.productId,
        rentItemId: input.rentItemId,
        userId: userId,
        rating: input.rating,
        comment: input.comment,
        isAnonymous: input.anonymous ?? false, // Maps `anonymous` from client to `isAnonymous` in schema
      },
    })

    return review
  }
)
