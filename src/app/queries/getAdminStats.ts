import { resolver } from "@blitzjs/rpc"
import db from "db"

export default resolver.pipe(resolver.authorize(), async () => {
  const [
    totalShops,
    pendingShops,
    rejectedShops,
    reportedShops,
    totalProducts,
    reportedProducts,
    totalOrders,
    totalUsers,
  ] = await db.$transaction([
    db.shop.count(),
    db.shop.count({ where: { status: "pending" } }),
    db.shop.count({ where: { status: "rejected" } }),
    db.reportShop.count({ where: { status: "pending" } }),
    db.product.count(),
    db.report.count({ where: { status: "pending" } }),
    db.rent.count(),
    db.user.count(),
  ])

  return {
    totalShops,
    pendingShops,
    rejectedShops,
    reportedShops,
    totalProducts,
    reportedProducts,
    totalOrders,
    totalUsers,
  }
})
