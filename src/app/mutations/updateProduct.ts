import db from "db"
import { z } from "zod"

// Schema for updating product
// export const UpdateProductInput = z.object({
//   id: z.number(),
//   name: z.string().optional(),
//   description: z.string().optional(),
//   status: z.string().optional(),
//   deliveryOption: z.string().optional(),
//   categoryId: z.number().nullable().optional(),
//   images: z.array(z.object({ id: z.number().optional(), url: z.string() })).optional(),
//   variants: z.array(
//     z.object({
//       id: z.number(),
//       colorId: z.number().nullable(),
//       price: z.number(),
//       quantity: z.number(),
//       replacementCost: z.number(),
//       manualRepairCost: z.number(),
//       damagePolicies: z.array(
//         z.object({
//           id: z.number(),
//           damageSeverity: z.string(),
//           damageSeverityPercent: z.number(),
//         })
//       ),
//     })
//   ).optional(),
// })

export const UpdateProductInput = z.object({
  id: z.number(),
  deliveryOption: z.string(),
  status: z.string(),
  categoryid: z.number(),
  variants: z.array(
    z.object({
      id: z.number(),
      size: z.string(),
      colorid: z.number(),
      quantity: z.number(),
      price: z.number(),
      replacementCost: z.number(),
      manualRepairCost: z.number(),
      damagePolicies: z.array(
        z.object({
          id: z.number(),
          damageSeverityPercent: z.number(),
        })
      ),
    })
  ),
})

export default async function updateProduct(input: z.infer<typeof UpdateProductInput>) {
  // const { id, images, variants, ...productData } = input

  const { id, deliveryOption, status, categoryid, variants } = input

  const product = await db.product.update({
    where: { id },
    data: {
      deliveryOption,
      status,
      categoryid,
      variants: {
        update: variants.map((v) => ({
          where: { id: v.id },
          data: {
            size: v.size,
            colorid: v.colorid,
            price: v.price,
            quantity: v.quantity,
            replacementCost: v.replacementCost,
            manualRepairCost: v.manualRepairCost,
            damagePolicies: {
              update: v.damagePolicies.map((dp) => ({
                where: { id: dp.id },
                data: {
                  damageSeverityPercent: dp.damageSeverityPercent,
                },
              })),
            },
          },
        })),
      },
    },
    include: {
      category: true,
      variants: {
        include: {
          damagePolicies: true,
        },
      },
    },
  })

  return product

  // const product = await db.product.update({
  //   where: {id},
  //   data: {
  //     ...productData,
  //     ...(variants && {
  //       variants: {
  //         update: variants.map((v) => ({
  //           where: {id: v.id},
  //           data: {
  //             quantity: v.quantity
  //           }
  //         }))
  //       }
  //     })
  //   }
  // })

  // const product = await db.product.update({
  //   where: { id },
  //   data: {
  //     ...productData,

  //     // Images
  //     ...(images && {
  //       images: {
  //         deleteMany: {}, // clear old
  //         create: images.map((img) => ({ url: img.url })),
  //       },
  //     }),

  //     // Variants
  //     ...(variants && {
  //       variants: {
  //         update: variants.map((v) => ({
  //           where: { id: v.id },
  //           data: {
  //             colorId: v.colorId,
  //             price: v.price,
  //             quantity: v.quantity,
  //             replacementCost: v.replacementCost,
  //             manualRepairCost: v.manualRepairCost,
  //             damagePolicies: {
  //               update: v.damagePolicies.map((dp) => ({
  //                 where: { id: dp.id },
  //                 data: {
  //                   damageSeverity: dp.damageSeverity,
  //                   damageSeverityPercent: dp.damageSeverityPercent,
  //                 },
  //               })),
  //             },
  //           },
  //         })),
  //       },
  //     }),
  //   },
  //   include: {
  //     variants: { include: { damagePolicies: true } },
  //     images: true,
  //   },
  // })

  // const product = await db.product.count()

  return product
}
