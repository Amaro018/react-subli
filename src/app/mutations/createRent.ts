import db from "db"
import { z } from "zod"

// Input validation schema
const CreateRent = z.object({
  userId: z.number(),
  totalPrice: z.number(),
  securityDeposit: z.number().optional(),
  cartItemIds: z.array(z.number()).optional(),
  status: z.string(),
  deliveryAddress: z.string(),
  items: z.array(
    z.object({
      productVariantId: z.number(),
      quantity: z.number(),
      price: z.number(),
      status: z.string(),
      deliveryMethod: z.string(),
      startDate: z.date(),
      endDate: z.date(),
    })
  ),
})

// Mutation function
export default async function createRent(input: z.infer<typeof CreateRent>) {
  // Validate input
  const data = CreateRent.parse(input)
  // Use a transaction to ensure all-or-nothing execution
  const rent = await db.$transaction(async (tx) => {
    // Step 1: Availability Check for all items within the transaction
    for (const item of data.items) {
      const variant = await tx.productVariant.findUnique({
        where: { id: item.productVariantId },
        include: { product: true },
      })
      if (!variant) throw new Error(`Product variant with id ${item.productVariantId} not found.`)

      const dbRents = await tx.rentItem.findMany({
        where: {
          productVariantId: item.productVariantId,
          status: { in: ["accepted", "rendering", "on_hand", "overdue"] },
        },
      })
      const dbIntervals = dbRents.map((r) => ({
        start: new Date(r.startDate).getTime(),
        end: new Date(r.endDate).getTime() + 3 * 60 * 60 * 1000,
        qty: r.quantity,
      }))

      const damagedItems = await tx.rentItem.findMany({
        where: { productVariantId: item.productVariantId, returnedDamagedQty: { gt: 0 } },
      })
      const totalDamaged = damagedItems.reduce((sum, r) => sum + (r.returnedDamagedQty || 0), 0)

      const otherCartItemIntervals = data.items
        .filter(
          (otherItem) => otherItem.productVariantId === item.productVariantId && otherItem !== item
        )
        .map((otherItem) => ({
          start: new Date(otherItem.startDate).getTime(),
          end: new Date(otherItem.endDate).getTime() + 3 * 60 * 60 * 1000,
          qty: otherItem.quantity,
        }))

      const combinedIntervals = [...dbIntervals, ...otherCartItemIntervals]

      const reqStart = new Date(item.startDate).getTime()
      const reqEnd = new Date(item.endDate).getTime()

      let maxRentedInWindow = 0
      if (combinedIntervals.length > 0) {
        const events: { time: number; type: "start" | "end"; qty: number }[] = []
        combinedIntervals.forEach((inv) => {
          if (inv.start < reqEnd && inv.end > reqStart) {
            events.push({ time: Math.max(inv.start, reqStart), type: "start", qty: inv.qty })
            events.push({ time: Math.min(inv.end, reqEnd), type: "end", qty: inv.qty })
          }
        })

        if (events.length > 0) {
          events.sort((a, b) => (a.time === b.time ? (a.type === "end" ? -1 : 1) : a.time - b.time))
          let currentRentedQty = 0
          events.forEach((ev) => {
            if (ev.type === "start") currentRentedQty += ev.qty
            else currentRentedQty -= ev.qty
            if (currentRentedQty > maxRentedInWindow) maxRentedInWindow = currentRentedQty
          })
        }
      }

      const availableStock = Math.max(0, variant.quantity - totalDamaged - maxRentedInWindow)

      if (item.quantity > availableStock) {
        throw new Error(
          `"${variant.product.name}" is no longer available for the selected dates. Only ${availableStock} left.`
        )
      }
    }

    // Step 2: Create Rent and RentItems
    const newRent = await tx.rent.create({
      data: {
        userId: data.userId,
        totalPrice: data.totalPrice,
        securityDeposit: data.securityDeposit,
        status: data.status,
        deliveryAddress: data.deliveryAddress,
        items: {
          create: data.items.map((item) => ({
            productVariantId: item.productVariantId,
            quantity: item.quantity,
            price: item.price,
            deliveryMethod: String(item.deliveryMethod),
            status: "pending",
            startDate: item.startDate,
            endDate: item.endDate,
          })),
        },
      },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    shop: true, // Include shop to get the owner's ID
                  },
                },
              },
            },
          },
        },
        user: {
          include: {
            personalInfo: true,
          },
        },
      },
    })

    // Step 3: After successfully creating rent, delete items from cart if IDs are provided
    if (data.cartItemIds && data.cartItemIds.length > 0) {
      await tx.cartItem.deleteMany({
        where: {
          id: { in: data.cartItemIds },
          userId: data.userId, // Security check
        },
      })
    }

    // Step 4: Prepare and create notifications for shop owners
    const notificationsData: { userId: number; title: string; message: string; isRead: boolean }[] =
      []
    const shopItemsMap = new Map<number, any[]>()

    for (const item of newRent.items) {
      const shopId = item.productVariant.product.shopId
      if (!shopItemsMap.has(shopId)) {
        shopItemsMap.set(shopId, [])
      }
      shopItemsMap.get(shopId)!.push(item)
    }

    shopItemsMap.forEach((items, shopId) => {
      const shop = items[0]!.productVariant.product.shop
      const renterName = newRent.user?.personalInfo?.firstName || "A user"
      const highlightItemId = items[0]!.id
      const firstProductName = items[0]!.productVariant.product.name

      const message =
        items.length > 1
          ? `${renterName} placed a new order for ${items.length} items, including "${firstProductName}". [ID: ${highlightItemId}]`
          : `${renterName} placed a new order for "${firstProductName}". [ID: ${highlightItemId}]`

      notificationsData.push({
        userId: shop.userId,
        title: "New Rent Order",
        message: message,
        isRead: false,
      })
    })

    if (notificationsData.length > 0) {
      await Promise.all(notificationsData.map((data) => tx.notification.create({ data })))
    }

    return newRent
  })
  return rent
}
