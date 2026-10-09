import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { recalculateInvoiceByRentId } from "@/src/app/(pages)/invoice/utils/recalculateInvoice"
import { getAvailableRentalQuantity } from "../utils/rentalAvailability"

const UpdateRentStatusSchema = z.object({
  rentItemId: z.number().int().positive(),
  action: z.enum(["accept", "cancel", "on_hand"]),
  noteMessage: z.string(),
})

export default resolver.pipe(
  resolver.zod(UpdateRentStatusSchema),
  resolver.authorize(),
  async ({ rentItemId, action, noteMessage }, ctx) => {
    const status =
      action === "accept"
        ? "accepted"
        : action === "cancel"
        ? "canceled"
        : action === "on_hand"
        ? "on_hand"
        : undefined

    if (!status) throw new Error("Invalid action")

    const rentItem = await db.$transaction(async (tx) => {
      const currentItem = await tx.rentItem.findUnique({
        where: { id: rentItemId },
        include: {
          productVariant: {
            include: {
              product: {
                include: { shop: true },
              },
            },
          },
        },
      })

      if (!currentItem) {
        throw new Error("Rental order not found.")
      }

      if (currentItem.productVariant.product.shop.userId !== ctx.session.userId) {
        throw new Error("You are not authorized to manage this rental.")
      }

      if (action === "accept") {
        if (currentItem.status !== "pending") {
          throw new Error("This rental request is no longer pending. Refresh and try again.")
        }

        const activeStatuses = ["accepted", "rendering", "on_hand", "overdue"]
        const [activeRentals, damagedQuantity] = await Promise.all([
          tx.rentItem.findMany({
            where: {
              productVariantId: currentItem.productVariantId,
              status: { in: activeStatuses },
            },
            select: { startDate: true, endDate: true, quantity: true },
          }),
          tx.rentItem.aggregate({
            where: {
              productVariantId: currentItem.productVariantId,
              returnedDamagedQty: { gt: 0 },
            },
            _sum: { returnedDamagedQty: true },
          }),
        ])

        const availableQuantity = getAvailableRentalQuantity(
          currentItem.productVariant.quantity,
          damagedQuantity._sum.returnedDamagedQty || 0,
          activeRentals.map((rental) => ({
            start: rental.startDate.getTime(),
            end: rental.endDate.getTime(),
            quantity: rental.quantity,
          })),
          currentItem.startDate,
          currentItem.endDate
        )

        if (currentItem.quantity > availableQuantity) {
          throw new Error(
            `"${currentItem.productVariant.product.name}" has only ${availableQuantity} available for the requested dates. This order requests ${currentItem.quantity}.`
          )
        }
      }

      if (action === "on_hand" && currentItem.status !== "accepted") {
        throw new Error("Item must be in 'Accepted' status before it can be marked as 'On Hand'.")
      }

      return tx.rentItem.update({
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
    })

    const productName = rentItem.productVariant?.product?.name || "an item"
    const message = `The status of your rental for "${productName}" has been updated to ${status}. [ID: ${rentItem.id}]`

    await db.notification.create({
      data: {
        userId: rentItem.rent.userId,
        title: "Rent Status Updated",
        message,
        isRead: false,
      },
    })

    await recalculateInvoiceByRentId(rentItem.rentId)

    return rentItem
  }
)
