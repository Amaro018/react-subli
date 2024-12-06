import db from "db"

export default async function deleteCartItemById(input: { id: number }) {
  const { id } = input

  // Find and delete the cart item
  const cartItem = await db.cartItem.findUnique({
    where: { id },
  })

  if (!cartItem) {
    throw new Error("Cart item not found")
  }

  await db.cartItem.delete({
    where: { id },
  })

  return { success: true }
}
