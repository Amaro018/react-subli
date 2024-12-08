import db from "db"

export default async ({ rentId }) => {
  const rent = await db.rent.findUnique({
    where: { id: rentId },
    include: {
      items: true, // Include RentItems in the response
    },
  })

  if (!rent) {
    throw new Error("Rent not found")
  }

  return rent
}
