import db from "db"

const getProductById = async ({ id }: { id: number }) => {
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
          attributes: {
            include: {
              attributeValue: {
                include: {
                  attribute: true,
                },
              },
            },
          },
          damagePolicies: true,
          rentItems: true,
        },
      }, // Include related variants if needed
      images: {
        include: {
          attributeValue: true,
        },
      },
      shop: true,
    },
  })

  if (!product) throw new Error("Product not found")

  return product
}

export default getProductById
