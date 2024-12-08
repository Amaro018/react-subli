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

    // If no variant is selected, show events for all variants
    if (!selectedVariant) {
      return rents.variants.flatMap((variant: any) =>
        variant.rentItems.map((rentItem: any) => ({
          title: `${rents.name} (${variant.size}, ${variant.color.name})`,
          start: rentItem.startDate,
          end: rentItem.endDate,
        }))
      )
    }

    // If a variant is selected, filter events for the selected variant
    const variant = rents.variants.find(
      (v: any) => v.id === selectedVariant.id // Match the selected variant
    )

    if (!variant || !variant.rentItems) return [] // No events for the selected variant
    return variant.rentItems.map((rentItem: any) => ({
      title: `${rents.name} (${variant.size}, ${variant.color.name})`,
      start: rentItem.startDate,
      end: rentItem.endDate,
    }))
  }, [rents, selectedVariant])

  return (
    <div>
      {selectedVariant ? (
        <h3>
          Showing events for variant: {selectedVariant.size} - {selectedVariant.color?.name}
        </h3>
      ) : (
        <h3>Showing events for all variants</h3>
      )}
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events} // Pass the mapped events
      />
    </div>
  )
}
