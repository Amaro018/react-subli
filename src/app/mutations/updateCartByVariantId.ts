import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { getAvailableRentalQuantity } from "../utils/rentalAvailability"

export default resolver.pipe(
  resolver.zod(
    z.object({
      cartItemId: z.number().int().positive(),
      quantity: z.number().int().positive(),
      deliveryMethod: z.enum(["delivery", "pickup"]),
    })
  ),
  resolver.authorize(),
  async ({ cartItemId, quantity, deliveryMethod }, ctx) => {
    const userId = ctx.session.userId

    return db.$transaction(async (tx) => {
      const existingCartItem = await tx.cartItem.findFirst({
        where: { id: cartItemId, userId },
        include: {
          variant: { include: { product: true } },
        },
      })

      if (!existingCartItem) {
        throw new Error("Cart item not found or unauthorized.")
      }

      if (existingCartItem.variant.product.status !== "active") {
        throw new Error("This product is no longer available for rent.")
      }

      const activeRentals = await tx.rentItem.findMany({
        where: {
          productVariantId: existingCartItem.variantId,
          status: { in: ["accepted", "rendering", "on_hand", "overdue"] },
        },
        select: { startDate: true, endDate: true, quantity: true },
      })
      const damagedItems = await tx.rentItem.findMany({
        where: { productVariantId: existingCartItem.variantId, returnedDamagedQty: { gt: 0 } },
        select: { returnedDamagedQty: true },
      })
      const availableQuantity =
        existingCartItem.startDate && existingCartItem.endDate
          ? getAvailableRentalQuantity(
              existingCartItem.variant.quantity,
              damagedItems.reduce((total, item) => total + item.returnedDamagedQty, 0),
              activeRentals.map((rental) => ({
                start: rental.startDate.getTime(),
                end: rental.endDate.getTime(),
                quantity: rental.quantity,
              })),
              existingCartItem.startDate,
              existingCartItem.endDate
            )
          : existingCartItem.variant.quantity -
            damagedItems.reduce((total, item) => total + item.returnedDamagedQty, 0)

      if (quantity > availableQuantity) {
        throw new Error(
          `"${existingCartItem.variant.product.name}" has only ${availableQuantity} available for these dates.`
        )
      }

      const deliveryOption = existingCartItem.variant.product.deliveryOption
      if (
        (deliveryMethod === "delivery" && !["DELIVERY", "BOTH"].includes(deliveryOption)) ||
        (deliveryMethod === "pickup" && !["PICKUP", "BOTH"].includes(deliveryOption))
      ) {
        throw new Error("That delivery method is not available for this product.")
      }

      return tx.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity, deliveryMethod },
      })
    })
  }
)
