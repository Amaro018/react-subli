import db from "./index"
import { SecurePassword } from "@blitzjs/auth/secure-password"

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
    "Ba�adero",
    "Banquerohan",
    "Ba�o",
    "Bariis",
    "Bigaa",
    "Binanuahan (East)",
    "Binanuahan (West)",
    "Bitano",
    "Bog�a",
    "Bogtong",
    "Bonot",
    "Buenavista",
    "Buragwis",
    "Buyuan",
    "Cabag�an",
    "Cabag�an (East)",
    "Cabag�an (West)",
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
    "Pe�aranda St. (PNR)",
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
  const categories = [
    { name: "Events & Party", slug: "events-party", iconKey: "party" },
    { name: "Camera & AV Equipment", slug: "camera-av", iconKey: "camera" },
    { name: "Transportation", slug: "transportation", iconKey: "transport" },
    { name: "Camping & Hiking Equipment", slug: "camping-hiking", iconKey: "camping" },
    { name: "Tools & Construction Equipment", slug: "tools-construction", iconKey: "tools" },
    { name: "Fashion & Apparel", slug: "fashion-apparel", iconKey: "fashion" },
    { name: "Sports Equipment", slug: "sports-equipment", iconKey: "sports" },
    { name: "Baby & Mobility", slug: "baby-mobility", iconKey: "baby" },
  ]

  for (const category of categories) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, iconKey: category.iconKey },
      create: category,
    })
  }

  const colors = [
    { name: "Red", hexCode: "#FF0000" },
    { name: "Green", hexCode: "#00FF00" },
    { name: "Blue", hexCode: "#0000FF" },
    { name: "Black", hexCode: "#000000" },
    { name: "White", hexCode: "#FFFFFF" },
    // ... (Your other colors remain implied here)
  ]

  for (const color of colors) {
    await db.color.upsert({
      where: { name: color.name },
      update: {},
      create: { name: color.name, hexCode: color.hexCode },
    })
  }
}
export default seed
