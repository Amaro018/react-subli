import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

// Define the input validation schema
const CreateReview = z.object({
  productId: z.number(),
  rentItemId: z.number(), // Add rentItemId
  rating: z.number().min(1).max(5), // Rating must be between 1 and 5
  anonymous: z.boolean().optional(),
  comment: z.string().optional(),
})

// Define the mutation
const createReview = resolver.pipe(
  resolver.zod(CreateReview), // Validate input
  resolver.authorize(), // Ensure the user is authorized
  async (input, ctx) => {
    const userId = ctx.session.userId

    // Verify the RentItem actually exists, matches the product, and belongs to the current user
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

    // Run both database operations atomically in a transaction
    const review = await db.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          productId: input.productId,
          rentItemId: input.rentItemId,
          userId: userId, // Securely use the session user
          rating: input.rating,
          isAnonymous: input.anonymous ?? false,
          comment: input.comment || null,
        },
      })

      // Update the RentItem's `isReviewed` field to true
      await tx.rentItem.update({
        where: { id: input.rentItemId },
        data: { isReviewed: true },
      })

      return newReview
    })

    return review
  }
)

export default createReview
