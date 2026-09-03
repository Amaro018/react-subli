import React, { useState, useMemo, useEffect } from "react"
import { invoke, useQuery, useMutation } from "@blitzjs/rpc"
import {
  TextField,
  MenuItem,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { toast } from "@/src/app/utils/toast"
import addToCart from "../mutations/addToCart"
import createRent from "../mutations/createRent"
import getAllRentItems from "../queries/getAllRentItems"
import CalendarEvent from "./CalendarEvent"
import ProductOptionsCard from "./ProductOptionsCard"
import getBarangays from "../queries/getBarangays"
import { useRouter } from "next/navigation"
import BookingCheckoutModal from "./BookingCheckoutModal"

const TIME_OPTIONS = [
  { value: "09:00", label: "09:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "01:00 PM" },
  { value: "14:00", label: "02:00 PM" },
  { value: "15:00", label: "03:00 PM" },
  { value: "16:00", label: "04:00 PM" },
  { value: "17:00", label: "05:00 PM" },
]

const MIN_HOUR = parseInt(TIME_OPTIONS[0].value.split(":")[0], 10)
const MAX_HOUR = parseInt(TIME_OPTIONS[TIME_OPTIONS.length - 1].value.split(":")[0], 10)

const TEXTFIELD_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    "&:hover fieldset": { borderColor: "#1b2a80" },
    "&.Mui-focused fieldset": { borderColor: "#1b2a80", borderWidth: "2px" },
  },
}

const formatDate = (d: Date | null) => {
  if (!d) return ""
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const parseLocalDate = (dateStr: string) => {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split("-").map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

const buildFinalDate = (d: Date, t: string) => {
  const res = new Date(d)
  const [h, m] = t.split(":").map(Number)
  res.setHours(h, m, 0, 0)
  return { date: res, h, m }
}

interface ProductBookingFormProps {
  product: any
  currentUser: any
  refetch: any
  selectedColor: number | null
  setSelectedColor: (color: number | null) => void
  selectedVariant: any | null
  setSelectedVariant: (variant: any | null) => void
}

export default function ProductBookingForm({
  product,
  currentUser,
  refetch,
  selectedColor,
  setSelectedColor,
  selectedVariant,
  setSelectedVariant,
}: ProductBookingFormProps) {
  const router = useRouter()
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(0)
  const [availableQuantity, setAvailableQuantity] = useState(0)
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(
    product?.deliveryOption === "DELIVERY"
      ? "delivery"
      : ["PICKUP", "BOTH"].includes(product?.deliveryOption)
      ? "pickup"
      : null
  )
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState<string>("09:00")
  const [endTime, setEndTime] = useState<string>("09:00")
  const [allRents] = useQuery(getAllRentItems, undefined, {
    refetchInterval: 5000,
  })
  const [createRentMutation] = useMutation(createRent)
  const [barangays = []] = useQuery(getBarangays, null)

  const defaultUserAddress = useMemo(() => {
    return currentUser?.personalInfo
      ? [
          currentUser.personalInfo.street,
          currentUser.personalInfo.city,
          currentUser.personalInfo.province,
          currentUser.personalInfo.country,
          currentUser.personalInfo.zipCode,
        ]
          .filter(Boolean)
          .join(", ")
      : ""
  }, [currentUser])

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const minDate = useMemo(() => {
    const d = new Date()
    const currentHour = d.getHours()

    d.setHours(0, 0, 0, 0)

    // If it's past 5:00 PM (17:00), require 2 days notice.
    // Otherwise, allow next-day (1 day) notice.
    if (currentHour >= 17) {
      d.setDate(d.getDate() + 2)
    } else {
      d.setDate(d.getDate() + 1)
    }
    return d
  }, [])
  const minDateString = formatDate(minDate)

  const minEndDateString = useMemo(() => {
    if (!startDate) return minDateString
    const d = new Date(startDate)
    d.setDate(d.getDate() + 1)
    return formatDate(d)
  }, [startDate, minDateString])

  useEffect(() => {
    // When the pickup time changes, automatically update the return time to match.
    // This provides a sensible default for full-day (24-hour block) rentals.
    // The user can still manually adjust the return time for partial day rentals.
    setEndTime(startTime)
  }, [startTime])

  useEffect(() => {
    if (startDate) {
      updateAvailability(startDate, endDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime])

  const availabilityData = useMemo(() => {
    const intervals: Record<number, { start: number; end: number; qty: number }[]> = {}
    const damaged: Record<number, number> = {}

    if (allRents) {
      allRents.forEach((rent: any) => {
        const vid = rent.productVariantId
        if (!intervals[vid]) intervals[vid] = []
        if (!damaged[vid]) damaged[vid] = 0

        if (rent.returnedDamagedQty > 0) {
          damaged[vid] += rent.returnedDamagedQty
        }
        if (["accepted", "rendering", "on_hand", "overdue"].includes(rent.status)) {
          const rentStart = new Date(rent.startDate).getTime()
          const rentEnd = new Date(rent.endDate).getTime() + 3 * 60 * 60 * 1000 // 3 hours buffer
          intervals[vid].push({ start: rentStart, end: rentEnd, qty: rent.quantity })
        }
      })
    }
    return { intervals, damaged }
  }, [allRents])

  const availableStartTimes = useMemo(() => {
    if (!startDate) {
      return TIME_OPTIONS
    }

    let totalQty = 0
    let totalDamaged = 0
    let intervals: { start: number; end: number; qty: number }[] = []

    if (selectedVariant) {
      totalQty = selectedVariant.quantity || 0
      totalDamaged = availabilityData.damaged[selectedVariant.id] || 0
      intervals = availabilityData.intervals[selectedVariant.id] || []
    } else {
      totalQty = product?.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) || 0
      product?.variants?.forEach((v: any) => {
        totalDamaged += availabilityData.damaged[v.id] || 0
        intervals = intervals.concat(availabilityData.intervals[v.id] || [])
      })
    }
    totalQty -= totalDamaged

    if (totalQty <= 0) return []

    return TIME_OPTIONS.filter((option) => {
      const [h, m] = option.value.split(":").map(Number)
      const checkTime = new Date(startDate).setHours(h, m, 0, 0)

      const checkTimeEnd = checkTime + 24 * 60 * 60 * 1000
      let maxRentedInWindow = 0
      const windowIntervals = intervals.filter(
        (inv) => inv.start < checkTimeEnd && inv.end > checkTime
      )

      if (windowIntervals.length > 0) {
        const events: { time: number; type: "start" | "end"; qty: number }[] = []
        windowIntervals.forEach((inv) => {
          events.push({ time: Math.max(inv.start, checkTime), type: "start", qty: inv.qty })
          events.push({ time: Math.min(inv.end, checkTimeEnd), type: "end", qty: inv.qty })
        })
        events.sort((a, b) => (a.time === b.time ? (a.type === "end" ? -1 : 1) : a.time - b.time))

        let currentQty = 0
        events.forEach((ev) => {
          if (ev.type === "start") currentQty += ev.qty
          else currentQty -= ev.qty
          if (currentQty > maxRentedInWindow) maxRentedInWindow = currentQty
        })
      }

      const requiredQty = quantity > 0 ? quantity : 1
      return totalQty - maxRentedInWindow >= requiredQty
    })
  }, [startDate, selectedVariant, product, availabilityData, quantity])

  // If the selected start date causes the current start time to become invalid,
  // automatically select the first available time slot.
  useEffect(() => {
    if (
      startDate &&
      availableStartTimes.length > 0 &&
      !availableStartTimes.find((t) => t.value === startTime)
    ) {
      setStartTime(availableStartTimes[0].value)
    } else if (startDate && availableStartTimes.length === 0) {
      toast.error("No available pickup times on the selected start date.")
    }
  }, [startDate, availableStartTimes, startTime])

  const availableEndTimes = useMemo(() => {
    if (!endDate) {
      return TIME_OPTIONS
    }

    let totalQty = 0
    let totalDamaged = 0
    let intervals: { start: number; end: number; qty: number }[] = []

    if (selectedVariant) {
      totalQty = selectedVariant.quantity || 0
      totalDamaged = availabilityData.damaged[selectedVariant.id] || 0
      intervals = availabilityData.intervals[selectedVariant.id] || []
    } else {
      totalQty = product?.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) || 0
      product?.variants?.forEach((v: any) => {
        totalDamaged += availabilityData.damaged[v.id] || 0
        intervals = intervals.concat(availabilityData.intervals[v.id] || [])
      })
    }
    totalQty -= totalDamaged

    if (totalQty <= 0) return []

    return TIME_OPTIONS.filter((option) => {
      const [h, m] = option.value.split(":").map(Number)
      const checkTime = new Date(endDate).setHours(h, m, 0, 0)

      const rentedAtTime = intervals.reduce((acc, inv) => {
        if (checkTime >= inv.start && checkTime < inv.end) {
          return acc + inv.qty
        }
        return acc
      }, 0)

      const requiredQty = quantity > 0 ? quantity : 1
      const hasStock = totalQty - rentedAtTime >= requiredQty

      let isMinDurationMet = true
      if (startDate) {
        const finalStart = new Date(startDate)
        const [startH, startM] = startTime.split(":").map(Number)
        finalStart.setHours(startH, startM, 0, 0)

        const finalEnd = new Date(endDate)
        finalEnd.setHours(h, m, 0, 0)

        let diffMs = finalEnd.getTime() - finalStart.getTime()
        diffMs += (finalEnd.getTimezoneOffset() - finalStart.getTimezoneOffset()) * 60 * 1000

        if (diffMs < 24 * 60 * 60 * 1000) {
          isMinDurationMet = false
        }
      }

      return hasStock && isMinDurationMet
    })
  }, [endDate, startDate, startTime, selectedVariant, product, availabilityData, quantity])

  // If the selected end date causes the current end time to become invalid,
  // automatically select the first available time slot.
  useEffect(() => {
    if (
      endDate &&
      availableEndTimes.length > 0 &&
      !availableEndTimes.find((t) => t.value === endTime)
    ) {
      setEndTime(availableEndTimes[0].value)
    }
  }, [endDate, availableEndTimes, endTime])

  const uniqueColors = useMemo(() => {
    const colorsMap = new Map()
    product?.variants?.forEach((variant: any) => {
      const colorAttr = variant.attributes?.find(
        (attr: any) => attr.attributeValue?.attribute?.name === "Color"
      )
      if (colorAttr?.attributeValue) {
        colorsMap.set(colorAttr.attributeValue.id, colorAttr.attributeValue)
      }
    })
    return Array.from(colorsMap.values())
  }, [product])

  const nonColorAttributes = useMemo(() => {
    const attrsMap = new Map<string, Set<string>>()
    product?.variants?.forEach((variant: any) => {
      variant.attributes?.forEach((attr: any) => {
        const attrName = attr.attributeValue?.attribute?.name
        const attrValue = attr.attributeValue?.value

        if (attrName && attrName !== "Color" && attrValue) {
          if (!attrsMap.has(attrName)) {
            attrsMap.set(attrName, new Set<string>())
          }
          attrsMap.get(attrName)!.add(attrValue)
        }
      })
    })

    return Array.from(attrsMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }))
  }, [product])

  const hasVariants = uniqueColors.length > 0 || nonColorAttributes.length > 0

  const isOutOfStock = useMemo(() => {
    if (!product || !product.variants) return true
    let totalQty = 0
    let damaged = 0
    if (selectedVariant) {
      totalQty = selectedVariant.quantity || 0
      damaged = availabilityData.damaged[selectedVariant.id] || 0
    } else {
      totalQty = product.variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0)
      damaged = product.variants.reduce(
        (sum: number, v: any) => sum + (availabilityData.damaged[v.id] || 0),
        0
      )
    }
    return totalQty - damaged <= 0
  }, [product, selectedVariant, availabilityData])

  const nextAvailableDateInfo = useMemo(() => {
    if (isOutOfStock || !allRents) return null

    let totalQty = 0
    let totalDamaged = 0
    let intervals: { start: number; end: number; qty: number }[] = []

    if (selectedVariant) {
      totalQty = selectedVariant.quantity || 0
      totalDamaged = availabilityData.damaged[selectedVariant.id] || 0
      intervals = availabilityData.intervals[selectedVariant.id] || []
    } else {
      totalQty = product?.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) || 0
      product?.variants?.forEach((v: any) => {
        totalDamaged += availabilityData.damaged[v.id] || 0
        intervals = intervals.concat(availabilityData.intervals[v.id] || [])
      })
    }
    totalQty -= totalDamaged

    const checkDate = new Date(minDate)
    const TIME_OPTIONS = [9, 10, 11, 12, 13, 14, 15, 16, 17]

    // Look up to 365 days ahead to find the next open slot
    for (let i = 0; i < 365; i++) {
      let maxAvailableAtSlots = 0

      for (const hour of TIME_OPTIONS) {
        const checkTime = new Date(checkDate).setHours(hour, 0, 0, 0)
        let rentedAtTime = 0
        intervals.forEach((inv) => {
          if (checkTime >= inv.start && checkTime < inv.end) {
            rentedAtTime += inv.qty
          }
        })
        const available = totalQty - rentedAtTime
        if (available > maxAvailableAtSlots) maxAvailableAtSlots = available
      }

      if (maxAvailableAtSlots > 0) {
        return {
          date: new Date(checkDate),
          isLater: checkDate.getTime() > minDate.getTime(),
        }
      }
      checkDate.setDate(checkDate.getDate() + 1)
    }
    return null
  }, [selectedVariant, isOutOfStock, allRents, minDate, product, availabilityData])

  const rentalMetrics = useMemo(() => {
    if (!startDate || !endDate || !startTime || !endTime) return { days: 0, display: null }

    const finalStart = new Date(startDate)
    const [startH, startM] = startTime.split(":").map(Number)
    finalStart.setHours(startH, startM, 0, 0)

    const finalEnd = new Date(endDate)
    const [endH, endM] = endTime.split(":").map(Number)
    finalEnd.setHours(endH, endM, 0, 0)

    let diffMs = finalEnd.getTime() - finalStart.getTime()
    // Adjust for any local Daylight Saving Time offset differences
    diffMs += (finalEnd.getTimezoneOffset() - finalStart.getTimezoneOffset()) * 60 * 1000

    if (diffMs <= 0) return { days: 0, display: null }

    const totalHours = Math.round(diffMs / (1000 * 60 * 60))
    const d = Math.floor(totalHours / 24)
    const h = totalHours % 24
    const dayStr = d > 0 ? `${d} day${d > 1 ? "s" : ""}` : ""
    const hourStr = h > 0 ? `${h} hour${h > 1 ? "s" : ""}` : ""

    return {
      days: diffMs / (1000 * 60 * 60 * 24),
      display: d > 0 && h > 0 ? `${dayStr}, ${hourStr}` : d > 0 ? dayStr : h > 0 ? hourStr : null,
    }
  }, [startDate, endDate, startTime, endTime])

  const rentalBasePrice = selectedVariant
    ? selectedVariant.price * (rentalMetrics.days || 1) * quantity
    : 0
  const initialFee = rentalBasePrice * 0.5

  useEffect(() => {
    if (product && !hasVariants && product.variants?.length > 0) {
      setSelectedVariant(product.variants[0])
    }
  }, [product, hasVariants, setSelectedVariant])

  const findVariant = (colorId: number | null, attrs: Record<string, string>) => {
    return product?.variants?.find((variant: any) => {
      const variantColor = variant.attributes?.find(
        (a: any) => a.attributeValue?.attribute?.name === "Color"
      )?.attributeValue?.id

      const colorMatch = uniqueColors.length === 0 || variantColor === colorId
      if (!colorMatch) return false

      for (const attr of nonColorAttributes) {
        const variantAttrValue = variant.attributes?.find(
          (a: any) => a.attributeValue?.attribute?.name === attr.name
        )?.attributeValue?.value

        const selectedValue = attrs[attr.name]
        if (selectedValue && variantAttrValue !== selectedValue) {
          return false
        }
      }

      return true
    })
  }

  const updateSelectedVariant = (colorId: number | null, attrs: Record<string, string>) => {
    const isColorComplete = uniqueColors.length === 0 || colorId !== null
    const isAttrsComplete = nonColorAttributes.every((attr) => attrs[attr.name])

    let newVariant = null
    if (isColorComplete && isAttrsComplete) {
      newVariant = findVariant(colorId, attrs) || null
    }
    setSelectedVariant(newVariant)

    if (startDate) {
      const isValid = updateAvailability(startDate, endDate, newVariant)
      if (!isValid) {
        setStartDate(null)
        setEndDate(null)
      }
    } else {
      updateAvailability(null, null, newVariant)
    }
  }

  const handleChangeColor = (colorId: number) => {
    if (selectedColor === colorId) {
      setSelectedColor(null)
      setSelectedAttributes({})
      setQuantity(0)
      updateSelectedVariant(null, {})
      return
    }

    setSelectedColor(colorId)
    setSelectedAttributes({})
    setQuantity(0)
    updateSelectedVariant(colorId, {})
  }

  const handleChangeAttribute = (attrName: string, value: string) => {
    const newAttrs = { ...selectedAttributes }
    if (newAttrs[attrName] === value) delete newAttrs[attrName]
    else newAttrs[attrName] = value

    setQuantity(0)
    setSelectedAttributes(newAttrs)
    updateSelectedVariant(selectedColor, newAttrs)
  }

  const validateAndBuildDate = (date: Date, time: string, label: string) => {
    const { date: finalDate, h, m } = buildFinalDate(date, time)
    if (h < MIN_HOUR || h > MAX_HOUR || m !== 0) {
      toast.error(
        `${label} must be exactly on the hour between ${TIME_OPTIONS[0].label} and ${
          TIME_OPTIONS[TIME_OPTIONS.length - 1].label
        }`
      )
      return null
    }
    return finalDate
  }

  const checkVariantSelection = () => {
    if (uniqueColors.length > 0 && !selectedColor) {
      toast.error("Please select a color first")
      return false
    }
    for (const attr of nonColorAttributes) {
      if (!selectedAttributes[attr.name]) {
        toast.error(`Please select a ${attr.name.toLowerCase()} first`)
        return false
      }
    }
    return true
  }

  const handleCartAction = async () => {
    if (!currentUser) return toast.error("Please login first")
    if (!checkVariantSelection()) return
    if (!selectedVariant) return toast.error("Selected variant not found")
    if (!startDate || !endDate) return toast.error("Please select both start and end dates")
    if (quantity <= 0) return toast.error("Quantity must be greater than 0")
    if (!selectedDelivery) return toast.error("Please select a delivery method")
    if (!startTime || !endTime) return toast.error("Please select both pickup and return times")

    // Re-check availability right before adding to cart to prevent race conditions
    if (!updateAvailability(startDate, endDate) || quantity > availableQuantity) {
      toast.error(
        "The selected quantity is no longer available for these dates. Please adjust your selection."
      )
      return
    }

    const finalStartDate = validateAndBuildDate(startDate, startTime, "Pickup time")
    if (!finalStartDate) return

    const finalEndDate = validateAndBuildDate(endDate, endTime, "Return time")
    if (!finalEndDate) return

    let diffMs = finalEndDate.getTime() - finalStartDate.getTime()
    diffMs += (finalEndDate.getTimezoneOffset() - finalStartDate.getTimezoneOffset()) * 60 * 1000

    if (diffMs < 24 * 60 * 60 * 1000) {
      return toast.error(
        "Rental duration must be at least 1 day (24 hours). Please adjust your dates and times."
      )
    }

    const formData = {
      userId: currentUser.id,
      productId: product.id,
      quantity: quantity,
      deliveryMethod: String(selectedDelivery),
      variantId: selectedVariant.id,
      startDate: finalStartDate,
      endDate: finalEndDate,
    }

    try {
      await invoke(addToCart, formData)
      toast.success("Item added to cart successfully!")
      refetch()
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart. Please try again.")
    }
  }

  const handleRentNow = async () => {
    if (!currentUser) return toast.error("Please login first")
    if (!checkVariantSelection()) return
    if (!selectedVariant) return toast.error("Selected variant not found")
    if (!startDate || !endDate) return toast.error("Please select both start and end dates")
    if (quantity <= 0) return toast.error("Quantity must be greater than 0")
    if (!selectedDelivery) return toast.error("Please select a delivery method")
    if (!startTime || !endTime) return toast.error("Please select both pickup and return times")

    // Re-check availability right before checkout
    if (!updateAvailability(startDate, endDate) || quantity > availableQuantity) {
      toast.error(
        "The selected quantity is no longer available for these dates. Please adjust your selection."
      )
      return
    }

    const finalStartDate = validateAndBuildDate(startDate, startTime, "Pickup time")
    if (!finalStartDate) return

    const finalEndDate = validateAndBuildDate(endDate, endTime, "Return time")
    if (!finalEndDate) return

    let diffMs = finalEndDate.getTime() - finalStartDate.getTime()
    diffMs += (finalEndDate.getTimezoneOffset() - finalStartDate.getTimezoneOffset()) * 60 * 1000

    if (diffMs < 24 * 60 * 60 * 1000) {
      return toast.error(
        "Rental duration must be at least 1 day (24 hours). Please adjust your dates and times."
      )
    }

    setCheckoutModalOpen(true)
  }

  const confirmCheckout = async (deliveryAddress: string) => {
    if (!startDate || !endDate) return toast.error("Please select both start and end dates")
    const finalStartDate = validateAndBuildDate(startDate, startTime, "Pickup time")
    if (!finalStartDate) return

    const finalEndDate = validateAndBuildDate(endDate, endTime, "Return time")
    if (!finalEndDate) return

    const formData = {
      userId: currentUser.id,
      totalPrice: rentalBasePrice,
      securityDeposit: initialFee,
      status: "Pending",
      deliveryAddress,
      items: [
        {
          productVariantId: selectedVariant.id,
          price: selectedVariant.price,
          quantity: quantity,
          status: "pending",
          deliveryMethod: String(selectedDelivery),
          startDate: finalStartDate,
          endDate: finalEndDate,
        },
      ],
    }

    try {
      setIsCheckingOut(true)
      await createRentMutation(formData)
      toast.success("Rental order placed successfully!")
      refetch()
      setQuantity(0)
      setStartDate(null)
      setEndDate(null)
      setCheckoutModalOpen(false)
      router.push("/renter/orders")
    } catch (error: any) {
      console.error("Failed to checkout:", error)
      if (error.name === "ZodError") {
        toast.error(
          `Validation Error: ${error.issues?.[0]?.message || "Please check your inputs."}`
        )
      } else {
        toast.error(error.message || "Failed to place order. Please try again.")
      }
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handleCountMinus = () => {
    if (quantity <= 1) return toast.error("You cannot decrease the count below 1")
    setQuantity((prev) => prev - 1)
  }

  const handleCountPlus = () => {
    if (!startDate || !endDate)
      return toast.error("Please select a schedule first to check availability")
    if (quantity >= availableQuantity)
      return toast.error("You cannot increase the count above the available quantity")
    setQuantity((prev) => prev + 1)
  }

  const updateAvailability = (
    start: Date | null,
    end: Date | null,
    variantOverride?: any | null
  ) => {
    const activeVariant = variantOverride !== undefined ? variantOverride : selectedVariant

    let totalQty = 0
    let totalDamaged = 0
    let intervals: { start: number; end: number; qty: number }[] = []

    if (activeVariant) {
      totalQty = activeVariant.quantity || 0
      totalDamaged = availabilityData.damaged[activeVariant.id] || 0
      intervals = availabilityData.intervals[activeVariant.id] || []
    } else {
      totalQty = product?.variants?.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) || 0
      product?.variants?.forEach((v: any) => {
        totalDamaged += availabilityData.damaged[v.id] || 0
        intervals = intervals.concat(availabilityData.intervals[v.id] || [])
      })
    }

    totalQty -= totalDamaged

    let maxRented = 0

    if (start) {
      const { date: finalStart } = buildFinalDate(start, startTime)
      const { date: finalEnd } = buildFinalDate(end || start, endTime)
      let reqStart = finalStart.getTime()
      let reqEnd = finalEnd.getTime()

      if (reqEnd <= reqStart) {
        reqEnd = reqStart + 24 * 60 * 60 * 1000
      }

      const dayEvents: { time: number; type: "start" | "end"; qty: number }[] = []
      intervals.forEach((inv) => {
        if (inv.start < reqEnd && inv.end > reqStart) {
          dayEvents.push({ time: Math.max(inv.start, reqStart), type: "start", qty: inv.qty })
          dayEvents.push({ time: Math.min(inv.end, reqEnd), type: "end", qty: inv.qty })
        }
      })

      dayEvents.sort((a, b) => (a.time === b.time ? (a.type === "end" ? -1 : 1) : a.time - b.time))

      let currentQty = 0
      dayEvents.forEach((ev) => {
        if (ev.type === "start") currentQty += ev.qty
        else currentQty -= ev.qty
        if (currentQty > maxRented) maxRented = currentQty
      })
    }

    const available = totalQty - maxRented
    setAvailableQuantity(available)

    if (available <= 0 && start) {
      toast.error(
        activeVariant
          ? "Selected variant is completely booked for one or more of the selected dates"
          : "Item is completely booked for one or more of the selected dates"
      )
      return false
    }
    return true
  }

  const handleStartDateChange = (dateValue: string) => {
    setQuantity(0)

    const date = parseLocalDate(dateValue)
    if (!date) return

    if (date < minDate) {
      toast.error(
        new Date().getHours() >= 17
          ? "Orders after 5 PM require 2 days notice"
          : "Please select a date at least 1 day from today"
      )
      setStartDate(null)
    } else {
      let minAllowedEnd = new Date(date)
      minAllowedEnd.setDate(minAllowedEnd.getDate() + 1)
      minAllowedEnd.setHours(0, 0, 0, 0)

      if (endDate && endDate < minAllowedEnd) {
        setEndDate(null)
        if (updateAvailability(date, null)) setStartDate(date)
        else setStartDate(null)
      } else {
        if (updateAvailability(date, endDate)) setStartDate(date)
        else {
          setStartDate(null)
          setEndDate(null)
        }
      }
    }
  }

  // Dedicated handler for range selections from the calendar
  const handleDateRangeSelect = (startStr: string, endStr: string) => {
    setQuantity(0)

    const start = parseLocalDate(startStr)
    const end = parseLocalDate(endStr)
    if (!start || !end) return

    if (start < minDate) {
      toast.error(
        new Date().getHours() >= 17
          ? "Orders after 5 PM require 2 days notice"
          : "Please select a date at least 1 day from today"
      )
      setStartDate(null)
      setEndDate(null)
      return
    }

    if (updateAvailability(start, end)) {
      setStartDate(start)
      setEndDate(end)
    } else {
      setStartDate(null)
      setEndDate(null)
    }
  }

  const handleEndDateChange = (dateValue: string) => {
    const date = parseLocalDate(dateValue)
    if (!date) return

    if (date < minDate) {
      toast.error(
        new Date().getHours() >= 17
          ? "Orders after 5 PM require 2 days notice"
          : "Please select a date at least 1 day from today"
      )
      setEndDate(null)
    } else {
      if (updateAvailability(startDate, date)) setEndDate(date)
      else setEndDate(null)
    }
  }

  return (
    <>
      <div className="h-px w-full bg-gray-200" />

      {/* Price */}
      <div className="py-2">
        <div className="flex items-center gap-1.5 mb-1">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            {rentalMetrics.days > 0
              ? quantity > 0
                ? "Calculated Total Price"
                : "Total Price (1 item)"
              : "Base Daily Price"}
          </p>
          {rentalMetrics.days === 0 && (
            <Tooltip
              title="Price will adjust based on your selected variant, quantity, and rental dates."
              arrow
              placement="top"
            >
              <InfoOutlinedIcon
                sx={{ fontSize: 18 }}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-help animate-pulse hover:animate-none"
              />
            </Tooltip>
          )}
        </div>
        <p className="text-4xl font-bold text-[#1b2a80]">
          {selectedVariant
            ? `₱${(
                selectedVariant.price *
                (rentalMetrics.days || 1) *
                (quantity || 1)
              ).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : (() => {
                const prices = product.variants?.map((v: any) => v.price) || [0]
                const minPrice = Math.min(...prices)
                const maxPrice = Math.max(...prices)
                return minPrice === maxPrice
                  ? `₱${minPrice.toLocaleString()}`
                  : `₱${minPrice.toLocaleString()} - ₱${maxPrice.toLocaleString()}`
              })()}
        </p>
      </div>

      {/* Form & Options */}
      <div className="flex flex-col gap-6">
        {/* Product Options Card */}
        {hasVariants && (
          <ProductOptionsCard
            uniqueColors={uniqueColors}
            nonColorAttributes={nonColorAttributes}
            selectedColor={selectedColor}
            handleChangeColor={handleChangeColor}
            selectedAttributes={selectedAttributes}
            handleChangeAttribute={handleChangeAttribute}
            findVariant={findVariant}
          />
        )}

        {/* Availability Calendar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4 items-start w-full overflow-hidden">
          <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3 w-full">
            Availability Calendar
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            Check the calendar to see available dates and remaining stock before booking.
          </p>
          <div className="w-full">
            <CalendarEvent
              product={product}
              selectedVariant={selectedVariant}
              startDate={startDate}
              endDate={endDate}
              onDateClick={(dateStr) => {
                const date = new Date(dateStr)
                if (!startDate || (startDate && endDate)) {
                  handleStartDateChange(dateStr)
                  if (endDate) setEndDate(null)
                } else {
                  if (date <= startDate) {
                    handleStartDateChange(dateStr)
                  } else {
                    handleEndDateChange(dateStr)
                  }
                }
                document
                  .getElementById("rental-schedule-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
              onTimeClick={(timeValue, dateStr) => {
                if (formatDate(startDate) !== dateStr) {
                  handleStartDateChange(dateStr)
                  if (endDate) setEndDate(null)
                }
                setStartTime(timeValue)
                document
                  .getElementById("rental-schedule-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
              onDateSelect={(startStr, endStr) => {
                handleDateRangeSelect(startStr, endStr)
                document
                  .getElementById("rental-schedule-section")
                  ?.scrollIntoView({ behavior: "smooth" })
              }}
            />
          </div>
        </div>

        {/* Rental Schedule Card */}
        <div
          id="rental-schedule-section"
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-6 scroll-mt-24"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-900 text-lg">Rental Schedule</h3>
            {nextAvailableDateInfo?.isLater && (
              <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-200">
                Next available on{" "}
                {nextAvailableDateInfo.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-6">
            {/* Pickup */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Pickup Date & Time</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <TextField
                  type="date"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formatDate(startDate)}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  inputProps={{ min: minDateString }}
                  sx={TEXTFIELD_SX}
                />
                <TextField
                  select
                  variant="outlined"
                  size="small"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  sx={{ width: { xs: "100%", sm: "200px" }, ...TEXTFIELD_SX }}
                >
                  {TIME_OPTIONS.map((opt) => {
                    const isAvailable =
                      !startDate || availableStartTimes.some((t) => t.value === opt.value)
                    return (
                      <MenuItem key={opt.value} value={opt.value} disabled={!isAvailable}>
                        {opt.label} {!isAvailable ? "(Unavailable)" : ""}
                      </MenuItem>
                    )
                  })}
                </TextField>
              </div>
            </div>

            {/* Return */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Return Date & Time</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <TextField
                  type="date"
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={formatDate(endDate)}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  inputProps={{ min: minEndDateString }}
                  sx={TEXTFIELD_SX}
                />
                <TextField
                  select
                  variant="outlined"
                  size="small"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  sx={{ width: { xs: "100%", sm: "200px" }, ...TEXTFIELD_SX }}
                >
                  {TIME_OPTIONS.map((opt) => {
                    const isAvailable =
                      !endDate || availableEndTimes.some((t) => t.value === opt.value)
                    return (
                      <MenuItem key={opt.value} value={opt.value} disabled={!isAvailable}>
                        {opt.label} {!isAvailable ? "(Unavailable)" : ""}
                      </MenuItem>
                    )
                  })}
                </TextField>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-6">
          <h3 className="font-bold text-gray-900 text-lg border-b border-gray-100 pb-3">
            Order Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Quantity */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-semibold text-gray-700 mb-3">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden w-fit shadow-sm">
                  <button
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-lg"
                    disabled={quantity <= 1}
                    onClick={handleCountMinus}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    value={quantity}
                    readOnly
                    className="w-14 h-10 text-center font-bold text-gray-900 border-x border-gray-200 focus:outline-none appearance-none bg-white"
                  />
                  <button
                    className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors font-medium text-lg"
                    onClick={handleCountPlus}
                  >
                    +
                  </button>
                </div>
                {selectedVariant && startDate && (
                  <span className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-md border border-green-200/50">
                    {availableQuantity} available
                  </span>
                )}
              </div>
            </div>

            {/* Delivery Option */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Delivery Option</p>
              <div className="flex flex-wrap gap-3">
                {product.deliveryOption === "BOTH" ? (
                  <>
                    <button
                      onClick={() => setSelectedDelivery("delivery")}
                      className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg border font-medium text-sm transition-all ${
                        selectedDelivery === "delivery"
                          ? "border-[#1b2a80] bg-[#1b2a80] text-white shadow-md"
                          : "border-gray-200 text-gray-700 hover:border-[#1b2a80] hover:text-[#1b2a80] bg-gray-50 hover:bg-white"
                      }`}
                    >
                      Deliver
                    </button>
                    <button
                      onClick={() => setSelectedDelivery("pickup")}
                      className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg border font-medium text-sm transition-all ${
                        selectedDelivery === "pickup"
                          ? "border-[#1b2a80] bg-[#1b2a80] text-white shadow-md"
                          : "border-gray-200 text-gray-700 hover:border-[#1b2a80] hover:text-[#1b2a80] bg-gray-50 hover:bg-white"
                      }`}
                    >
                      Pickup
                    </button>
                  </>
                ) : product.deliveryOption === "DELIVERY" ? (
                  <span className="px-6 py-2.5 rounded-lg border border-[#1b2a80] bg-[#1b2a80] text-white font-medium text-sm shadow-md cursor-default w-full sm:w-auto text-center">
                    Deliver Only
                  </span>
                ) : (
                  <span className="px-6 py-2.5 rounded-lg border border-[#1b2a80] bg-[#1b2a80] text-white font-medium text-sm shadow-md cursor-default w-full sm:w-auto text-center">
                    Pickup Only
                  </span>
                )}
              </div>
            </div>

            {/* Rental Duration */}
            {rentalMetrics.display && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Rental Duration</p>
                <div className="flex items-center">
                  <span className="px-6 py-2.5 rounded-lg border border-[#1b2a80]/20 bg-[#1b2a80]/5 text-[#1b2a80] font-bold text-sm cursor-default w-full sm:w-auto text-center">
                    {rentalMetrics.display}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div
        className="flex flex-col sm:flex-row gap-4 mt-6 pt-6 border-t border-gray-200"
        style={{ display: currentUser ? "flex" : "none" }}
      >
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={() =>
            currentUser?.emailVerified
              ? handleCartAction()
              : toast.error("Please verify your email before adding to cart")
          }
          className={`flex-1 bg-white border-2 font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg ${
            isOutOfStock
              ? "border-gray-300 text-gray-400 opacity-60 cursor-not-allowed"
              : "border-[#1b2a80] text-[#1b2a80] hover:bg-slate-50 hover:shadow-md"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "Add to Cart"}
        </button>

        <button
          disabled={isOutOfStock}
          onClick={() =>
            currentUser?.emailVerified
              ? handleRentNow()
              : toast.error("Please verify your email before Renting")
          }
          className={`flex-1 font-bold py-4 px-6 rounded-xl transition-all duration-200 text-lg ${
            isOutOfStock
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-[#1b2a80] hover:bg-[#152266] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          }`}
        >
          {isOutOfStock ? "Out of Stock" : "Rent Now"}
        </button>
      </div>

      {/* Checkout Modal */}
      <BookingCheckoutModal
        open={checkoutModalOpen}
        onClose={() => !isCheckingOut && setCheckoutModalOpen(false)}
        onConfirm={confirmCheckout}
        isCheckingOut={isCheckingOut}
        product={product}
        selectedVariant={selectedVariant}
        selectedAttributes={selectedAttributes}
        quantity={quantity}
        rentalMetrics={rentalMetrics}
        rentalBasePrice={rentalBasePrice}
        initialFee={initialFee}
        selectedDelivery={selectedDelivery}
        defaultUserAddress={defaultUserAddress}
        barangays={barangays}
        startDate={startDate}
        endDate={endDate}
        startTime={startTime}
        endTime={endTime}
      />
    </>
  )
}
