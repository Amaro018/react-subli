import { Ctx } from "blitz"
import db from "db"

export default async function updateProfileImage(
  input: { userId: number; profileImage: string },
  ctx: Ctx
) {
  ctx.session.$authorize()

  const { userId, profileImage } = input

  // Update the user's profile image in the database
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: { profileImage },
  })

  return profileImage // Return the new image path
}
