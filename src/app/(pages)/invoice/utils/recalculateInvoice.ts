import db from "db"

type InvoiceLine = {
  description: string
  quantity: number
  unitPrice: number
  amount: number
  rentItemId?: number
  chargeId?: number
}

/** Rebuild one invoice per shop, keeping multi-shop order amounts private. */
export async function recalculateInvoiceByRentId(rentId: number) {
  const rent = await db.rent.findUnique({
    where: { id: rentId },
    include: {
      items: {
        include: { productVariant: { include: { product: true } }, charges: true },
      },
    },
  })
  if (!rent) throw new Error("Rent record not found")

  // Pre-shop-scoping invoices were stored as one row per rent. Remove that
  // legacy row before creating the current shop-specific invoices.
  await db.invoice.deleteMany({ where: { rentId, shopId: null } })

  const itemsByShop = new Map<number, typeof rent.items>()
  for (const item of rent.items) {
    const shopId = item.shopId ?? item.productVariant.product.shopId
    if (!itemsByShop.has(shopId)) itemsByShop.set(shopId, [])
    itemsByShop.get(shopId)!.push(item)
  }

  const allBaseSubtotal = rent.items.reduce((total, item) => {
    const days = Math.max(
      1,
      Math.ceil((new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / 86400000)
    )
    return total + item.price * item.quantity * days
  }, 0)

  const invoices = []
  for (const [shopId, shopItems] of itemsByShop) {
    let subtotal = 0
    let extraCharges = 0
    const lines: InvoiceLine[] = []

    for (const item of shopItems) {
      const days = Math.max(
        1,
        Math.ceil(
          (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) / 86400000
        )
      )
      const amount = item.price * item.quantity * days
      subtotal += amount
      lines.push({
        description: `${item.productVariant.product.name} (${days} Day${days > 1 ? "s" : ""})`,
        quantity: item.quantity,
        unitPrice: item.price * days,
        amount,
        rentItemId: item.id,
      })

      for (const charge of item.charges) {
        extraCharges += charge.amount
        lines.push({
          description: `Fee (${charge.type}): ${charge.severity || "General"}`,
          quantity: charge.quantity,
          unitPrice: charge.amount / charge.quantity,
          amount: charge.amount,
          rentItemId: item.id,
          chargeId: charge.id,
        })
      }
    }

    // Checkout currently stores the 50% upfront rental-payment requirement in
    // this field. It is informational, not an extra charge on top of rent.
    // Recorded Payment rows are what reduce the invoice balance.
    const securityDeposit =
      allBaseSubtotal > 0 ? ((rent.securityDeposit ?? 0) * subtotal) / allBaseSubtotal : 0
    const payments = await db.payment.findMany({
      where: { rentItemId: { in: shopItems.map((item) => item.id) } },
    })
    const amountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const totalAmount = subtotal + extraCharges
    const balanceDue = Math.max(0, totalAmount - amountPaid)
    const status = balanceDue <= 0 ? "PAID" : amountPaid > 0 ? "PARTIALLY_PAID" : "UNPAID"
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(rent.id).padStart(
      5,
      "0"
    )}-${shopId}`

    const existing = await db.invoice.findUnique({ where: { rentId_shopId: { rentId, shopId } } })
    if (existing) await db.invoiceItem.deleteMany({ where: { invoiceId: existing.id } })

    const invoice = existing
      ? await db.invoice.update({
          where: { id: existing.id },
          data: {
            subtotal,
            securityDeposit,
            extraCharges,
            totalAmount,
            amountPaid,
            balanceDue,
            status,
            dueDate: shopItems[0]?.endDate ?? new Date(),
            items: { create: lines },
          },
        })
      : await db.invoice.create({
          data: {
            invoiceNumber,
            rentId,
            shopId,
            subtotal,
            securityDeposit,
            extraCharges,
            totalAmount,
            amountPaid,
            balanceDue,
            status,
            dueDate: shopItems[0]?.endDate ?? new Date(),
            items: { create: lines },
          },
        })

    await db.payment.updateMany({
      where: { rentItem: { rentId, shopId } },
      data: { invoiceId: invoice.id },
    })
    invoices.push(invoice)
  }

  return invoices
}
