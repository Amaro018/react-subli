// import db from "db";
// import { z } from "zod";

// const GetRentItemsByProductVariant = z.object({
//   productVariantId: z.number(),
// });

// export default async function getRentItemsByProductVariant(input: { productVariantId: number }) {
//   const { productVariantId } = GetRentItemsByProductVariant.parse(input);

//   const rentItems = await db.rentItem.findMany({
//     where: {
//       productVariantId: productVariantId,
//     },
//     include: {
//       rent: true, // Include related rent information
//       productVariant: true, // Include related product variant details
//       payments: true, // Include related payments
//     },
//   });

//   return rentItems;
// }

import db from "db"
import { z } from "zod"

export default async function getRentItemsByProductVariant() {
  const rentItems = await db.rentItem.findMany({
    include: {
      rent: true, // Include related rent information
      productVariant: true, // Include related product variant details
      payments: true, // Include related payments
    },
  })

  return rentItems
}
