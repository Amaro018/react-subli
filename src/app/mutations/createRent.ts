import db from "db"
import { z } from "zod"

// Input validation schema
const CreateRent = z.object({
  userId: z.number(),
  totalPrice: z.number(),
  status: z.string(),
  deliveryAddress: z.string(),
  items: z.array(
    z.object({
      productVariantId: z.number(),
      quantity: z.number(),
      price: z.number(),
      status: z.string(),
      deliveryMethod: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    })
  ),
})

// Mutation function
export default async function createRent(input: z.infer<typeof CreateRent>) {
  // Validate input
  const data = CreateRent.parse(input)

  // Create Rent and RentItems
  const rent = await db.rent.create({
    data: {
      userId: data.userId,
      totalPrice: data.totalPrice,
      status: data.status,
      deliveryAddress: data.deliveryAddress,
      items: {
        create: data.items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
          deliveryMethod: String(item.deliveryMethod),
          status: "pending",
          startDate: item.startDate,
          endDate: item.endDate,
        })),
      },
    },
    include: {
      items: true, // Include items in the response
    },
  })

  // After successfully creating rent, delete items from cart
  await db.cartItem.deleteMany({
    where: {
      userId: data.userId, // Ensure to delete only the cart items of the current user
      variantId: {
        in: data.items.map((item) => item.productVariantId), // Delete items that were rented
      },
    },
  })

  return rent
}
