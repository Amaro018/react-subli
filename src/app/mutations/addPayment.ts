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
        ...(penaltyFee !== undefined && { penaltyFee }), // only include if defined
        note: note || "Payment",
      },
    })

    // Determine rentItem status update
    const paymentStatus = status
    let updateStatus = ""
    if (paymentStatus === "Partial") {
      updateStatus = "rendering"
    } else if (paymentStatus === "canceled") {
      updateStatus = "canceled"
    } else {
      updateStatus = "rendering"
    }

    // Update the specific rentItem's status
    await db.rentItem.update({
      where: { id: rentItemId },
      data: { status: updateStatus },
    })

    // Get rentId from the rentItem
    const rentItem = await db.rentItem.findUnique({
      where: { id: rentItemId },
      select: { rentId: true },
    })

    // Check if all rentItems under that rent are completed
    const allRemaining = await db.rentItem.findMany({
      where: {
        rentId: rentItem?.rentId,
        NOT: { status: "completed" },
      },
    })

    // If all rentItems are completed, update rent status to completed
    if (allRemaining.length === 0) {
      await db.rent.update({
        where: { id: rentItem?.rentId },
        data: { status: "completed" },
      })
    }

    return payment
  }
)
