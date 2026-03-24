"use client"
import Image from "next/image"
import React, { useEffect, useState } from "react"
import { Box, Button, TextField } from "@mui/material"
import getAllCartItem from "../queries/getAllCartItem"
import { useMutation, useQuery } from "@blitzjs/rpc"
import updateCartByVariantId from "../mutations/updateCartByVariantId"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import deleteCartItemById from "../mutations/deleteCartItemById"

//for radio buttons
import Radio from "@mui/material/Radio"
import RadioGroup from "@mui/material/RadioGroup"
import FormControlLabel from "@mui/material/FormControlLabel"
import FormControl from "@mui/material/FormControl"
import FormLabel from "@mui/material/FormLabel"
import getCurrentUser from "../users/queries/getCurrentUser"

//the mutation for creating rent
import createRent from "../mutations/createRent"
import { toast } from "sonner"

export default function DrawerCart(props: any) {
  const [loading, setLoading] = useState(false)

  const [createRentMutation] = useMutation(createRent)
  const [currentUser] = useQuery(getCurrentUser, null)
  const [deleteItem] = useMutation(deleteCartItemById)
  const [cartItems, { refetch }] = useQuery(getAllCartItem, null)
  const [updateCartItem] = useMutation(updateCartByVariantId)
  const [checkOutItems, setCheckOutItems] = useState<number[]>([])

  const [selectedDelivery, setSelectedDelivery] = React.useState("")
  const [deliveryMethods, setDeliveryMethods] = useState<Record<number, string>>({})

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const initialMethods = cartItems.reduce((acc: Record<number, string>, item) => {
        acc[item.variantId] = item.deliveryMethod
        return acc
      }, {} as Record<number, string>)
      setDeliveryMethods(initialMethods)
    }
  }, [cartItems])

  const [addressOption, setAddressOption] = useState("Home")
  const [selectedAddress, setSelectedAddress] = useState(
    `${currentUser?.personalInfo?.street}, ${currentUser?.personalInfo?.city}, ${currentUser?.personalInfo?.province}, ${currentUser?.personalInfo?.country}, ${currentUser?.personalInfo?.zipCode}`
  )

  const [totalPrice, setTotalPrice] = useState(0)

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
    const duration =
      item.startDate && item.endDate
        ? Math.ceil(
            (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0

    const itemPrice = item.quantity * item.variant.price * duration

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
      totalPrice: totalPrice, // Ensure totalPrice is valid
      status: "Pending",
      deliveryAddress,
      items,
    }

    console.log("FormData:", formData) // Debug: Check if formData is correct

    // Confirm checkout
    const confirmCheckout = window.confirm("Are you sure you want to proceed with the checkout?")
    if (!confirmCheckout) return
    setLoading(true) // Start loading
    // Perform mutation
    try {
      const rent = await createRentMutation(formData)
      console.log("Checkout successful:", rent)
      refetch() // Refresh cart items
      toast.success("Checkout successful!")
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error("Failed to checkout:", error)
      toast.error("Failed to checkout. Please try again.")
    }
  }

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure you want to delete this item?")
    if (!confirmDelete) return

    try {
      const item = await deleteItem({ id })
      console.log(item)
      refetch()
      toast.success("Item deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete item. Please try again.")
    }
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
        toast.error("Quantity cannot be less than 1.")
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
              return (
                <div className="flex flex-col justify-stretch " key={item.id}>
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={item.id}
                        onChange={(e) => checkboxChange(e, item)}
                        className="rounded-full border-2 border-white w-8 h-8 flex items-center justify-center"
                      />
                      <Image
                        src={
                          item.product.images[0]
                            ? `/uploads/products/${item.product.images[0].url}`
                            : "/placeholder.png"
                        }
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
                            ? new Intl.DateTimeFormat("en-US", {
                                month: "long",
                                day: "2-digit",
                                year: "numeric",
                              }).formatRange(new Date(item.startDate), new Date(item.endDate))
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
                      <p>
                        {item.startDate && item.endDate
                          ? Math.ceil(
                              (new Date(item.endDate).getTime() -
                                new Date(item.startDate).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : 0}{" "}
                        days
                      </p>
                      <p>=</p>
                      <p>
                        &#x20B1;
                        {(
                          item.quantity *
                          item.variant.price *
                          (item.startDate && item.endDate
                            ? Math.ceil(
                                (new Date(item.endDate).getTime() -
                                  new Date(item.startDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            : 0)
                        ).toLocaleString("en-US")}
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
          <div className="px-8 text-white flex flex-row justify-end items-center gap-4">
            <p>
              {checkOutItems.length} {checkOutItems.length > 1 ? "items" : "item"}
            </p>
            <p>
              grand total: &#x20B1;
              {totalPrice.toLocaleString("en-US")}
            </p>
          </div>
        )}

        {cartItems?.[0]?.user?.personalInfo && (
          <div className="flex justify-center w-full bg-slate-600">
            <div className="text-white w-full p-4 ">
              <div className="mx-auto w-full text-center text-md flex justify-center">
                <label>Strictly Cash on Delivery or Pick-up</label>
              </div>
              <div className="mx-auto border-b border-slate-500 w-full text-center text-lg font-bold flex justify-center">
                <label>Address for items that is for Delivery</label>
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
    </>
  )
}
