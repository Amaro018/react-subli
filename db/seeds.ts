import db from "./index"

const seed = async () => {
  // hashed password = password123
  const hashedPassword =
    "JGFyZ29uMmlkJHY9MTkkbT02NTUzNix0PTIscD0xJCtCUmJlbXpWTnhRTCtnVUxwZThHNnckaHkySU15OGlVOHp4WEl4VXphbjZRR2JLSUhVNDI1eTQ3azc1WEhxSDE4SQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="

  const existingUser = await db.user.findFirst({
    where: {
      email: "admin@admin.com",
    },
  })

  if (!existingUser) {
    await db.user.create({
      data: {
        email: "admin@admin.com",
        isAdmin: true,
        isShopMode: false,
        isShopRegistered: false,
        profileImage: "",
        role: "ADMIN",
        hashedPassword,
      },
    })
  }

  console.log("Seed completed!")
}

export default seed
