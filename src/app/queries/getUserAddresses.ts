import { Ctx } from "blitz"
import db from "db"
import { z } from "zod"

const GetUserAddresses = z.object({
  userId: z.string(),
})

export default async function getUserAddresses(input: z.infer<typeof GetUserAddresses>, ctx: Ctx) {
  const { userId } = GetUserAddresses.parse(input)

  const addresses = await db.address.findMany({
    where: { userId: parseInt(userId) },
    orderBy: { isDefault: "desc" },
  })

  return addresses
}
