import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

// Define the input validation schema
const CreateReview = z.object({
  productId: z.number(),
  rentItemId: z.number(),
  rating: z.number().min(1).max(5),
  anonymous: z.boolean().optional(),
  comment: z.string().optional(),
})

// Define the mutation
const createReview = resolver.pipe(
  resolver.zod(CreateReview),
  resolver.authorize(),
  async (input, ctx) => {
    const userId = ctx.session.userId

    // Verify the RentItem exists, matches the product, and belongs to the current user
    const rentItem = await db.rentItem.findFirst({
      where: {
        id: input.rentItemId,
        rent: { userId: userId },
        productVariant: { productId: input.productId },
        status: { in: ["completed", "returned", "returned_damaged"] },
      },
    })

    if (!rentItem) {
      throw new Error("You can only review items that have been completed or returned.")
    }

    // Check if a review already exists for this RentItem
    const existingReview = await db.review.findFirst({
      where: { rentItemId: input.rentItemId },
    })

    if (existingReview) {
      throw new Error("This RentItem has already been reviewed.")
    }

    // Create the review record
    const newReview = await db.review.create({
      data: {
        productId: input.productId,
        rentItemId: input.rentItemId,
        userId: userId,
        rating: input.rating,
        isAnonymous: input.anonymous ?? false,
        comment: input.comment || null,
      },
    })

    return newReview
  }
)

export default createReview
