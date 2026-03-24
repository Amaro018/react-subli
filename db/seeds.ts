import db from "./index"
import { SecurePassword } from "@blitzjs/auth/secure-password"
import { DAMAGE_TEMPLATES } from "./damageThresholds"

const seed = async () => {
  // --------------------------------------------------------
  // 1. ADMIN SEEDING
  // --------------------------------------------------------
  const adminPasswordHash =
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
        hashedPassword: adminPasswordHash, //password123
      },
    })
    console.log("Admin created!")
  }
  // --------------------------------------------------------
  // 2. BARANGAYS (Existing Logic)
  // --------------------------------------------------------
  const barangays = [
    "Arimbay",
    "Bagacay",
    "Bagong Abre",
    "Bagumbayan",
    "Bañadero",
    "Banquerohan",
    "Baño",
    "Bariis",
    "Bigaa",
    "Binanuahan (East)",
    "Binanuahan (West)",
    "Bitano",
    "Bogña",
    "Bogtong",
    "Bonot",
    "Buenavista",
    "Buragwis",
    "Buyuan",
    "Cabagñan",
    "Cabagñan (East)",
    "Cabagñan (West)",
    "Cabugao",
    "Cagbacong",
    "Centro Baybay",
    "Cruzada",
    "Dap-dap",
    "Dinagaan",
    "Dita",
    "Em's Barrio",
    "Em's Barrio (East)",
    "Em's Barrio (South)",
    "Estanza",
    "Gogon",
    "Homapon",
    "Ilawod",
    "Ilawod East",
    "Ilawod West",
    "Imalnod",
    "Imperial Court",
    "Kapantawan",
    "Kawit-East Washington Drive",
    "Lamba",
    "Lapu-Lapu",
    "Mabinit",
    "Maoyod",
    "Mariawa",
    "Maslog",
    "Matanag",
    "Oro Site-Magallanes St.",
    "Padang",
    "Pawa",
    "Peñaranda St. (PNR)",
    "Pigcale",
    "Pinaric",
    "Puro",
    "Rawis",
    "Rizal St. (Ilawod)",
    "Rizal St. (Poblacion)",
    "Sabang",
    "Sagmin",
    "Sagpon",
    "San Francisco",
    "San Joaquin",
    "San Roque",
    "Tamaoyan",
    "Tahao Road",
    "Taysan",
    "Tinago",
    "Tula-Tula",
    "Victory Village (North)",
    "Victory Village (South)",
  ]

  console.log("Seeding Legazpi City Barangays...")
  // db/seeds.ts
  for (const name of barangays) {
    await db.barangay.upsert({
      where: { name: name }, // 'name' must be marked as @unique in schema.prisma
      update: {},
      create: {
        name: name,
        city: "Legazpi City",
        zipCode: "4500",
      },
    })
  }

  // --------------------------------------------------------
  // 3. DATA POOLS
  // --------------------------------------------------------
  // 50 Unique First Names to serve as unique emails
  const FIRST_NAMES = [
    "James",
    "Mary",
    "Robert",
    "Patricia",
    "John",
    "Jennifer",
    "Michael",
    "Linda",
    "David",
    "Elizabeth",
    "William",
    "Barbara",
    "Richard",
    "Susan",
    "Joseph",
    "Jessica",
    "Thomas",
    "Sarah",
    "Charles",
    "Karen",
    "Christopher",
    "Lisa",
    "Daniel",
    "Nancy",
    "Matthew",
    "Betty",
    "Anthony",
    "Margaret",
    "Mark",
    "Sandra",
    "Donald",
    "Ashley",
    "Steven",
    "Kimberly",
    "Paul",
    "Emily",
    "Andrew",
    "Donna",
    "Joshua",
    "Michelle",
    "Kenneth",
    "Carol",
    "Kevin",
    "Amanda",
    "Brian",
    "Melissa",
    "George",
    "Deborah",
    "Edward",
    "Stephanie",
  ]

  const MIDDLE_NAMES = [
    "Lee",
    "Ann",
    "Marie",
    "Lynn",
    "Ray",
    "Jo",
    "Beth",
    "Jean",
    "Grace",
    "Rose",
    "Alan",
    "Scott",
    "James",
    "Allen",
    "Jay",
    "Dean",
    "Wayne",
    "Paul",
    "Dale",
    "Roy",
  ]

  const LAST_NAMES = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
    "Lee",
    "Perez",
    "Thompson",
    "White",
    "Harris",
    "Sanchez",
    "Clark",
    "Ramirez",
    "Lewis",
    "Robinson",
  ]

  const getRandomItem = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

  // --------------------------------------------------------
  // 4. USER SEEDER FACTORY
  // --------------------------------------------------------
  const createSeedUser = async (firstName: string, middleName: string, lastName: string) => {
    const email = `${firstName.toLowerCase()}@gmail.com`
    const password = "Pass@12345"
    const hashedPassword = await SecurePassword.hash(password)
    const randomBarangay = barangays[Math.floor(Math.random() * barangays.length)]

    // Using upsert correctly: 'create' and 'update' are top-level properties
    await db.user.upsert({
      where: { email },
      update: {}, // No changes if user already exists
      create: {
        email,
        hashedPassword,
        emailVerified: true,
        role: "USER",
        personalInfo: {
          create: {
            firstName,
            middleName,
            lastName,
            birthDate: new Date("1995-01-01"),
            phoneNumber: "09123456789",
            street: "123 Seed Street",
            barangay: randomBarangay,
            city: "Legazpi City",
            province: "Albay",
            country: "Philippines",
            zipCode: "4500",
          },
        },
      },
    })
    console.log(`User processed: ${email}`)
  }

  // --------------------------------------------------------
  // 5. GENERATE 50 RANDOM USERS
  // --------------------------------------------------------
  console.log("Seeding 50 users...")
  for (let i = 0; i < FIRST_NAMES.length; i++) {
    const firstName = FIRST_NAMES[i]
    const middleName = getRandomItem(MIDDLE_NAMES)
    const lastName = getRandomItem(LAST_NAMES)

    await createSeedUser(firstName, middleName, lastName)
  }

  // --------------------------------------------------------
  // 6. CATEGORIES & COLORS
  // --------------------------------------------------------
  console.log("Seeding categories...")
  const categories = [
    {
      name: "Events & Party",
      slug: "events-party",
      iconKey: "party",
      dep: 0.1,
      min: 0.15,
      mod: 0.3,
      maj: 0.6,
    },
    {
      name: "Camera & AV Equipment",
      slug: "camera-av",
      iconKey: "camera",
      dep: 0.25,
      min: 0.2,
      mod: 0.4,
      maj: 0.7,
    },
    {
      name: "Transportation",
      slug: "transportation",
      iconKey: "transport",
      dep: 0.15,
      min: 0.1,
      mod: 0.25,
      maj: 0.5,
    },
    {
      name: "Camping & Hiking Equipment",
      slug: "camping-hiking",
      iconKey: "camping",
      dep: 0.2,
      min: 0.15,
      mod: 0.3,
      maj: 0.6,
    },
    {
      name: "Tools & Construction Equipment",
      slug: "tools-construction",
      iconKey: "tools",
      dep: 0.15,
      min: 0.1,
      mod: 0.25,
      maj: 0.5,
    },
    {
      name: "Fashion & Apparel",
      slug: "fashion-apparel",
      iconKey: "fashion",
      dep: 0.3,
      min: 0.15,
      mod: 0.35,
      maj: 0.65,
    },
    {
      name: "Sports Equipment",
      slug: "sports-equipment",
      iconKey: "sports",
      dep: 0.2,
      min: 0.15,
      mod: 0.3,
      maj: 0.6,
    },
    {
      name: "Baby & Mobility",
      slug: "baby-mobility",
      iconKey: "baby",
      dep: 0.2,
      min: 0.1,
      mod: 0.25,
      maj: 0.55,
    },
  ]

  for (const cat of categories) {
    await db.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        iconKey: cat.iconKey,
        annualDepreciationRate: cat.dep,
        defaultMinorPercent: cat.min,
        defaultModeratePercent: cat.mod,
        defaultMajorPercent: cat.maj,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        iconKey: cat.iconKey,
        annualDepreciationRate: cat.dep,
        defaultMinorPercent: cat.min,
        defaultModeratePercent: cat.mod,
        defaultMajorPercent: cat.maj,
      },
    })
  }
  console.log("Syncing damage policy descriptions...")
  const allProducts = await db.product.findMany({
    include: { category: true, variants: true },
  })

  for (const product of allProducts) {
    const template = DAMAGE_TEMPLATES[product.category.name] || DAMAGE_TEMPLATES["Default"]

    for (const variant of product.variants) {
      const severities = [
        { type: "MINOR", desc: template.MINOR, pct: product.category.defaultMinorPercent },
        { type: "MODERATE", desc: template.MODERATE, pct: product.category.defaultModeratePercent },
        { type: "MAJOR", desc: template.MAJOR, pct: product.category.defaultMajorPercent },
        { type: "TOTAL_LOSS", desc: "Item lost or irreparable", pct: 1.0 },
      ]

      for (const sev of severities) {
        // Find if policy exists for this variant and severity
        const existingPolicy = await db.damagePolicies.findFirst({
          where: { productVariantId: variant.id, damageSeverity: sev.type },
        })

        await db.damagePolicies.upsert({
          where: { id: existingPolicy?.id || 0 },
          update: { description: sev.desc, damageSeverityPercent: sev.pct },
          create: {
            productVariantId: variant.id,
            damageSeverity: sev.type,
            damageSeverityPercent: sev.pct,
            description: sev.desc,
          },
        })
      }
    }
  }

  // --------------------------------------------------------
  // 7. ATTRIBUTES (Replaces Colors)
  // --------------------------------------------------------
  console.log("Seeding attributes...")

  // Helper function to safely seed attributes using upsert
  const seedAttribute = async (name: string, values: { value: string; hexCode?: string }[]) => {
    const attribute = await db.attribute.upsert({
      where: { name },
      update: {},
      create: { name },
    })

    for (const val of values) {
      await db.attributeValue.upsert({
        where: {
          attributeId_value: {
            attributeId: attribute.id,
            value: val.value,
          },
        },
        update: { hexCode: val.hexCode },
        create: {
          attributeId: attribute.id,
          value: val.value,
          hexCode: val.hexCode,
        },
      })
    }
    console.log(`Seeded attribute: ${name}`)
  }

  await seedAttribute("Color", [
    { value: "Red", hexCode: "#FF0000" },
    { value: "Green", hexCode: "#00FF00" },
    { value: "Blue", hexCode: "#0000FF" },
    { value: "Black", hexCode: "#000000" },
    { value: "White", hexCode: "#FFFFFF" },
    { value: "Yellow", hexCode: "#FFFF00" },
    { value: "Purple", hexCode: "#800080" },
    { value: "Orange", hexCode: "#FFA500" },
    { value: "Pink", hexCode: "#FFC0CB" },
    { value: "Brown", hexCode: "#A52A2A" },
    { value: "Gray", hexCode: "#808080" },
  ])

  await seedAttribute("Size", [
    { value: "XS" },
    { value: "S" },
    { value: "M" },
    { value: "L" },
    { value: "XL" },
  ])

  await seedAttribute("Material", [
    { value: "Cotton" },
    { value: "Polyester" },
    { value: "Silk" },
    { value: "Linen" },
  ])

  await seedAttribute("Storage", [
    { value: "64GB" },
    { value: "128GB" },
    { value: "256GB" },
    { value: "512GB" },
    { value: "1TB" },
  ])

  console.log("Finished seeding attributes.")
}
export default seed
