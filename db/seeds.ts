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
    { name: "Toys" },
    { name: "Health & Beauty" },
    { name: "Groceries" },
    { name: "Jewelry" },
    { name: "Automotive" },
    { name: "Furniture" },
    { name: "Kitchen" },
    { name: "Office Supplies" },
    { name: "Outdoor" },
    { name: "Garden" },
    { name: "Garden Tools" },
    { name: "Garden Decor" },
    { name: "Garden Accessories" },
    { name: "Garden Lighting" },
    { name: "Garden Plants" },
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
    { name: "Orange", hexCode: "#FFA500" },
    { name: "Brown", hexCode: "#A52A2A" },
    { name: "Light Blue", hexCode: "#ADD8E6" },
    { name: "Light Green", hexCode: "#90EE90" },
    { name: "Light Red", hexCode: "#FFB6C1" },
    { name: "Light Purple", hexCode: "#E6E6FA" },
    { name: "Light Brown", hexCode: "#E0FFFF" },
    { name: "Light Gray", hexCode: "#D3D3D3" },
    { name: "Light Orange", hexCode: "#FFD700" },
    { name: "Light Pink", hexCode: "#FFC0CB" },
    { name: "Light Teal", hexCode: "#AFEEEE" },
    { name: "Light Yellow", hexCode: "#FFFFE0" },
    { name: "Light Magenta", hexCode: "#FF69B4" },
    { name: "Light Cyan", hexCode: "#E0FFFF" },
    { name: "Light Olive", hexCode: "#808000" },
    { name: "Light Salmon", hexCode: "#FA8072" },
    { name: "Light Lime", hexCode: "#00FF00" },
    { name: "Light Maroon", hexCode: "#800000" },
    { name: "Light Navy", hexCode: "#000080" },
    { name: "Light Olive Drab", hexCode: "#6B8E23" },
    { name: "Light Orange Red", hexCode: "#FF4500" },
    { name: "Light Orchid", hexCode: "#DA70D6" },
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
