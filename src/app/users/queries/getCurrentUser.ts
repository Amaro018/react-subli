import { Ctx } from "blitz"
import db from "db"

export default async function getCurrentUser(_: null, ctx: Ctx) {
  if (!ctx.session.userId) return null
  const user = await db.user.findFirst({
    where: { id: ctx.session.userId },
    include: {
      tokens: true,
      sessions: true,
      personalInfo: true,
      shop: true,
      cartItems: true,
    },
  })

  return user
}
