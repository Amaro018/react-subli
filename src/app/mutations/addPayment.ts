import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

const AddPayment = z.object({
  rentItemId: z.number(), // ID of the RentItem
  amount: z.number(), // Amount being paid
  status: z.string(), // Payment method or status
  penaltyFee: z.number().optional(), // Optional penalty
  note: z.string().optional(), // Optional description
})

export default resolver.pipe(
  resolver.zod(AddPayment),
  resolver.authorize(),
  async ({ rentItemId, amount, status, note, penaltyFee }) => {
    // Create payment
    const payment = await db.payment.create({
      data: {
        rentItemId,
        amount,
        status,
        ...(penaltyFee !== undefined && { penaltyFee }),
        note: note || "Payment",
      },
    })

    // Get all payments to calculate total paid
    const payments = await db.payment.findMany({
      where: { rentItemId },
    })

    const rentItem = await db.rentItem.findUnique({
      where: { id: rentItemId },
      include: { rent: true }, // for rentId
    })

    if (!rentItem) throw new Error("Rent item not found")

    const daysRented = Math.ceil(
      (new Date(rentItem.endDate).getTime() - new Date(rentItem.startDate).getTime()) /
        (1000 * 60 * 60 * 24) +
        1
    )

    const baseTotal = rentItem.price * rentItem.quantity * daysRented

    // const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    // const totalPenalty = payments.reduce((sum, p) => sum + (p.penaltyFee ?? 0), 0)
    let totalPaid = 0
    let totalPenalty = 0
    for (const p of payments) {
      totalPaid += p.amount
      totalPenalty += p.penaltyFee ?? 0
    }

    const remainingBalance = baseTotal - totalPaid + totalPenalty

    // let updateStatus = "rendering"
    let updateStatus = rentItem.status
    if (status === "canceled") {
      updateStatus = "canceled"
    } else if (remainingBalance <= 0) {
      updateStatus = "completed"
    }

    // Update the specific rentItem's status
    await db.rentItem.update({
      where: { id: rentItemId },
      data: { status: updateStatus },
    })

    // Check if all rentItems under that rent are completed
    const allRemaining = await db.rentItem.findMany({
      where: {
        rentId: rentItem.rentId,
        NOT: { status: "completed" },
      },
    })

    if (allRemaining.length === 0) {
      await db.rent.update({
        where: { id: rentItem.rentId },
        data: { status: "completed" },
      })
    }

    return payment
  }
)
