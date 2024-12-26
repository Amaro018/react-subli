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
        emailVerified: true,
        isAdmin: true,
        isShopMode: false,
        isShopRegistered: false,
        profileImage: "",
        role: "ADMIN",
        hashedPassword,
      },
    })
  }

  // Seed Categories
  const categories = [
    { name: "Electronics" },
    { name: "Fashion" },
    { name: "Home & Garden" },
    { name: "Sports" },
    { name: "Books" },
  ]

  for (const category of categories) {
    await db.category.upsert({
      where: { name: category.name },
      update: {},
      create: {
        name: category.name,
      },
    })
  }

  const colors = [
    { name: "Red", hexCode: "#FF0000" },
    { name: "Green", hexCode: "#00FF00" },
    { name: "Blue", hexCode: "#0000FF" },
    { name: "Black", hexCode: "#000000" },
    { name: "White", hexCode: "#FFFFFF" },
    { name: "Yellow", hexCode: "#FFFF00" },
    { name: "Purple", hexCode: "#800080" },
    { name: "Cyan", hexCode: "#00FFFF" },
    { name: "Magenta", hexCode: "#FF00FF" },
    { name: "Gray", hexCode: "#808080" },
  ]

  for (const color of colors) {
    await db.color.upsert({
      where: { name: color.name },
      update: {},
      create: {
        name: color.name,
        hexCode: color.hexCode,
      },
    })
  }

  console.log("Colors seeded!")

  console.log("Categories seeded!")
  console.log("Seed completed!")
}

export default seed
