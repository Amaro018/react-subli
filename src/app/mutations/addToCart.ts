// app/mutations/addToCart.ts
import db from "db"
import { resolver } from "@blitzjs/rpc"
import { z } from "zod"
import { getAvailableRentalQuantity } from "../utils/rentalAvailability"

// Validation schema
const AddToCart = z
  .object({
    productId: z.number().int().positive(),
    variantId: z.number().int().positive(),
    quantity: z.number().int().positive(),
    deliveryMethod: z.enum(["delivery", "pickup"]),
    startDate: z.date(),
    endDate: z.date(),
  })
  .refine(
    ({ startDate, endDate }) => endDate.getTime() - startDate.getTime() >= 24 * 60 * 60 * 1000,
    { message: "Rental duration must be at least 24 hours." }
  )

export default resolver.pipe(
  resolver.zod(AddToCart),
  resolver.authorize(), // Ensure the user is logged in
  async ({ productId, variantId, quantity, deliveryMethod, startDate, endDate }, ctx) => {
    const userId = ctx.session.userId

    return db.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { emailVerified: true },
      })

      if (!user?.emailVerified) {
        throw new Error("Please verify your account email before adding items to your cart.")
      }

      const variant = await tx.productVariant.findUnique({
        where: { id: variantId },
        include: { product: true },
      })

      if (!variant || variant.productId !== productId || variant.product.status !== "active") {
        throw new Error("This product option is no longer available.")
      }

      const deliveryOption = variant.product.deliveryOption
      if (
        (deliveryMethod === "delivery" && !["DELIVERY", "BOTH"].includes(deliveryOption)) ||
        (deliveryMethod === "pickup" && !["PICKUP", "BOTH"].includes(deliveryOption))
      ) {
        throw new Error("That delivery method is not available for this product.")
      }

      const existingCartItem = await tx.cartItem.findFirst({
        where: {
          userId,
          productId,
          variantId,
          deliveryMethod,
          startDate,
          endDate,
        },
      })

      const resultingQuantity = quantity + (existingCartItem?.quantity ?? 0)
      const activeRentals = await tx.rentItem.findMany({
        where: {
          productVariantId: variantId,
          status: { in: ["accepted", "rendering", "on_hand", "overdue"] },
        },
        select: { startDate: true, endDate: true, quantity: true },
      })
      const damagedItems = await tx.rentItem.findMany({
        where: { productVariantId: variantId, returnedDamagedQty: { gt: 0 } },
        select: { returnedDamagedQty: true },
      })
      const damagedQuantity = damagedItems.reduce(
        (total, item) => total + item.returnedDamagedQty,
        0
      )
      const availableQuantity = getAvailableRentalQuantity(
        variant.quantity,
        damagedQuantity,
        activeRentals.map((rental) => ({
          start: rental.startDate.getTime(),
          end: rental.endDate.getTime(),
          quantity: rental.quantity,
        })),
        startDate,
        endDate
      )

      if (resultingQuantity > availableQuantity) {
        throw new Error(
          `"${variant.product.name}" has only ${availableQuantity} available for the selected dates.`
        )
      }

      if (existingCartItem) {
        return tx.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: resultingQuantity },
        })
      }

      return tx.cartItem.create({
        data: {
          userId,
          productId,
          variantId,
          quantity,
          deliveryMethod,
          startDate,
          endDate,
        },
      })
    })
  }
)
