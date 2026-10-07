export interface RentalInterval {
  start: number
  end: number
  quantity: number
}

const RENTAL_RETURN_BUFFER_MS = 3 * 60 * 60 * 1000

export function getAvailableRentalQuantity(
  stock: number,
  damagedQuantity: number,
  intervals: RentalInterval[],
  startDate: Date,
  endDate: Date
) {
  const requestedStart = startDate.getTime()
  const requestedEnd = endDate.getTime()
  const events: { time: number; quantity: number; type: "start" | "end" }[] = []

  for (const interval of intervals) {
    const reservedEnd = interval.end + RENTAL_RETURN_BUFFER_MS
    if (interval.start < requestedEnd && reservedEnd > requestedStart) {
      events.push({
        time: Math.max(interval.start, requestedStart),
        quantity: interval.quantity,
        type: "start",
      })
      events.push({
        time: Math.min(reservedEnd, requestedEnd),
        quantity: interval.quantity,
        type: "end",
      })
    }
  }

  events.sort((a, b) => (a.time === b.time ? (a.type === "end" ? -1 : 1) : a.time - b.time))

  let rentedAtOnce = 0
  let maxRented = 0
  for (const event of events) {
    rentedAtOnce += event.type === "start" ? event.quantity : -event.quantity
    maxRented = Math.max(maxRented, rentedAtOnce)
  }

  return Math.max(0, stock - damagedQuantity - maxRented)
}
