import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize(), async () => {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const [rents, users, categoriesWithProducts] = await db.$transaction([
    db.rent.findMany({
      where: { createdAt: { gte: oneYearAgo } },
      select: { createdAt: true, totalAmount: true },
    }),
    db.user.findMany({
      where: { createdAt: { gte: oneYearAgo } },
      select: { createdAt: true },
    }),
    db.category.findMany({
      select: {
        name: true,
        _count: { select: { products: true } },
      },
      orderBy: { products: { _count: "desc" } },
    }),
  ])

  // Initialize monthly data arrays for the last 12 months
  const monthLabels: string[] = []
  const monthlySalesData: number[] = Array(12).fill(0)
  const monthlyUserData: number[] = Array(12).fill(0)
  const now = new Date()

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    monthLabels.push(d.toLocaleString("default", { month: "short", year: "2-digit" }))
  }

  // Process sales data
  for (const rent of rents) {
    const monthDiff =
      now.getMonth() -
      rent.createdAt.getMonth() +
      12 * (now.getFullYear() - rent.createdAt.getFullYear())
    const monthIndex = 11 - monthDiff
    if (monthIndex >= 0 && monthIndex < 12) {
      monthlySalesData[monthIndex] += rent.totalAmount
    }
  }

  // Process user registration data
  for (const user of users) {
    const monthDiff =
      now.getMonth() -
      user.createdAt.getMonth() +
      12 * (now.getFullYear() - user.createdAt.getFullYear())
    const monthIndex = 11 - monthDiff
    if (monthIndex >= 0 && monthIndex < 12) {
      monthlyUserData[monthIndex] += 1
    }
  }

  // Process category data
  const categoryLabels = categoriesWithProducts.map((c) => c.name)
  const categoryData = categoriesWithProducts.map((c) => c._count.products)

  return {
    monthLabels,
    monthlySalesData,
    monthlyUserData,
    categoryLabels,
    categoryData,
  }
})
