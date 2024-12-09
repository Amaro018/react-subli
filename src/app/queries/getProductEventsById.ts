import { resolver } from "@blitzjs/rpc"
import db from "db" // Use the `db` import in Blitz.js to access Prisma client
import { z } from "zod"

// Define input validation schema
const GetProductEventsById = z.object({
  productId: z.number(),
})

// Resolver function
const getProductEventsById = resolver.pipe(
  resolver.zod(GetProductEventsById), // Input validation
  async ({ productId }) => {
    // Fetch product with related rent data
    const rentDates = await db.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        variants: {
          select: {
            id: true,
            size: true,
            quantity: true,
            color: {
              select: { name: true },
            },
            rentItems: {
              select: {
                id: true,

                rent: {
                  select: {
                    id: true,
                    userId: true,
                    status: true,
                  },
                },
                status: true,
                quantity: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    })

    if (!rentDates) {
      throw new Error(`Product with ID ${productId} not found`)
    }

    return rentDates
  }
)

export default getProductEventsById
