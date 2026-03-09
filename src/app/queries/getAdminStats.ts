import db from "db"

export default async function getAdminStats() {
  const [
    totalShops,
    pendingShops,
    rejectedShops,
    reportedShops,
    totalProducts,
    reportedProducts,
    totalOrders,
    totalUsers,
  ] = await Promise.all([
    db.shop.count({ where: { status: "approved" } }),
    db.shop.count({ where: { status: "pending" } }),
    db.shop.count({ where: { status: "rejected" } }),
    db.shop.count({ where: { status: "reported" } }),
    db.product.count(),
    db.product.count({ where: { status: "reported" } }),
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
}
