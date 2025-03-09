import db from "db"

const getRentById = async ({ rentId }: { rentId: number }) => {
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

export default getRentById
