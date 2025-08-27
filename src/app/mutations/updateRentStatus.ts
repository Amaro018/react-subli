import db from "db"

type UpdateRentStatusInput = {
  rentItemId: number
  action: "accept" | "cancel"
  noteMessage: string
}

export default async function updateRentStatus(input: UpdateRentStatusInput) {
  const { rentItemId, action, noteMessage } = input

  const status = action === "accept" ? "accepted" : action === "cancel" ? "canceled" : undefined

  if (!status) throw new Error("Invalid action")

  const rentItem = await db.rentItem.update({
    where: { id: rentItemId },
    data: { status, note: noteMessage },
  })

  return rentItem
}
