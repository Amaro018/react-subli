import db from "db"

type UpdateReturntStatusInput = {
  rentItemId: number
  status: "returned" | "returned_damaged"
  noteMessage: string
  amount: number

  manualFee: number
  replacementFee: number
  repairFee: number
  repairFees: { [key: string]: number }

  selectedQty: number
  goodQty: number
  manualQty: number
  replacementQty: number
  repairQty: number
  repairQuantities: { [key: string]: number }

  isGrossNegligence: boolean
  chargeLossOfUse: boolean
  shopKeepsSalvage: boolean
}

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
    selectedQty,
    goodQty,
    manualQty,
    replacementQty,
    repairQty,
    repairQuantities,
    isGrossNegligence,
    chargeLossOfUse,
    shopKeepsSalvage,
  } = input

  const rentItemData = await db.rentItem.findUnique({
    where: { id: rentItemId },
  })

  if (!rentItemData) throw new Error("Rent item not found")

  const chargesToCreate = [
    // Replacement
    {
      type: "damaged",
      subType: "replacement",
      severity: "TOTAL_LOSS",
      repairType: "total_loss",
      amount: replacementFee,
      quantity: replacementQty,
    },

    // Manual
    { type: "damaged", subType: "manual", amount: manualFee, quantity: manualQty },

    // Repairs: generate from repairTypes list
    ...["minor", "moderate", "major", "default"].map((repairType) => {
      if (repairType === "default") {
        return {
          type: "damaged",
          subType: "repair",
          severity: repairType,
          repairType,
          amount: repairFee ?? 0, // use singular
          quantity: repairQty ?? 0, // use singular
        }
      }

      return {
        type: "damaged",
        subType: "repair",
        severity: repairType,
        repairType,
        amount: repairFees[repairType] ?? 0,
        quantity: repairQuantities[repairType] ?? 0,
      }
    }),
  ].filter((c) => c.quantity > 0)

  // Advanced Resolution Workflow Modifiers
  const rawTotalDamageFee =
    replacementFee +
    manualFee +
    (repairFee ?? 0) +
    Object.values(repairFees ?? {}).reduce((a, b) => a + b, 0)

  if (rawTotalDamageFee > 0) {
    if (isGrossNegligence) {
      chargesToCreate.push({
        type: "damaged",
        subType: "penalty",
        severity: "GROSS_NEGLIGENCE",
        repairType: "gross_negligence",
        amount: rawTotalDamageFee * 0.2,
        quantity: 1,
      })
    }
    if (chargeLossOfUse) {
      chargesToCreate.push({
        type: "damaged",
        subType: "penalty",
        severity: "LOSS_OF_USE",
        repairType: "loss_of_use",
        amount: rentItemData.price * 3,
        quantity: 1,
      })
    }
    if (shopKeepsSalvage) {
      chargesToCreate.push({
        type: "damaged",
        subType: "credit",
        severity: "SALVAGE_KEPT",
        repairType: "salvage_kept",
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
    } as any,
    include: { charges: true } as any,
  })

  return rentItem
}
