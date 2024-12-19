import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

// Define the input validation schema
const CreateReview = z.object({
  productId: z.number(),
  rentItemId: z.number(), // Add rentItemId
  userId: z.number().optional(), // User can be optional
  rating: z.number().min(1).max(5), // Rating must be between 1 and 5
  comment: z.string().optional(),
})

// Define the mutation
const createReview = resolver.pipe(
  resolver.zod(CreateReview), // Validate input
  resolver.authorize(), // Ensure the user is authorized
  async (input) => {
    // Check if a review already exists for this RentItem
    const existingReview = await db.review.findFirst({
      where: { rentItemId: input.rentItemId },
    })

    if (existingReview) {
      throw new Error("This RentItem has already been reviewed.")
    }

    // Create the review in the database
    const review = await db.review.create({
      data: {
        productId: input.productId,
        rentItemId: input.rentItemId,
        userId: input.userId || null, // Handle optional user
        rating: input.rating,
        comment: input.comment || null,
      },
    })

    // Update the RentItem's `isReviewed` field to true
    await db.rentItem.update({
      where: { id: input.rentItemId },
      data: { isReviewed: true },
    })

    return review
  }
)

export default createReview
