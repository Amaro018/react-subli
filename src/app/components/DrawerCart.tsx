"use client"
import Image from "next/image"
import React, { useEffect, useState, useMemo } from "react"
import {
  Box,
  Button,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"
import getAllCartItem from "../queries/getAllCartItem"
import { useMutation, useQuery } from "@blitzjs/rpc"
import updateCartByVariantId from "../mutations/updateCartByVariantId"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import deleteCartItemById from "../mutations/deleteCartItemById"

//for radio buttons
import getAllRentItems from "../queries/getAllRentItems"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import FormLabel from "@mui/material/FormLabel"
import getCurrentUser from "../users/queries/getCurrentUser"

//the mutation for creating rent
import createRent from "../mutations/createRent"
import { toast } from "@/src/app/utils/toast"

// Helper function to calculate rental duration in fractional days for accurate pricing
const getRentalDurationInDays = (
  startDate: string | Date | null,
  endDate: string | Date | null
): number => {
  if (!startDate || !endDate) {
    return 0
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  let diffMs = end.getTime() - start.getTime()
  if (diffMs <= 0) {
    return 0
  }

  // Adjust for any local Daylight Saving Time offset differences
  const offsetDiff = end.getTimezoneOffset() - start.getTimezoneOffset()
  diffMs += offsetDiff * 60 * 1000

  const totalHours = diffMs / (1000 * 60 * 60)
  const totalDays = totalHours / 24

  return totalDays
}

// Helper function to format rental duration for display
const formatRentalDuration = (
  startDate: string | Date | null,
  endDate: string | Date | null
): string => {
  const totalDays = getRentalDurationInDays(startDate, endDate)
  if (totalDays <= 0) return "0 days"

  const totalHours = Math.round(totalDays * 24)
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24

  const dayStr = days > 0 ? `${days} day${days > 1 ? "s" : ""}` : ""
  const hourStr = hours > 0 ? `${hours} hour${hours > 1 ? "s" : ""}` : ""

  if (days > 0 && hours > 0) return `${dayStr}, ${hourStr}`
  if (days > 0) return dayStr
  return hourStr
}

function getAvailableStock(
  item: any,
  intervals: { start: number; end: number; qty: number }[],
  totalDamaged: number
) {
  if (!item.startDate || !item.endDate) return item.variant.quantity
  if (!intervals.length) return Math.max(0, item.variant.quantity - totalDamaged)

  let reqStart = new Date(item.startDate).getTime()
  let reqEnd = new Date(item.endDate).getTime()

  if (reqEnd <= reqStart) {
    reqEnd = reqStart + 24 * 60 * 60 * 1000
  }

  const events: { time: number; type: "start" | "end"; qty: number }[] = []
  intervals.forEach((inv) => {
    if (inv.start < reqEnd && inv.end > reqStart) {
      events.push({ time: Math.max(inv.start, reqStart), type: "start", qty: inv.qty })
      events.push({ time: Math.min(inv.end, reqEnd), type: "end", qty: inv.qty })
    }
  })

  events.sort((a, b) => (a.time === b.time ? (a.type === "end" ? -1 : 1) : a.time - b.time))
  let currentQty = 0
  let maxRented = 0
  events.forEach((ev) => {
    if (ev.type === "start") currentQty += ev.qty
    else currentQty -= ev.qty
    if (currentQty > maxRented) maxRented = currentQty
  })

  return Math.max(0, item.variant.quantity - totalDamaged - maxRented)
}

export default function DrawerCart(props: any) {
  const [loading, setLoading] = useState(false)

  const [createRentMutation] = useMutation(createRent)
  const [currentUser] = useQuery(getCurrentUser, null)
  const [deleteItem] = useMutation(deleteCartItemById)
  const [cartItems, { refetch }] = useQuery(getAllCartItem, null)
  const [updateCartItem] = useMutation(updateCartByVariantId)
  const [allRents] = useQuery(getAllRentItems, undefined, {
    refetchInterval: 5000,
  })
  const [checkOutItems, setCheckOutItems] = useState<number[]>([])

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState("")
  const [confirmAction, setConfirmAction] = useState<(() => Promise<void>) | null>(null)

  const handleConfirmClose = () => {
    setConfirmOpen(false)
  }

  const handleConfirmAccept = async () => {
    if (confirmAction) {
      await confirmAction()
    }
    setConfirmOpen(false)
  }

  const [selectedDelivery, setSelectedDelivery] = React.useState("")
  const [deliveryMethods, setDeliveryMethods] = useState<Record<number, string>>({})

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
          const rentEnd = new Date(rent.endDate).getTime() + 3 * 60 * 60 * 1000
          intervals[vid].push({ start: rentStart, end: rentEnd, qty: rent.quantity })
        }
      })
    }
    return { intervals, damaged }
  }, [allRents])

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const initialMethods = cartItems.reduce((acc: Record<number, string>, item) => {
        acc[item.variantId] = item.deliveryMethod
        return acc
      }, {} as Record<number, string>)
      setDeliveryMethods(initialMethods)
    }
  }, [cartItems])

  useEffect(() => {
    // When availability changes (e.g. another user books an item),
    // automatically uncheck any items in the cart that are no longer available.
    if (!cartItems || !allRents) return

    setCheckOutItems((currentCheckedIds) => {
      if (currentCheckedIds.length === 0) return currentCheckedIds

      let priceReduction = 0
      const unavailableCheckedItemIds: number[] = []

      currentCheckedIds.forEach((itemId) => {
        const item = cartItems.find((i) => i.id === itemId)
        if (!item || !item.startDate || !item.endDate) return

        const availableStock = getAvailableStock(
          item,
          availabilityData.intervals[item.variantId] || [],
          availabilityData.damaged[item.variantId] || 0
        )
        if (item.quantity > availableStock) {
          unavailableCheckedItemIds.push(item.id)
          const durationInDays = getRentalDurationInDays(item.startDate, item.endDate)
          priceReduction += item.quantity * item.variant.price * durationInDays
        }
      })

      if (unavailableCheckedItemIds.length > 0) {
        setTotalPrice((prev) => prev - priceReduction)
        return currentCheckedIds.filter((id) => !unavailableCheckedItemIds.includes(id))
      }

      return currentCheckedIds
    })
  }, [cartItems, allRents, availabilityData])

  const [addressOption, setAddressOption] = useState("Home")
  const [selectedAddress, setSelectedAddress] = useState(
    `${currentUser?.personalInfo?.street}, ${currentUser?.personalInfo?.city}, ${currentUser?.personalInfo?.province}, ${currentUser?.personalInfo?.country}, ${currentUser?.personalInfo?.zipCode}`
  )

  const [totalPrice, setTotalPrice] = useState(0)

  const rentalBasePrice = totalPrice
  const initialFee = rentalBasePrice * 0.5
  const grandTotal = rentalBasePrice

  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    region: "",
    country: "",
    zipCode: "",
  })

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAddress((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const checkboxChange = (e: any, item: any) => {
    console.log("ito deliver method mo:", deliveryMethods)
    const checked = e.target.checked

    // Calculate item price based on quantity, price, and duration
    const durationInDays = getRentalDurationInDays(item.startDate, item.endDate)

    const itemPrice = item.quantity * item.variant.price * durationInDays

    if (checked) {
      // Add to checkout items and update the total price
      setCheckOutItems((prev) => [...prev, item.id])
      setTotalPrice((prevTotal) => prevTotal + itemPrice)
    } else {
      // Remove from checkout items and update the total price
      setCheckOutItems((prev) => prev.filter((id) => id !== item.id))
      setTotalPrice((prevTotal) => prevTotal - itemPrice)
    }
  }

  const handleCheckOut = async () => {
    if (!currentUser) {
      toast.error("Please log in to checkout.")
      return
    }

    if (checkOutItems.length === 0) {
      toast.error("Please select at least one item to checkout.")
      return
    }

    // Availability Check
    if (allRents) {
      for (const itemId of checkOutItems) {
        const item = cartItems?.find((i) => i.id === itemId)
        if (!item || !item.startDate || !item.endDate) continue

        // Create a combined list of rental intervals for validation.
        // This includes existing rentals from the database, plus other items in the cart.
        const dbIntervals = availabilityData.intervals[item.variantId] || []

        const otherCartItemIntervals = checkOutItems
          .filter((id) => id !== itemId) // Exclude the current item
          .map((id) => cartItems?.find((i) => i.id === id))
          .filter(
            (otherItem) =>
              otherItem &&
              otherItem.variantId === item.variantId &&
              otherItem.startDate &&
              otherItem.endDate
          )
          .map((otherItem) => {
            const rentStart = new Date(otherItem!.startDate!).getTime()
            const rentEnd = new Date(otherItem!.endDate!).getTime() + 3 * 60 * 60 * 1000
            return { start: rentStart, end: rentEnd, qty: otherItem!.quantity }
          })

        const combinedIntervals = [...dbIntervals, ...otherCartItemIntervals]

        const availableStock = getAvailableStock(
          item,
          combinedIntervals,
          availabilityData.damaged[item.variantId] || 0
        )
        if (item.quantity > availableStock) {
          toast.error(
            `"${item.product.name}" has a scheduling conflict with other items in your cart or new rentals. Please review your cart.`
          )
          return
        }
      }
    }

    let deliveryAddress = ""

    // Validate and set the delivery address
    if (addressOption === "Home") {
      if (!selectedAddress) {
        toast.error("Please select a delivery address.")
        return
      }
      deliveryAddress = selectedAddress
    } else if (addressOption === "New") {
      if (
        !newAddress.street ||
        !newAddress.city ||
        !newAddress.region ||
        !newAddress.country ||
        !newAddress.zipCode
      ) {
        toast.error("Please fill out all address fields.")
        return
      }
      deliveryAddress = [
        newAddress.street,
        newAddress.city,
        newAddress.region,
        newAddress.country,
        newAddress.zipCode,
      ].join(", ")
    } else {
      toast.error("Please select a valid delivery address option.")
      return
    }

    // Map items for the mutation payload
    const items = checkOutItems.map((id) => {
      const item = cartItems?.find((item) => item.id === id)
      if (!item) {
        throw new Error("Cart item not found.")
      }
      if (!item.startDate || !item.endDate) {
        throw new Error("Start date or end date is missing for item.")
      }

      return {
        productVariantId: item.variantId,
        price: item.variant.price,
        quantity: item.quantity,
        status: "pending",
        deliveryMethod: deliveryMethods[item.variantId],
        startDate: item.startDate,
        endDate: item.endDate,
      }
    })

    console.log("Items for checkout:", items)

    // Construct formData
    const formData = {
      userId: currentUser.id, // Ensure userId is valid
      totalPrice: grandTotal, // Ensure totalPrice is valid
      securityDeposit: initialFee, // Keep the key as securityDeposit for the backend, but pass initialFee
      status: "Pending",
      cartItemIds: checkOutItems,
      deliveryAddress,
      items,
    }

    console.log("FormData:", formData) // Debug: Check if formData is correct

    // Confirm checkout
    setConfirmMessage("Are you sure you want to proceed with the checkout?")
    setConfirmAction(() => async () => {
      setLoading(true) // Start loading
      // Perform mutation
      try {
        const rent = await createRentMutation(formData)
        console.log("Checkout successful:", rent)
        refetch() // Refresh cart items
        toast.success("Checkout successful!")
        setLoading(false)
      } catch (error: any) {
        setLoading(false)
        console.error("Failed to checkout:", error)
        if (error.name === "ZodError") {
          toast.error(
            `Validation Error: ${error.issues?.[0]?.message || "Please check your inputs."}`
          )
        } else {
          toast.error(error.message || "Failed to checkout. Please try again.")
        }
      }
    })
    setConfirmOpen(true)
  }

  const handleDelete = async (id: number) => {
    setConfirmMessage("Are you sure you want to delete this item?")
    setConfirmAction(() => async () => {
      try {
        const item = await deleteItem({ id })
        console.log(item)
        refetch()
        toast.success("Item deleted successfully!")
      } catch (error) {
        toast.error("Failed to delete item. Please try again.")
      }
    })
    setConfirmOpen(true)
  }

  const updateCartItemDetails = async (
    variantId: number,
    updates: { newQuantity?: number; deliveryMethod?: string }
  ) => {
    const cartItem = cartItems?.find((item) => item.variantId === variantId)
    if (!cartItem) {
      toast.error("Cart item not found.")
      return
    }

    const { newQuantity, deliveryMethod } = updates

    if (newQuantity !== undefined) {
      if (newQuantity > cartItem.variant.quantity) {
        toast.error("You cannot add more than the available quantity.")
        return
      } else if (newQuantity < 1) {
        handleDelete(cartItem.id)
        return
      }
    }

    // Only update deliveryMethods state if deliveryMethod is provided
    if (deliveryMethod !== undefined) {
      setDeliveryMethods((prev) => ({
        ...prev,
        [variantId]: deliveryMethod,
      }))
    }

    try {
      await updateCartItem({
        variantId,
        quantity: newQuantity !== undefined ? newQuantity : cartItem.quantity,
        deliveryMethod:
          deliveryMethod !== undefined
            ? deliveryMethod
            : deliveryMethods[variantId] || cartItem.deliveryMethod,
        startDate: cartItem.startDate || undefined,
        endDate: cartItem.endDate || undefined,
      })
      refetch()
    } catch (error) {
      toast.error("Failed to update cart item. Please try again.")
    }
  }

  return (
    <>
      <Box
        sx={{
          width: 500,
          height: "100vh",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
          },
        }}
        role="presentation"
        className="bg-slate-600 overflow-y-auto scrollbar-seamless"
      >
        <div className="p-8 text-white flex flex-col gap-2 w-full">
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((item) => {
              const variantDisplay = item.variant.attributes
                .map((attr: any) => attr.attributeValue.value)
                .join(" / ")
              const variantAttrIds = item.variant.attributes.map(
                (a: any) => a.attributeValueId || a.attributeValue?.id
              )
              const variantImage = item.product.images?.find(
                (img: any) => img.attributeValueId && variantAttrIds.includes(img.attributeValueId)
              )

              const thumbnail =
                variantImage ||
                item.product.images?.find((img: any) => img.isThumbnail) ||
                item.product.images?.[0]
              const durationInDays = getRentalDurationInDays(item.startDate, item.endDate)
              const durationDisplay = formatRentalDuration(item.startDate, item.endDate)
              const itemSubtotal = item.quantity * item.variant.price * durationInDays

              // Compute availability live inside the cart item map
              let isAvailable = true
              let availableStock = item.variant.quantity
              if (allRents && item.startDate && item.endDate) {
                availableStock = getAvailableStock(
                  item,
                  availabilityData.intervals[item.variantId] || [],
                  availabilityData.damaged[item.variantId] || 0
                )
                if (item.quantity > availableStock) {
                  isAvailable = false
                }
              }

              return (
                <div
                  className={`flex flex-col justify-stretch p-3 mb-4 rounded-xl transition-colors ${
                    !isAvailable
                      ? "border-2 border-red-500 bg-red-900 bg-opacity-20"
                      : "border border-transparent bg-transparent"
                  }`}
                  key={item.id}
                >
                  {!isAvailable && (
                    <div className="flex items-center gap-2 text-red-400 mb-3 text-sm font-bold">
                      <ErrorOutlineIcon fontSize="small" />
                      <p>
                        {availableStock > 0
                          ? `Only ${availableStock} left for these dates. Please reduce quantity.`
                          : "No longer available for these dates."}
                      </p>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={item.id}
                        checked={checkOutItems.includes(item.id)}
                        disabled={!isAvailable}
                        onChange={(e) => checkboxChange(e, item)}
                        className="rounded-full border-2 border-white w-8 h-8 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <Image
                        src={thumbnail ? `/uploads/products/${thumbnail.url}` : "/placeholder.png"}
                        alt={item.product.name}
                        width={100}
                        height={100}
                        className="w-32 h-32 object-cover"
                      />
                      <div className="text-sm w-full">
                        <div className="flex justify-between items-center">
                          <p className="underline">{item.product.shop.shopName}</p>

                          <button onClick={() => handleDelete(item.id)}>
                            <DeleteForeverIcon className="text-white" />
                          </button>
                        </div>
                        <p className="text-white">{item.product.name}</p>
                        <p className="text-gray-400">Variant: {variantDisplay || "Default"}</p>
                        <p className="text-sm">
                          {item.startDate && item.endDate
                            ? `${new Intl.DateTimeFormat("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              }).format(new Date(item.startDate))} - ${new Intl.DateTimeFormat(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              ).format(new Date(item.endDate))}`
                            : "Dates not set"}
                        </p>

                        <div className="flex flex-col gap-2 mt-4">
                          {item.product.deliveryOption === "BOTH" ? (
                            <select
                              className="bg-transparent border-2 border-white rounded-lg p-2 text-white"
                              value={deliveryMethods[item.variantId] || item.deliveryMethod}
                              onChange={(e) =>
                                updateCartItemDetails(item.variantId, {
                                  deliveryMethod: e.target.value,
                                })
                              }
                            >
                              <option value="pickup" className="text-slate-600 bg-transparent">
                                PICKUP
                              </option>
                              <option value="deliver" className="text-slate-600 bg-transparent">
                                DELIVER
                              </option>
                            </select>
                          ) : item.product.deliveryOption === "PICKUP" ? (
                            <p>PICKUP ONLY</p>
                          ) : (
                            <p>DELIVER ONLY</p>
                          )}
                        </div>

                        <div className="flex my-2 py-2 justify-end">
                          <button
                            className="mx-2 text-slate-600 bg-slate-400 px-2 rounded-lg hover:bg-slate-500 shadow-lg"
                            onClick={() =>
                              updateCartItemDetails(item.variantId, {
                                newQuantity: item.quantity - 1,
                              })
                            }
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            className="w-12 text-center text-slate-600"
                            onChange={(e) =>
                              updateCartItemDetails(item.variantId, {
                                newQuantity: parseInt(e.target.value),
                              })
                            }
                          />
                          <button
                            className="mx-2 text-slate-600 bg-slate-400 px-2 rounded-lg hover:bg-slate-500 shadow-lg"
                            onClick={() =>
                              updateCartItemDetails(item.variantId, {
                                newQuantity: item.quantity + 1,
                              })
                            }
                          >
                            +
                          </button>
                          <p className="mx-2">*</p>
                          <p>&#x20B1;{item.variant.price}</p>
                        </div>
                      </div>
                    </div>

                    {/* grand total computation  */}
                    <div className="flex text-right gap-4 justify-end items-center border-b border-slate-500 w-full">
                      <p>&#x20B1;{item.quantity * item.variant.price}</p>
                      <p>x</p>
                      <p>{durationDisplay}</p>
                      <p>=</p>
                      <p>
                        &#x20B1;
                        {itemSubtotal.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    {/* grand total computation  */}
                  </div>
                </div>
              )
            })
          ) : (
            <p className="text-center font-bold flex justify-center items-center">
              No items in cart
            </p>
          )}
        </div>
        {cartItems && cartItems.length > 0 && (
          <div className="px-8 w-full mb-6 mt-4">
            {/* Order Summary Card */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4 text-gray-900">
              <h3 className="font-bold text-gray-900 text-lg border-b border-gray-200 pb-3">
                Order Summary ({checkOutItems.length}{" "}
                {checkOutItems.length === 1 ? "item" : "items"})
              </h3>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-gray-700">
                  <span>Total Rental Fee</span>
                  <span className="font-medium">
                    ₱{rentalBasePrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-700">
                  <div className="flex items-center gap-1.5">
                    <span>Initial Fee (50%)</span>
                    <Tooltip
                      title="An initial payment of 50% of the total rental fee is required upon delivery or pickup."
                      arrow
                      placement="top"
                    >
                      <InfoOutlinedIcon
                        sx={{ fontSize: 16 }}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-help"
                      />
                    </Tooltip>
                  </div>
                  <span className="font-medium text-orange-600">
                    ₱{initialFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-px w-full bg-gray-200 my-1" />
                <div className="flex justify-between items-center text-gray-900">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="font-bold text-xl text-[#1b2a80]">
                    ₱{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="mt-1 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm flex gap-2 items-start border border-blue-100">
                  <InfoOutlinedIcon sx={{ fontSize: 20 }} className="shrink-0 mt-0.5" />
                  <p>
                    <strong>Note:</strong> The Initial Fee of{" "}
                    <strong>
                      ₱{initialFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </strong>{" "}
                    must be paid upon delivery or pickup.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {cartItems?.[0]?.user?.personalInfo && (
          <div className="flex justify-center w-full bg-slate-600">
            <div className="text-white w-full p-4 ">
              <div className="mx-auto w-full text-center text-md flex justify-center">
                <p>Strictly Cash on Delivery or Pick-up</p>
              </div>
              <div className="mx-auto border-b border-slate-500 w-full text-center text-lg font-bold flex justify-center">
                <p>Address for items that is for Delivery</p>
              </div>

              <RadioGroup
                value={addressOption} // Pass the selected value
                name="radio-buttons-group"
                className="p-4"
              >
                <FormControlLabel
                  value="Home"
                  control={<Radio />}
                  label="Deliver to Home Address"
                  onClick={() => setAddressOption("Home")}
                />
                {addressOption === "Home" && (
                  <p className="ml-6">
                    {cartItems?.[0]?.user?.personalInfo?.street},{" "}
                    {cartItems?.[0]?.user?.personalInfo?.city},{" "}
                    {cartItems?.[0]?.user?.personalInfo?.province},{" "}
                    {cartItems?.[0]?.user?.personalInfo?.country},{" "}
                    {cartItems?.[0]?.user?.personalInfo?.zipCode}
                  </p>
                )}

                <FormControlLabel
                  value="New"
                  control={<Radio />}
                  label="Use a Different Address"
                  onClick={() => setAddressOption("New")}
                />
              </RadioGroup>
              {addressOption === "New" && (
                <div>
                  <TextField
                    name="street"
                    label="Street"
                    value={newAddress.street}
                    onChange={handleNewAddressChange}
                    fullWidth
                    margin="normal"
                    required
                    InputLabelProps={{ style: { color: "white" } }}
                    InputProps={{ style: { color: "white" } }}
                  />
                  <TextField
                    name="city"
                    label="City"
                    value={newAddress.city}
                    onChange={handleNewAddressChange}
                    fullWidth
                    margin="normal"
                    required
                    InputLabelProps={{ style: { color: "white" } }}
                    InputProps={{ style: { color: "white" } }}
                  />
                  <TextField
                    name="region"
                    label="Region"
                    value={newAddress.region}
                    onChange={handleNewAddressChange}
                    fullWidth
                    margin="normal"
                    required
                    InputLabelProps={{ style: { color: "white" } }}
                    InputProps={{ style: { color: "white" } }}
                  />
                  <TextField
                    name="country"
                    label="Country"
                    value={newAddress.country}
                    onChange={handleNewAddressChange}
                    fullWidth
                    margin="normal"
                    required
                    InputLabelProps={{ style: { color: "white" } }}
                    InputProps={{ style: { color: "white" } }}
                  />
                  <TextField
                    name="zipCode"
                    label="Zip Code"
                    value={newAddress.zipCode}
                    onChange={handleNewAddressChange}
                    fullWidth
                    margin="normal"
                    required
                    InputLabelProps={{ style: { color: "white" } }}
                    InputProps={{ style: { color: "white" } }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {cartItems && cartItems.length > 0 && (
          <div className="p-4 flex justify-center w-full bg-slate-600">
            <button
              className="bg-white hover:bg-gray-300 font-bold py-2 px-4 rounded w-full text-slate-600"
              onClick={handleCheckOut}
              disabled={loading}
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          </div>
        )}
      </Box>

      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Confirm</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAccept}
            color="primary"
            variant="contained"
            disableElevation
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
