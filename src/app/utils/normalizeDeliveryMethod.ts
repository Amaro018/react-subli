export type DeliveryMethod = "delivery" | "pickup"

export function normalizeDeliveryMethod(value: string): DeliveryMethod | null {
  if (value === "delivery" || value === "deliver") return "delivery"
  if (value === "pickup") return "pickup"
  return null
}
