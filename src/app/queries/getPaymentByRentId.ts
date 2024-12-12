import db from "db"

export default async function getPaymentByRentId({ rentItemId }: { rentItemId: number }) {
  const payments = await db.payment.findMany({
    where: { rentItemId },
  })

  if (!payments) throw new Error("No payments found")

  return payments
}
