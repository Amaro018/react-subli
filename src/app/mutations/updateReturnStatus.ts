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
  } = input

  const chargesToCreate = [
    // Replacement
    { type: "damaged", subType: "replacement", amount: replacementFee, quantity: replacementQty },

    // Manual
    { type: "damaged", subType: "manual", amount: manualFee, quantity: manualQty },

    // Repairs: generate from repairTypes list
    ...["minor", "moderate", "major", "default"].map((repairType) => {
      if (repairType === "default") {
        return {
          type: "damaged",
          subType: "repair",
          repairType,
          amount: repairFee ?? 0, // use singular
          quantity: repairQty ?? 0, // use singular
        }
      }

      return {
        type: "damaged",
        subType: "repair",
        repairType,
        amount: repairFees[repairType] ?? 0,
        quantity: repairQuantities[repairType] ?? 0,
      }
    }),
  ].filter((c) => c.quantity > 0)

  const rentItem = await db.rentItem.update({
    where: { id: rentItemId },
    data: {
      status,
      returnedDamagedQty: selectedQty - goodQty,
      charges: {
        create: chargesToCreate,
      },
    } as any,
    include: { charges: true } as any,
  })

  return rentItem
}
