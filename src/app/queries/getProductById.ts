import db from "db"

export default async function getProductById({ id }: { id: number }) {
  const product = await db.product.findFirst({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: {
          user: {
            include: {
              personalInfo: true, // Include the associated user's personal info
            },
          },
        },
      },
      variants: {
        include: {
          color: true, // Include the associated Color for each variant
        },
      }, // Include related variants if needed
      images: true,
      shop: true,
    },
  })

  if (!product) throw new Error("Product not found")

  return product
}
