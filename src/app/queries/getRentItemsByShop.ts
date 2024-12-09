import db from "db"

type GetRentItemsByShopInput = {
  shopId: number // Input type for the query
}

export default async function getRentItemsByShop(input: GetRentItemsByShopInput) {
  const { shopId } = input

  // Fetch rent items related to the shop
  const rentItems = await db.rentItem.findMany({
    where: {
      productVariant: {
        product: {
          shopId: shopId, // Filter by shop ID
        },
      },
    },
    include: {
      rent: {
        select: {
          id: true,
          status: true,
          totalPrice: true,
          deliveryAddress: true,
          user: {
            include: {
              personalInfo: true,
            },
          },
        },
      },
      productVariant: {
        include: {
          product: {
            include: {
              images: true,
            },
          }, // Include product details
          color: true, // Include color details
        },
      },
    },
  })

  return rentItems
}
