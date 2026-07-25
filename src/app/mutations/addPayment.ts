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
        include: { rent: true, charges: true },
      })

      if (!rentItem) throw new Error("Rent item not found")

      // Step 4: Calculate total cost and remaining balance
      const start = new Date(rentItem.startDate)
      const end = new Date(rentItem.endDate)
      let diffMs = end.getTime() - start.getTime()
      const offsetDiff = end.getTimezoneOffset() - start.getTimezoneOffset()
      diffMs += offsetDiff * 60 * 1000

      const daysRented = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

      const baseTotal = rentItem.price * rentItem.quantity * daysRented

      // Include repair/late charges in the total bill
      const totalCharges = rentItem.charges.reduce((sum, c) => sum + c.amount, 0)

      let totalPaid = 0
      let totalPenalty = 0
      for (const p of payments) {
        totalPaid += p.amount
        totalPenalty += p.penaltyFee ?? 0
      }

      const remainingBalance = baseTotal + totalCharges - totalPaid + totalPenalty

      // Step 5: Decide rentItem status
      let newStatus = rentItem.status

      if (status === "canceled") {
        newStatus = "canceled"
      } else {
        // The item can only move to completed/rendering if it has been physically returned
        // or if this specific payment is marking the return event.
        const isReturnedState = ["returned", "returned_damaged", "rendering", "completed"].includes(
          rentItem.status
        )
        const isPaymentReturn = ["returned", "returned_damaged"].includes(status)

        if (isReturnedState || isPaymentReturn) {
          newStatus = remainingBalance <= 0 ? "completed" : "rendering"
        }
        // Note: The "accepted" status is now handled exclusively via updateRentStatus.
      }

      // Step 6: Update rentItem status
      await tx.rentItem.update({
        where: { id: rentItemId },
        data: {
          status: newStatus,
          returnedDamagedQty: returnedDamagedQty,
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
