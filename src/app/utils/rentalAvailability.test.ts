import { describe, expect, it } from "vitest"
import { getAvailableRentalQuantity } from "./rentalAvailability"

const date = (value: string) => new Date(value)

describe("getAvailableRentalQuantity", () => {
  it("subtracts overlapping rentals and damaged stock", () => {
    const available = getAvailableRentalQuantity(
      8,
      1,
      [
        {
          start: date("2026-10-10T09:00:00").getTime(),
          end: date("2026-10-10T12:00:00").getTime(),
          quantity: 3,
        },
      ],
      date("2026-10-10T10:00:00"),
      date("2026-10-10T11:00:00")
    )

    expect(available).toBe(4)
  })

  it("includes the return buffer when checking a later rental", () => {
    const available = getAvailableRentalQuantity(
      4,
      0,
      [
        {
          start: date("2026-10-10T09:00:00").getTime(),
          end: date("2026-10-10T12:00:00").getTime(),
          quantity: 4,
        },
      ],
      date("2026-10-10T14:00:00"),
      date("2026-10-10T16:00:00")
    )

    expect(available).toBe(0)
  })

  it("does not count rentals outside the requested dates", () => {
    const available = getAvailableRentalQuantity(
      5,
      0,
      [
        {
          start: date("2026-10-11T09:00:00").getTime(),
          end: date("2026-10-11T12:00:00").getTime(),
          quantity: 5,
        },
      ],
      date("2026-10-10T09:00:00"),
      date("2026-10-10T12:00:00")
    )

    expect(available).toBe(5)
  })
})
