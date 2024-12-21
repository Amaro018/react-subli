import db from "db"

type GetRentByUserId = {
userId: number // Input type for the query
}

export default async function getRentByUserId(input: getRentByUserId) {
  const { userId } = input

  // Fetch rent items related to the shop
const userRents = await prisma.rent.findMany({
  include: {
    items: {
      include: {
        productVariant: true, // Include details about the product variant if needed
        payments: true, // Include payment details
      },
    },
    user: true, // Include user information (optional)
  },
});

  return userRents
}


