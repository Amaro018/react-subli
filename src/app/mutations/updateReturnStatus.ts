import db from "db"
import { z } from "zod"

export const UpdateReturnStatusSchema = z.object({
  rentItemId: z.number(),
  status: z.enum(["returned", "returned_damaged"]),
  noteMessage: z.string(),
  amount: z.number(),

  manualFee: z.number(),
  replacementFee: z.number(),
  repairFee: z.number(),
  repairFees: z.record(z.string(), z.number()),
  lateFee: z.number().optional(),

  selectedQty: z.number(),
  goodQty: z.number(),
  manualQty: z.number(),
  replacementQty: z.number(),
  repairQty: z.number(),
  repairQuantities: z.record(z.string(), z.number()),

  isGrossNegligence: z.boolean(),
  chargeLossOfUse: z.boolean(),
  shopKeepsSalvage: z.boolean(),
})

type UpdateReturntStatusInput = z.infer<typeof UpdateReturnStatusSchema>

export default async function updateReturnStatus(input: UpdateReturntStatusInput) {
  const {
    rentItemId,
    status,
    noteMessage,
    amount,
    manualFee,
    replacementFee,
    repairFee,
    repairFees,
    lateFee,
    selectedQty,
    goodQty,
    manualQty,
    replacementQty,
    repairQty,
    repairQuantities,
    isGrossNegligence,
    chargeLossOfUse,
    shopKeepsSalvage,
  } = UpdateReturnStatusSchema.parse(input)

  const rentItemData = await db.rentItem.findUnique({
    where: { id: rentItemId },
  })

  if (!rentItemData) throw new Error("Rent item not found")

  const chargesToCreate: { type: string; severity?: string; amount: number; quantity: number }[] =
    []

  if (replacementQty > 0) {
    chargesToCreate.push({
      type: "DAMAGED",
      severity: "TOTAL_LOSS",
      amount: replacementFee,
      quantity: replacementQty,
    })
  }

  if (manualQty > 0) {
    chargesToCreate.push({
      type: "DAMAGED",
      severity: "MANUAL",
      amount: manualFee,
      quantity: manualQty,
    })
  }

  for (const [severity, qty] of Object.entries(repairQuantities)) {
    if (qty > 0) {
      chargesToCreate.push({
        type: "DAMAGED",
        severity: severity.toUpperCase(),
        amount: repairFees[severity] ?? 0,
        quantity: qty,
      })
    }
  }

  if (lateFee && lateFee > 0) {
    chargesToCreate.push({
      type: "LATE",
      severity: "LATE_RETURN",
      amount: lateFee,
      quantity: 1,
    })
  }

  // Advanced Resolution Workflow Modifiers
  const rawTotalDamageFee =
    replacementFee +
    manualFee +
    (repairFee ?? 0) +
    Object.values(repairFees ?? {}).reduce((a, b) => a + b, 0)

  if (rawTotalDamageFee > 0) {
    if (isGrossNegligence) {
      chargesToCreate.push({
        type: "DAMAGED",
        severity: "GROSS_NEGLIGENCE",
        amount: rawTotalDamageFee * 0.2,
        quantity: 1,
      })
    }
    if (chargeLossOfUse) {
      chargesToCreate.push({
        type: "DAMAGED",
        severity: "LOSS_OF_USE",
        amount: rentItemData.price * 3,
        quantity: 1,
      })
    }
    if (shopKeepsSalvage) {
      chargesToCreate.push({
        type: "DAMAGED",
        severity: "SALVAGE_KEPT",
        amount: -(rawTotalDamageFee * 0.15),
        quantity: 1,
      })
    }
  }

  const rentItem = await db.rentItem.update({
    where: { id: rentItemId },
    data: {
      status,
      returnedDamagedQty: selectedQty - goodQty,
      note: noteMessage,
      charges: {
        create: chargesToCreate,
      },
    },
    include: { charges: true },
  })

  return rentItem
}
