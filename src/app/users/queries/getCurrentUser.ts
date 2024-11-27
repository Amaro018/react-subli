import { Ctx } from "blitz"
import db from "db"

export default async function getCurrentUser(_: null, ctx: Ctx) {
  if (!ctx.session.userId) return null
  const user = await db.user.findFirst({
    where: { id: ctx.session.userId },
    include: {
      personalInfo: true, // Assumes a relation named 'profileInfo' exists
      shop: true, // Assumes a relation named 'shop' exists
    },
    // select: { id: true, email: true, role: true },
  })

  return user
}
