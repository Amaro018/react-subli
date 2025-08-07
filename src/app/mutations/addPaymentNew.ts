import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

const AddPayment = z.object({
  rentItemId: z.number(),
  amount: z.number(),
  status: z.string(),
  penaltyFee: z.number().optional(),
  note: z.string().optional(),
  returnedDamagedQty: z.number().optional(),
})

export default resolver.pipe(
  resolver.zod(AddPayment),
  resolver.authorize(),
  async ({ rentItemId, amount, status, note, penaltyFee, returnedDamagedQty }) => {
    const payment = await db.$transaction(async (tx) => {
      // Step 1: Create the payment
      const newPayment = await tx.payment.create({
        data: {
          rentItemId,
          amount,
          status,
          ...(penaltyFee !== undefined && { penaltyFee }),
          note: note || "Rent payment",
        },
      })

      // Step 2: Fetch all payments for this rentItem
      const payments = await tx.payment.findMany({
        where: { rentItemId },
      })

      // Step 3: Fetch rentItem and its parent rent
      const rentItem = await tx.rentItem.findUnique({
        where: { id: rentItemId },
        include: { rent: true },
      })

      if (!rentItem) throw new Error("Rent item not found")

      // Step 4: Calculate total cost and remaining balance
      const daysRented = Math.ceil(
        (new Date(rentItem.endDate).getTime() - new Date(rentItem.startDate).getTime()) /
          (1000 * 60 * 60 * 24) +
          1
      )

      const baseTotal = rentItem.price * rentItem.quantity * daysRented

      let totalPaid = 0
      let totalPenalty = 0

      for (const p of payments) {
        totalPaid += p.amount
        totalPenalty += p.penaltyFee ?? 0
      }

      const remainingBalance = baseTotal - totalPaid + totalPenalty

      // Step 5: Decide rentItem status
      let updateStatus = rentItem.status

      const hasReturned = payments.some(
        (payment) => payment.status === "returned_damaged" || payment.status === "returned"
      )

      if (status === "canceled") {
        updateStatus = "canceled"
      } else if (status === "returned_damaged" || status === "returned") {
        updateStatus = remainingBalance === 0 ? "completed" : "rendering"
      } else if (payments && payments.length > 0) {
        updateStatus = hasReturned
          ? remainingBalance === 0
            ? "completed"
            : "rendering"
          : "rendering"
      } else if (remainingBalance === 0) {
        updateStatus = "completed"
      }

      // Step 6: Update rentItem status
      await tx.rentItem.update({
        where: { id: rentItemId },
        data: {
          status: updateStatus,
          returnedDamagedQty: returnedDamagedQty,
          isRepaired: status === "returned_damaged" ? false : null,
        },
      })

      // Step 7: If all rentItems of the same rent are completed, mark the parent rent completed
      const incompleteItems = await tx.rentItem.findMany({
        where: {
          rentId: rentItem.rentId,
          NOT: { status: "completed" },
        },
      })

      if (incompleteItems.length === 0) {
        await tx.rent.update({
          where: { id: rentItem.rentId },
          data: { status: "completed" },
        })
      }

      return newPayment
    })

    return payment
  }
)
