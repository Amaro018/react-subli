// app/api/verify-email.ts
import { hash256 } from "@blitzjs/auth"
import db from "db"

export class VerifyError extends Error {
  name = "VerifyingError"
  message = "link is invalid or it has expired."
}

const verifyEmail = async (token: string) => {
  if (!token) throw new VerifyError("Token is required")
  const hashedToken = hash256(token)
  const verificationToken = await db.token.findFirst({
    where: { hashedToken, type: "EMAIL_VERIFICATION" },
    include: { user: true },
  })

  if (!verificationToken || verificationToken.expiresAt < new Date()) {
    throw new VerifyError()
  }

  const savedToken = verificationToken

  // 3. Delete token so it can't be used again
  await db.token.delete({ where: { id: savedToken.id } })

  const user = await db.user.update({
    where: { email: verificationToken.sentTo },
    data: { emailVerified: true },
  })

  return true
}

export default verifyEmail
