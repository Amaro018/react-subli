import db from "db"
import { z } from "zod"

export const UpdateRentStatusSchema = z.object({
  rentItemId: z.number(),
  action: z.enum(["accept", "cancel", "on_hand"]),
  noteMessage: z.string(),
})

type UpdateRentStatusInput = z.infer<typeof UpdateRentStatusSchema>

export default async function updateRentStatus(input: UpdateRentStatusInput) {
  const { rentItemId, action, noteMessage } = UpdateRentStatusSchema.parse(input)

  const status =
    action === "accept"
      ? "accepted"
      : action === "cancel"
      ? "canceled"
      : action === "on_hand"
      ? "on_hand"
      : undefined

  if (!status) throw new Error("Invalid action")

  // Safety check: Only allow handover if the item has been accepted first
  if (action === "on_hand") {
    const currentItem = await db.rentItem.findUnique({
      where: { id: rentItemId },
      select: { status: true },
    })

    if (currentItem?.status !== "accepted") {
      throw new Error("Item must be in 'Accepted' status before it can be marked as 'On Hand'.")
    }
  }

  const rentItem = await db.rentItem.update({
    where: { id: rentItemId },
    data: { status, note: noteMessage },
    include: {
      rent: {
        include: { user: true },
      },
      productVariant: {
        include: { product: true },
      },
    },
  })

  // Notify the renter about the status update
  const productName = rentItem.productVariant?.product?.name || "an item"
  const message = `The status of your rental for "${productName}" has been updated to ${status}. [ID: ${rentItem.id}]`

  await db.notification.create({
    data: {
      userId: rentItem.rent.userId,
      title: "Rent Status Updated",
      message: message,
      isRead: false,
    },
  })

  return rentItem
}
