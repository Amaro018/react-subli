import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid" // A plugin for calendar views
import React, { useMemo } from "react"
import getProductEventsById from "../queries/getProductEventsById"
import { useQuery } from "@blitzjs/rpc"

export default function Calendar({
  product,
  selectedVariant,
}: {
  product: any
  selectedVariant: any
}) {
  // Fetch rent dates using the productId
  const [rents] = useQuery(getProductEventsById, { productId: product.id })

  console.log({ selectedVariant })

  // Map rent dates to FullCalendar's `events` format
  const events = useMemo(() => {
    if (!rents || !rents.variants) return []

    // If no variant is selected, show "rendering" events for all variants
    if (!selectedVariant) {
      return rents.variants.flatMap((variant: any) =>
        variant.rentItems
          .filter((rentItem: any) => rentItem.status === "rendering") // Only include items with "rendering" status
          .map((rentItem: any) => ({
            title: `${rents.name} (${variant.size}, ${variant.color.name}, ${rentItem.status})`,
            start: new Date(rentItem.startDate).toISOString(),
            end: new Date(rentItem.endDate).toISOString(),
          }))
      )
    }

    // If a variant is selected, filter "rendering" events for the selected variant
    const variant = rents.variants.find(
      (v: any) => v.id === selectedVariant.id // Match the selected variant
    )

    if (!variant || !variant.rentItems) return []
    return variant.rentItems
      .filter((rentItem: any) => rentItem.status === "rendering") // Only include items with "rendering" status
      .map((rentItem: any) => ({
        title:
          rentItem.status === "rendering" && rentItem.quantity === variant.quantity
            ? "NOT AVAILABLE"
            : rentItem.status,
        start: new Date(rentItem.startDate).toISOString(),
        end: new Date(rentItem.endDate).toISOString(),
      }))
  }, [rents, selectedVariant])

  return (
    <div>
      {selectedVariant ? (
        <h3>
          Showing "rendering" events for variant: {selectedVariant.size} -{" "}
          {selectedVariant.color?.name}
        </h3>
      ) : (
        <h3>Showing "rendering" events for all variants</h3>
      )}
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events} // Pass the filtered events
        displayEventTime={false}
        eventContent={(arg) => {
          return (
            <div className="flex justify-center font-bold">
              <p>{arg.event.title}</p>
            </div>
          ) // Only display the title
        }}
      />
    </div>
  )
}
