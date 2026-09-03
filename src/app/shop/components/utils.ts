/**
 * Calculates the current fair market value of an item based on its original price,
 * purchase date, and category depreciation rate.
 */
export const calculateCurrentValue = (
  originalMSRP: number,
  originalPurchaseDate: string | Date,
  depreciationRate: number = 0.2,
  minFloorPercent: number = 0.1
) => {
  if (!originalMSRP || !originalPurchaseDate) return originalMSRP || 0

  const bought = new Date(originalPurchaseDate)
  const now = new Date()

  // Calculate age in years (365.25 accounts for leap years)
  const diffTime = now.getTime() - bought.getTime()
  const ageInYears = Math.max(0, diffTime / (1000 * 60 * 60 * 24 * 365.25))

  // Fairness Formula: Original Price * (1 - Rate) ^ Age
  const currentValue = originalMSRP * Math.pow(1 - depreciationRate, ageInYears)
  const floorValue = originalMSRP * minFloorPercent

  return Math.max(floorValue, currentValue)
}

/**
 * Formats a date or string into "Oct 24, 2023 - 4:30 PM" format.
 */
export const formatDateTime = (dateInput: any) => {
  if (!dateInput) return ""
  const d = new Date(dateInput)
  return `${d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} - ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
}

/**
 * Generates the cartesian product of multiple arrays.
 */
export const cartesian = (args: any[][]) => {
  const r: any[] = [],
    max = args.length - 1
  function helper(arr: any[], i: number) {
    for (var j = 0, l = args[i]!.length; j < l; j++) {
      var a = arr.slice(0)
      a.push(args[i]![j])
      if (i == max) r.push(a)
      else helper(a, i + 1)
    }
  }
  if (args.length === 0) return []
  helper([], 0)
  return r
}

/**
 * Calculates rent totals including base rent, charges, and payments.
 */
export const calculateRentTotals = (rentItem: any) => {
  if (!rentItem)
    return {
      baseRent: 0,
      totalCharges: 0,
      totalPenalty: 0,
      totalPaid: 0,
      daysRented: 0,
      grandTotal: 0,
      remainingBalance: 0,
      initialFee: 0,
    }

  const start = new Date(rentItem.startDate)
  const end = new Date(rentItem.endDate)
  let diffMs = end.getTime() - start.getTime()
  const offsetDiff = end.getTimezoneOffset() - start.getTimezoneOffset()
  diffMs += offsetDiff * 60 * 1000

  const daysRented = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  const baseRent = rentItem.price * rentItem.quantity * daysRented
  const initialFee = baseRent * 0.5

  const totalCharges = rentItem.charges?.reduce((sum: number, c: any) => sum + c.amount, 0) || 0

  let totalPaid = 0
  let totalPenalty = 0
  rentItem.payments?.forEach((p: any) => {
    totalPaid += p.amount
    totalPenalty += p.penaltyFee || 0
  })

  const grandTotal = baseRent + totalCharges + totalPenalty
  const remainingBalance = grandTotal - totalPaid

  return {
    baseRent,
    totalCharges,
    totalPenalty,
    totalPaid,
    daysRented,
    grandTotal,
    remainingBalance,
    initialFee,
  }
}
