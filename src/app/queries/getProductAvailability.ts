import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"

const GetProductAvailability = z.object({
  productId: z.number(),
  variantId: z.number().optional(), // Optional, in case they haven't picked a color/size yet
  startDate: z.date(),
  endDate: z.date(),
})

export default resolver.pipe(
  resolver.zod(GetProductAvailability),
  async ({ productId, variantId, startDate, endDate }) => {
    // 1. Fetch total stock for the specific variant, or ALL variants if none selected
    const variants = await db.productVariant.findMany({
      where: variantId ? { id: variantId } : { productId: productId },
      select: { id: true, quantity: true },
    })

    let totalStock = variants.reduce((sum, v) => sum + (v.quantity || 0), 0)

    // Subtract unrepaired damaged items across all time
    const damagedAgg = await db.rentItem.aggregate({
      where: {
        productVariant: variantId ? { id: variantId } : { productId: productId },
        returnedDamagedQty: { gt: 0 },
      },
      _sum: { returnedDamagedQty: true },
    })

    totalStock -= damagedAgg._sum.returnedDamagedQty || 0

    // Subtract 3 hours from the requested start window to account for the frontend's return buffer
    const bufferStartDate = new Date(startDate.getTime() - 3 * 60 * 60 * 1000)

    // 2. Fetch all active reservations that overlap with the requested date range
    const reservations = await db.rentItem.findMany({
      where: {
        productVariant: variantId ? { id: variantId } : { productId: productId },
        status: { in: ["pending", "accepted", "rendering", "on_hand", "overdue"] },
        AND: [
          // Only get rentals where the start date is before our window ends,
          // and the end date is after our window starts
          { startDate: { lte: endDate } },
          { endDate: { gte: bufferStartDate } },
        ],
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        quantity: true,
      },
    })

    return {
      totalStock: Math.max(0, totalStock),
      reservations,
    }
  }
)
