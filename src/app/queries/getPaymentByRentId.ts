import db from "db"

export default async function getPaymentByRentId({ rentItemId }: { rentItemId: number }) {
  const payments = await db.payment.findFirst({
    where: { rentItemId },
  })

  if (!payments) throw new Error("Product not found")

  return payments
}
