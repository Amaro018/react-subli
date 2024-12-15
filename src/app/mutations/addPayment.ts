import { resolver } from "@blitzjs/rpc"
import db from "db"
import z from "zod"

const AddPayment = z.object({
  rentItemId: z.number(), // ID of the RentItem
  amount: z.number(), // Amount being paid
  status: z.string(), // Payment method
  note: z.string().optional(), // Optional description
})

export default resolver.pipe(
  resolver.zod(AddPayment),
  resolver.authorize(),
  async ({ rentItemId, amount, status, note }) => {
    const payment = await db.payment.create({
      data: {
        rentItemId,
        amount,
        status,
        note: note || "Payment",
      },
    })

    const paymentStatus = status
    let updateStatus = ""
    if (paymentStatus === "Partial") {
      updateStatus = "rendering"
    } else if (paymentStatus === "canceled") {
      updateStatus = "canceled"
    } else {
      updateStatus = "completed"
    }

    // Update a single rentItem's status
    await db.rentItem.update({
      where: { id: rentItemId },
      data: { status: updateStatus },
    })

    // Check if all rentItems for the same rentId are completed
    const rentItem = await db.rentItem.findUnique({
      where: { id: rentItemId },
      select: { rentId: true },
    })

    const allCompleted = await db.rentItem.findMany({
      where: { rentId: rentItem?.rentId, NOT: { status: "completed" } },
    })

    // If no incomplete rentItems remain, update the rent's status to "completed"
    if (allCompleted.length === 0) {
      await db.rent.update({
        where: { id: rentItem?.rentId },
        data: { status: "completed" },
      })
    }

    return payment
  }
)
