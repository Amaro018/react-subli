import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction"
import React, { useMemo, useState } from "react"
import { DateSelectArg, DayCellContentArg, EventContentArg } from "@fullcalendar/core"
import { useQuery } from "@blitzjs/rpc"
import getProductEventsById from "../queries/getProductEventsById"

const formatDateStr = (d: Date) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export default function Calendar({
  product,
  selectedVariant,
  onDateClick,
  onDateSelect,
  onTimeClick,
  startDate,
  endDate,
}: {
  product: any
  selectedVariant: any
  onDateClick?: (dateStr: string) => void
  onDateSelect?: (startStr: string, endStr: string) => void
  onTimeClick?: (timeValue: string, dateStr: string) => void
  startDate?: Date | null
  endDate?: Date | null
}) {
  const [rents] = useQuery(
    getProductEventsById,
    { productId: product?.id },
    {
      enabled: !!product?.id,
      refetchInterval: 5000,
    }
  )

  const [viewStart, setViewStart] = useState<Date | null>(null)
  const [viewEnd, setViewEnd] = useState<Date | null>(null)
  const [modalInfo, setModalInfo] = useState<{
    date: string
    hourly: { time: string; value: string; qty: number }[]
  } | null>(null)

  // Calculation Logic
  const { baseQty, dayStatuses, dayAvailabilities, hourlyAvailabilities } = useMemo(() => {
    let base = 0
    const intervals: { start: number; end: number; qty: number }[] = []
    if (!rents || !rents.variants)
      return { baseQty: 0, dayStatuses: {}, dayAvailabilities: {}, hourlyAvailabilities: {} }

    const processedIds = new Set<number>()

    rents.variants.forEach((v: any) => {
      if (selectedVariant && v.id !== selectedVariant.id) return
      let variantQty = v.quantity || 0
      let damagedQty = 0

      v.rentItems?.forEach((rent: any) => {
        if (processedIds.has(rent.id)) return
        processedIds.add(rent.id)

        if (rent.returnedDamagedQty > 0) {
          damagedQty += rent.returnedDamagedQty
        }

        if (["accepted", "rendering", "on_hand", "overdue"].includes(rent.status)) {
          const start = new Date(rent.startDate).getTime()
          const end = new Date(rent.endDate).getTime() + 3 * 60 * 60 * 1000
          intervals.push({ start, end, qty: rent.quantity })
        }
      })

      base += Math.max(0, variantQty - damagedQty)
    })

    const statuses: Record<string, "available" | "partial" | "full"> = {}
    const availabilities: Record<string, number> = {}
    const hourlyAvail: Record<string, { time: string; value: string; qty: number }[]> = {}
    if (intervals.length > 0) {
      let minDate = new Date(Math.min(...intervals.map((i) => i.start)))
      minDate.setHours(0, 0, 0, 0)
      let maxDate = new Date(Math.max(...intervals.map((i) => i.end)))
      maxDate.setHours(0, 0, 0, 0)

      const TIME_OPTIONS = [9, 10, 11, 12, 13, 14, 15, 16, 17]

      let current = new Date(minDate)
      while (current <= maxDate) {
        const dStr = formatDateStr(current)
        let maxAvailableAtSlots = 0
        let anyRented = false
        const dayHourly: { time: string; value: string; qty: number }[] = []

        for (const hour of TIME_OPTIONS) {
          const checkTimeStart = new Date(current).setHours(hour, 0, 0, 0)
          const checkTimeEnd = checkTimeStart + 24 * 60 * 60 * 1000

          intervals.forEach((inv) => {
            if (checkTimeStart >= inv.start && checkTimeStart < inv.end) {
              anyRented = true
            }
          })

          let maxRentedInWindow = 0
          const windowIntervals = intervals.filter(
            (inv) => inv.start < checkTimeEnd && inv.end > checkTimeStart
          )

          if (windowIntervals.length > 0) {
            const events: { time: number; type: "start" | "end"; qty: number }[] = []
            windowIntervals.forEach((inv) => {
              events.push({
                time: Math.max(inv.start, checkTimeStart),
                type: "start",
                qty: inv.qty,
              })
              events.push({ time: Math.min(inv.end, checkTimeEnd), type: "end", qty: inv.qty })
            })
            events.sort((a, b) =>
              a.time === b.time ? (a.type === "end" ? -1 : 1) : a.time - b.time
            )

            let currentQty = 0
            events.forEach((ev) => {
              if (ev.type === "start") currentQty += ev.qty
              else currentQty -= ev.qty
              if (currentQty > maxRentedInWindow) maxRentedInWindow = currentQty
            })
          }

          const available = base - maxRentedInWindow
          if (available > maxAvailableAtSlots) {
            maxAvailableAtSlots = available
          }

          const ampm = hour >= 12 ? "PM" : "AM"
          const displayHour = hour > 12 ? hour - 12 : hour
          const timeStr = `${displayHour.toString().padStart(2, "0")}:00 ${ampm}`
          const timeValue = `${hour.toString().padStart(2, "0")}:00`
          dayHourly.push({ time: timeStr, value: timeValue, qty: available })
        }

        if (maxAvailableAtSlots <= 0) {
          statuses[dStr] = "full"
          availabilities[dStr] = 0
        } else if (anyRented) {
          statuses[dStr] = "partial"
          availabilities[dStr] = maxAvailableAtSlots
        } else {
          statuses[dStr] = "available"
          availabilities[dStr] = base
        }
        hourlyAvail[dStr] = dayHourly

        current.setDate(current.getDate() + 1)
      }
    }
    return {
      baseQty: base,
      dayStatuses: statuses,
      dayAvailabilities: availabilities,
      hourlyAvailabilities: hourlyAvail,
    }
  }, [rents, selectedVariant])

  // Dynamic dates to avoid staleness if the tab is left open, and to match form's 5 PM rule
  const today = new Date()
  const currentHour = today.getHours()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  const minAllowedDate = new Date(today)
  if (currentHour >= 17) {
    minAllowedDate.setDate(minAllowedDate.getDate() + 2)
  } else {
    minAllowedDate.setDate(minAllowedDate.getDate() + 1)
  }
  const minAllowedTime = minAllowedDate.getTime()

  const { startTime, endTime } = useMemo(() => {
    const start = startDate ? new Date(startDate) : null
    if (start) start.setHours(0, 0, 0, 0)
    const end = endDate ? new Date(endDate) : null
    if (end) end.setHours(0, 0, 0, 0)
    return { startTime: start?.getTime() || null, endTime: end?.getTime() || null }
  }, [startDate, endDate])

  const calendarEvents = useMemo(() => {
    if (!rents || !rents.variants) return []
    const generatedEvents: any[] = []

    const processedIds = new Set<number>()

    rents.variants.forEach((v: any) => {
      if (selectedVariant && v.id !== selectedVariant.id) return
      v.rentItems?.forEach((rent: any) => {
        if (processedIds.has(rent.id)) return
        processedIds.add(rent.id)

        if (["accepted", "rendering", "on_hand", "overdue"].includes(rent.status)) {
          const rentStart = new Date(rent.startDate)
          const rentEnd = new Date(rent.endDate)
          const startTimeStr = new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }).format(rentStart)
          const endTimeStr = new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }).format(rentEnd)
          const startDateDisplay = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(rentStart)
          const endDateDisplay = new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(rentEnd)

          const startStr = formatDateStr(new Date(rent.startDate))
          const endObj = new Date(rent.endDate)
          endObj.setDate(endObj.getDate() + 1) // FullCalendar allDay end dates are exclusive, so we add 1 day
          const endStr = formatDateStr(endObj)

          generatedEvents.push({
            id: `rent-${rent.id}`,
            title: `Rented x${rent.quantity} (${startTimeStr} - ${endTimeStr})`,
            start: startStr,
            end: endStr,
            allDay: true,
            display: "block",
            classNames: ["rent-event"],
            extendedProps: {
              type: "rent",
              order: 1,
              tooltip: `Rented: ${rent.quantity} item(s)\nFrom: ${startDateDisplay} at ${startTimeStr}\nUntil: ${endDateDisplay} at ${endTimeStr}`,
            },
          })
        }
      })
    })

    if (viewStart && viewEnd) {
      let current = new Date(viewStart)
      current.setHours(0, 0, 0, 0)
      const last = new Date(viewEnd)
      last.setHours(0, 0, 0, 0)

      while (current <= last) {
        const cellTime = current.getTime()
        if (cellTime >= todayTime) {
          const dStr = formatDateStr(current)
          const availableQty = dayAvailabilities[dStr] ?? baseQty
          const isAvailable = availableQty > 0

          let hourly = hourlyAvailabilities[dStr]
          if (!hourly) {
            hourly = [9, 10, 11, 12, 13, 14, 15, 16, 17].map((hour) => {
              const ampm = hour >= 12 ? "PM" : "AM"
              const displayHour = hour > 12 ? hour - 12 : hour
              const timeValue = `${hour.toString().padStart(2, "0")}:00`
              return {
                time: `${displayHour.toString().padStart(2, "0")}:00 ${ampm}`,
                value: timeValue,
                qty: baseQty,
              }
            })
          }

          generatedEvents.push({
            id: `avail-${dStr}`,
            title: isAvailable ? `${availableQty} Available` : "Not Available",
            start: dStr,
            allDay: true,
            display: "block",
            classNames: ["availability-event"],
            extendedProps: { type: "availability", isAvailable, order: 2, hourly },
          })
        }
        current.setDate(current.getDate() + 1)
      }
    }

    return generatedEvents
  }, [
    rents,
    selectedVariant,
    dayAvailabilities,
    hourlyAvailabilities,
    viewStart,
    viewEnd,
    todayTime,
    baseQty,
  ])

  return (
    <div className="w-full flex flex-col">
      <div className="fullcalendar-wrapper relative">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .fc { 
            font-family: inherit; 
            --fc-border-color: #f3f4f6; 
            --fc-button-text-color: #374151;
            --fc-button-bg-color: #ffffff;
            --fc-button-border-color: #d1d5db;
            --fc-button-hover-bg-color: #f9fafb;
            --fc-button-hover-border-color: #d1d5db;
            --fc-button-active-bg-color: #1b2a80;
            --fc-button-active-border-color: #1b2a80;
            --fc-today-bg-color: #f8fafc;
          }
          
          .fc .fc-toolbar-title {
            font-size: 1.125rem;
            font-weight: 700;
            color: #111827;
          }
          
          .fc .fc-button {
            text-transform: capitalize;
            font-weight: 600;
            padding: 0.4rem 0.85rem;
            border-radius: 8px;
            transition: all 0.2s ease;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }
          
          .fc .fc-button-primary:not(:disabled):active, 
          .fc .fc-button-primary:not(:disabled).fc-button-active {
            color: white;
          }

          .fc-theme-standard th {
            padding: 12px 0;
            font-weight: 600;
            color: #6b7280;
            font-size: 0.75rem;
            background-color: #f9fafb;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid #f3f4f6;
          }

          .fc-daygrid-day-frame {
            min-height: 100px !important;
          }
          
          .fc-daygrid-day-top {
            display: flex !important;
            justify-content: flex-end !important;
            padding: 6px 6px 0 6px !important;
          }
          
          .fc-daygrid-day-number {
            font-weight: 600;
            color: #374151;
            font-size: 0.875rem;
            text-decoration: none;
            padding: 4px 8px !important;
            border-radius: 6px;
            transition: background-color 0.2s;
          }
          
          .fc-daygrid-day-number:hover {
            background-color: #f3f4f6;
          }

          /* Today Cell Highlight */
          .fc-day-today .fc-daygrid-day-number {
            background-color: #1b2a80 !important;
            color: #ffffff !important;
          }
          .fc-day-today .fc-daygrid-day-number:hover {
            background-color: #152266 !important;
          }
          
          .fc-daygrid-day-events {
            margin-bottom: 4px !important;
          }

          /* Hide native time text prepended by FullCalendar */
          .fc-event-time {
            display: none !important;
          }

          /* Styling the Rented Bars */
          .rent-event {
            background-color: #fef2f2 !important;
            border: 1px solid #fecaca !important;
            border-radius: 6px !important;
            padding: 2px 4px !important;
            box-shadow: none !important;
            margin: 1px 4px 2px 4px !important;
          }

          /* Styling the Availability Event */
          .availability-event {
            background-color: transparent !important;
            border: none !important;
            box-shadow: none !important;
            cursor: pointer !important;
            border-radius: 6px !important;
            transition: background-color 0.2s ease !important;
            margin: 2px 4px 4px 4px !important;
          }
          .availability-event:hover {
            background-color: #f3f4f6 !important;
          }

          /* Cell States */
          .fc-day-past-custom { 
            background-color: #f9fafb !important; 
            pointer-events: none; 
          }
          .fc-day-past-custom .fc-daygrid-day-number { 
            color: #9ca3af !important; 
          }
          .fc-day-unselectable {
            cursor: not-allowed !important;
          }
          .fc-daygrid-day:not(.fc-day-past-custom):not(.fc-day-unselectable) {
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .fc-daygrid-day:not(.fc-day-past-custom):not(.fc-day-unselectable):hover {
            background-color: #f9fafb;
          }
          .fc-day-selected { 
            background-color: #eff6ff !important; 
            box-shadow: inset 0 0 0 2px #1b2a80 !important; 
          }
          .fc-day-selected .fc-daygrid-day-number { 
            color: #1b2a80 !important; 
            font-weight: 700; 
          }

          .fc-popover {
            z-index: 50 !important;
          }
        `,
          }}
        />

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          fixedWeekCount={false}
          contentHeight="auto"
          dayMaxEvents={4}
          selectable={true}
          headerToolbar={{ left: "prev,next", center: "title", right: "today" }}
          events={calendarEvents}
          eventOrder="extendedProps.order,start"
          eventOrderStrict={true}
          datesSet={(arg) => {
            setViewStart(arg.start)
            setViewEnd(arg.end)
          }}
          dayCellContent={(arg: DayCellContentArg) => {
            return <span className="fc-daygrid-day-number">{arg.dayNumberText}</span>
          }}
          eventContent={(arg: EventContentArg) => {
            if (arg.event.extendedProps.type === "availability") {
              const isAvailable = arg.event.extendedProps.isAvailable
              return (
                <div className="flex items-center gap-1.5 px-1.5 w-full mt-0.5">
                  <div
                    className={`w-1.5 h-1.5 shrink-0 rounded-full ${
                      isAvailable ? "bg-blue-500" : "bg-red-500"
                    } shadow-sm`}
                  />
                  <span
                    className={`text-[10px] font-bold truncate ${
                      isAvailable ? "text-blue-700" : "text-red-700"
                    }`}
                  >
                    {arg.event.title}
                  </span>
                </div>
              )
            }

            const tooltipText = arg.event.extendedProps.tooltip || arg.event.title

            return (
              <div
                className="text-[10px] text-red-800 font-semibold leading-tight truncate px-1 py-0.5 whitespace-pre-line"
                title={tooltipText}
              >
                {arg.event.title}
              </div>
            )
          }}
          eventClick={(arg) => {
            if (arg.event.extendedProps.type === "availability") {
              setModalInfo({
                date: arg.event.startStr,
                hourly: arg.event.extendedProps.hourly || [],
              })
              arg.jsEvent.preventDefault()
            }
          }}
          dayCellClassNames={(arg) => {
            const cellTime = arg.date.getTime()
            const classes = []
            if (cellTime < todayTime) classes.push("fc-day-past-custom")
            else if (cellTime < minAllowedTime) classes.push("fc-day-unselectable")

            if (
              startTime &&
              ((endTime && cellTime >= startTime && cellTime <= endTime) || cellTime === startTime)
            ) {
              classes.push("fc-day-selected")
            }
            return classes
          }}
          selectAllow={(selectInfo) => {
            if (selectInfo.start.getTime() < minAllowedTime) return false
            for (
              let d = new Date(selectInfo.start);
              d < selectInfo.end;
              d.setDate(d.getDate() + 1)
            ) {
              if (dayStatuses[formatDateStr(d)] === "full") return false
            }
            return true
          }}
          select={(arg: DateSelectArg) => {
            if (onDateSelect) {
              const inclusiveEnd = new Date(arg.end)
              inclusiveEnd.setDate(inclusiveEnd.getDate() - 1)
              onDateSelect(formatDateStr(arg.start), formatDateStr(inclusiveEnd))
            }
            arg.view.calendar.unselect()
          }}
          dateClick={(arg: DateClickArg) => {
            if (
              arg.date.getTime() >= minAllowedTime &&
              dayStatuses[arg.dateStr] !== "full" &&
              onDateClick
            ) {
              onDateClick(arg.dateStr)
            }
          }}
        />
      </div>

      {modalInfo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setModalInfo(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Availability Summary</h3>
              <button
                onClick={() => setModalInfo(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg text-center">
              {new Date(
                Number(modalInfo.date.split("-")[0]),
                Number(modalInfo.date.split("-")[1]) - 1,
                Number(modalInfo.date.split("-")[2])
              ).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1 scrollbar-seamless">
              {modalInfo.hourly.map((h, i) => (
                <button
                  key={i}
                  disabled={h.qty <= 0}
                  onClick={() => {
                    if (onTimeClick) onTimeClick(h.value, modalInfo.date)
                    setModalInfo(null)
                  }}
                  className={`flex justify-between items-center bg-white p-2.5 rounded-xl border shadow-sm transition-colors text-left ${
                    h.qty > 0
                      ? "border-gray-200 hover:border-[#1b2a80] hover:shadow-md cursor-pointer"
                      : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      h.qty > 0 ? "text-gray-700" : "text-gray-400"
                    }`}
                  >
                    {h.time}
                  </span>
                  <span
                    className={`text-sm font-bold ${h.qty > 0 ? "text-green-600" : "text-red-400"}`}
                  >
                    {h.qty}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-5 pt-3 border-t border-gray-100 text-center">
              <button
                onClick={() => setModalInfo(null)}
                className="px-6 py-2 bg-[#1b2a80] text-white text-sm font-bold rounded-lg hover:bg-[#152266] transition-colors w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
