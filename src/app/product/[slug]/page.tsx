"use client"
import { invoke, useQuery } from "@blitzjs/rpc"
import getProductById from "../../queries/getProductById" // You'll need a query to fetch product details
import ProductCarousel from "../../components/ProductCarousel"
import Image from "next/image"

import GetTheNavBar from "../../components/GetTheNavBar"
import React, { useEffect, useState } from "react"
import { set } from "zod"
import ProductSchedule from "../../components/ProductSchedule"
import { DateRangePicker } from "@nextui-org/date-picker"
import { q } from "@blitzjs/auth/dist/index-0ecbee46"
import getUser from "@/src/app/utils/getUser"
import Navbar from "@/src/app/components/Navbar"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import Button from "@mui/material/Button"

import addToCart from "../../mutations/addToCart"
import CheckOutDrawer from "../../components/CheckOutDrawer"

import getAllCartItem from "../../queries/getAllCartItem"
import CalendarEvent from "../../components/CalendarEvent"
import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Rating,
  TextField,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import DrawerCart from "../../components/DrawerCart"

import getAllRentItems from "../../queries/getAllRentItems"
import { start } from "repl"

const ProductPage = ({ params }: any) => {
  const [currentUser, setCurrentUser] = useState<any>(null)

  const getCurrentUser = async () => {
    const user = await getUser()
    setCurrentUser(user)
  }
  useEffect(() => {
    getCurrentUser()
  }, [])

  const { slug } = params
  //   const  id  = params.params.slug;
  const id = slug

  const [product, { refetch }] = useQuery(getProductById, { id: Number(id) })
  const [cartItems] = useQuery(getAllCartItem, {})

  const [selectedVariant, setSelectedVariant] = React.useState<number | null>(null)

  const [selectedColor, setSelectedColor] = React.useState<number | null>(null)
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null)
  const [quantity, setQuantity] = React.useState(0)
  const [availableQuantity, setAvailableQuantity] = React.useState(0)
  const [selectedDelivery, setSelectedDelivery] = React.useState(
    product?.deliveryOption === "DELIVERY"
      ? "delivery"
      : product?.deliveryOption === "PICKUP"
      ? "pickup"
      : product?.deliveryOption === "BOTH"
      ? "pickup"
      : null
  )

  console.log("the delivery system is :", selectedDelivery)

  // console.log("the delivery system is :", selectedDelivery)
  const [open, setOpen] = React.useState(false)

  const toggleDrawer = (state: boolean) => () => {
    setOpen(state) // Properly handle the state update
    // console.log("testing")
  }
  const handleChangeColor = (colorId: number) => {
    setSelectedColor(colorId)
    setStartDate(null)
    setEndDate(null)
    setSelectedSize(null) // Reset size when changing color
    setQuantity(0) // Reset quantity
    updateSelectedVariant(colorId, selectedSize) // Update selectedVariant
  }

  const handleChangeSize = (size: string) => {
    setSelectedSize(size)
    updateSelectedVariant(selectedColor, size) // Update selectedVariant
  }

  const updateSelectedVariant = (colorId: number | null, size: string | null) => {
    if (colorId !== null && size !== null) {
      const variant = product.variants.find(
        (variant) => variant.color.id === colorId && variant.size === size
      )
      setSelectedVariant(variant || null) // Update the selected variant
    } else {
      setSelectedVariant(null) // Reset if either is null
    }
  }

  const handleClickCart = async () => {
    if (!currentUser) {
      alert("please login first")
      return
    }
    // Ensure color and size are selected
    if (!selectedColor || !selectedSize) {
      alert("Please select a color and size")
      return
    }

    // Find the selected variant based on the color and size
    const selectedVariant = product.variants.find(
      (variant) => variant.color.id === selectedColor && variant.size === selectedSize
    )

    if (!selectedVariant) {
      alert("Selected variant not found")
      return
    }

    // Ensure start and end dates are selected and valid
    if (!startDate || !endDate) {
      alert("Please select both start and end dates")
      return
    }

    if (endDate <= startDate) {
      alert("End date must be after the start date")
      return
    }

    // Create formData with all the necessary details
    const formData = {
      userId: currentUser.id,
      productId: Number(id),
      quantity: quantity,
      deliveryMethod: String(selectedDelivery),
      variantId: selectedVariant.id, // Directly use the selected variant ID
      startDate: startDate,
      endDate: endDate,
    }

    // console.log("Form Data:", formData)

    try {
      await invoke(addToCart, formData)
      alert("Successfully added to cart")
      refetch()
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Error adding to cart")
    }
    // Perform your action here, like calling an API or adding to the cart
    // For example: invoke(addToCart, formData);
  }

  const handleClickRent = async () => {
    if (!currentUser) {
      alert("please login first")
      return
    }

    // Ensure color and size are selected
    if (!selectedColor || !selectedSize) {
      alert("Please select a color and size")
      return
    }

    // Find the selected variant based on the color and size
    const selectedVariant = product.variants.find(
      (variant) => variant.color.id === selectedColor && variant.size === selectedSize
    )

    if (!selectedVariant) {
      alert("Selected variant not found")
      return
    }

    // Ensure start and end dates are selected and valid
    if (!startDate || !endDate) {
      alert("Please select both start and end dates")
      return
    }

    if (endDate <= startDate) {
      alert("End date must be after the start date")
      return
    }

    if (quantity <= 0) {
      alert("Quantity must be greater than 0")
      return
    }

    if (!selectedDelivery === null) {
      alert("Please select a delivery method")
      return
    } else {
      setOpen(true)
      // Create formData with all the necessary details
      const formData = {
        userId: currentUser.id,
        productId: Number(id),
        quantity: quantity,
        deliveryMethod: String(selectedDelivery),
        variantId: selectedVariant.id, // Directly use the selected variant ID
        startDate: startDate,
        endDate: endDate,
      }

      // console.log("Form Data:", formData)

      try {
        await invoke(addToCart, formData)
        alert("Thanks for renting")
        refetch()
      } catch (error) {
        console.error("Error adding to cart:", error)
        alert("Error adding to cart")
      }
    }
    // Perform your action here, like calling an API or adding to the cart
    // For example: invoke(addToCart, formData);
  }

  // Memoize unique colors to prevent unnecessary recalculation
  const uniqueColors = React.useMemo(() => {
    return Array.from(
      new Map(product.variants.map((variant) => [variant.color.id, variant.color])).values()
    )
  }, [product])

  const uniqueSizes = React.useMemo(() => {
    return Array.from(new Set(product.variants.map((variant) => variant.size)))
  }, [product])

  const handleCountMinus = () => {
    if (!selectedColor || !selectedSize) {
      alert("Please select a color and size")
    } else if (quantity === 0) {
      alert("You cannot decrease the count below 0")
    } else {
      const selectedVariant = product.variants.find(
        (variant) => variant.color.id === selectedColor && variant.size === selectedSize
      )
      setQuantity((prev) => prev - 1)
      // console.log(selectedVariant.id)
    }
  }

  const handleCountPlus = () => {
    if (!selectedColor || !selectedSize) {
      alert("Please select a color and size")
    } else {
      const selectedVariant = product.variants.find(
        (variant) => variant.color.id === selectedColor && variant.size === selectedSize
      )
      if (quantity === availableQuantity) {
        alert("You cannot increase the count above the available quantity")
      } else setQuantity((prev) => prev + 1)
    }
  }

  const [startDate, setStartDate] = useState<Date | null>()
  const [endDate, setEndDate] = useState<Date | null>()
  const [allRents] = useQuery(getAllRentItems, {})

  const handleStartDateChange = (date: any) => {
    setQuantity(0)

    if (!selectedColor || !selectedSize) {
      alert("Please select a color and size first")
      return
    }
    // Convert the string to a Date object
    const selectedDateObject = new Date(date)

    console.log("the rents", allRents)

    const filteredData = allRents.filter((rent) => rent.productVariantId === selectedVariant?.id)

    const totalQuantity = filteredData.reduce((sum, rent) => {
      const startDate = new Date(rent.startDate)
      const endDate = new Date(rent.endDate)

      // Check if the selectedDateObject is within the range of startDate and endDate
      if (
        selectedDateObject >= startDate &&
        selectedDateObject <= endDate &&
        rent.status === "rendering"
      ) {
        // Add the quantity to the sum
        return sum + rent.quantity // Assuming each rent object has a `quantity` property
      }
      return sum
    }, 0) // Initial sum is 0

    console.log("the total quantity", totalQuantity)
    setAvailableQuantity(selectedVariant?.quantity - totalQuantity)
    if (totalQuantity >= selectedVariant?.quantity) {
      alert("item is not available at this date")
      setStartDate(null)
      setEndDate(null)
      return
    }
    // console.log("the selected date ", selectedDateObject)

    // console.log("the filtered data start date", startDate)

    // console.log("the selected variant:", selectedVariant?.quantity)

    // Check if the selected date is in the future
    if (selectedDateObject < new Date()) {
      alert("Please select a future date")
      setStartDate(null) // Reset the date value to null if invalid
    } else {
      setStartDate(selectedDateObject) // Set the valid date
    }
  }

  const handleEndDateChange = (date: any) => {
    // Convert the string to a Date object
    const selectedDateObject = new Date(date)

    const filteredData = allRents.filter((rent) => rent.productVariantId === selectedVariant?.id)
    const totalQuantity = filteredData.reduce((sum, rent) => {
      const rentStartDate = new Date(rent.startDate)
      const rentEndDate = new Date(rent.endDate)

      // Check for overlap between the selected range and the rent range
      const isOverlapping =
        (startDate >= rentStartDate && startDate <= rentEndDate) || // User's start is within the rent range
        (selectedDateObject >= rentStartDate && selectedDateObject <= rentEndDate) || // User's end is within the rent range
        (startDate <= rentStartDate && selectedDateObject >= rentEndDate) // User's range completely contains the rent range

      if (isOverlapping && rent.status === "rendering") {
        // Add the quantity if there is an overlap
        return sum + rent.quantity // Assuming each rent object has a `quantity` property
      }

      return sum
    }, 0) // Initial sum is 0

    setAvailableQuantity(selectedVariant?.quantity - totalQuantity)
    if (totalQuantity >= selectedVariant?.quantity) {
      alert("item is not available at this date")
      setStartDate(null)
      return
    }
    console.log("the selected date ", selectedDateObject)

    console.log("the filtered data start date", startDate)

    console.log("the selected variant:", selectedVariant?.quantity)

    // Check if the selected date is in the future
    if (selectedDateObject < new Date()) {
      alert("Please select a future date")
      setEndDate(null) // Reset the date value to null if invalid
    } else {
      setEndDate(selectedDateObject) // Set the valid date
    }
  }

  return (
    <>
      <Navbar currentUser={currentUser} toggleDrawer={toggleDrawer(true)} />
      <div className="w-full flex flex-col md:flex-row lg:flex-row p-24">
        <div className="w-1/2">
          <ProductCarousel product={product} />
        </div>
        <div className="w-full bg-gray-50 p-12">
          <h1 className="text-2xl font-bold capitalize">{product.name}</h1>

          <div className="mt-4 border-t">
            <p>{product.description}</p>
          </div>

          {/* form and calendar */}
          <div className="flex flex-row gap-2">
            <div className="flex flex-col w-1/3">
              <div className="mt-4">
                <p>
                  Price:
                  {selectedColor &&
                  selectedSize &&
                  product.variants.some(
                    (variant) => variant.color.id === selectedColor && variant.size === selectedSize
                  )
                    ? `₱${
                        product.variants.find(
                          (variant) =>
                            variant.color.id === selectedColor && variant.size === selectedSize
                        )?.price
                      }`
                    : `₱${Math.min(
                        ...product.variants.map((variant) => variant.price)
                      )} - ₱${Math.max(...product.variants.map((variant) => variant.price))}`}
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <div className="flex flex-col">
                  <p>Available Colors : </p>
                  <div className="flex flex-row flex-wrap gap-2 mt-4">
                    {/* Render unique colors */}
                    {uniqueColors.map((color) => (
                      <div key={color.id}>
                        <button
                          type="button"
                          onClick={() => handleChangeColor(color.id)} // Update selected color
                          className={`w-10 h-10 rounded-full border-4 ${
                            selectedColor === color.id ? "border-blue-500" : "border-transparent"
                          } hover:scale-110`}
                          style={{ backgroundColor: color.hexCode }}
                        ></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <p>Available Sizes : </p>
                {/* Render unique sizes */}

                <div className="flex flex-row flex-wrap gap-2">
                  {uniqueSizes.map((size) => {
                    // Check if the size is valid for the selected color
                    const isDisabled =
                      selectedColor &&
                      !product.variants.some(
                        (variant) => variant.colorId === selectedColor && variant.size === size
                      )

                    return (
                      <div key={size}>
                        <button
                          type="button"
                          onClick={() => handleChangeSize(size)} // Update selected size
                          className={`border-4 ${
                            selectedSize === size ? "border-blue-500" : "border-transparent"
                          } hover:scale-110 w-10 h-10 bg-slate-600 rounded-full text-white ${
                            isDisabled ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={isDisabled} // Disable button if size is not valid for the selected color
                        >
                          {size}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <p>Delivery Option:</p>
                {product.deliveryOption === "BOTH" ? (
                  <div className="flex gap-2">
                    <Button
                      variant={selectedDelivery === "delivery" ? "contained" : "outlined"}
                      color={selectedDelivery === "delivery" ? "primary" : "secondary"}
                      className={selectedDelivery === "delivery" ? "border-2 border-slate-600" : ""}
                      onClick={() => setSelectedDelivery("delivery")}
                    >
                      Deliver
                    </Button>

                    <Button
                      variant={selectedDelivery === "pickup" ? "contained" : "outlined"}
                      color={selectedDelivery === "pickup" ? "secondary" : "primary"}
                      className={selectedDelivery === "pickup" ? "border-2 border-slate-600" : ""}
                      onClick={() => setSelectedDelivery("pickup")}
                    >
                      Pickup
                    </Button>
                  </div>
                ) : product.deliveryOption === "DELIVERY" ? (
                  <Button
                    variant="contained"
                    color="primary"
                    className="border-2 border-slate-600"
                    onClick={() => setSelectedDelivery("delivery")}
                  >
                    Deliver Only
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    className="border-2 border-slate-600"
                    onClick={() => setSelectedDelivery("pickup")}
                  >
                    Pickup Only
                  </Button>
                )}
              </div>

              {/* schedule */}
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex flex-col gap-2 mt-4">
                  <p>Select Schedule:</p>
                  <div className="flex flex-col gap-2">
                    <TextField
                      type="date"
                      variant="outlined"
                      fullWidth
                      value={startDate ? startDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      helperText="Please select a start date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                    <TextField
                      type="date"
                      variant="outlined"
                      fullWidth
                      value={endDate ? endDate.toISOString().split("T")[0] : ""}
                      onChange={(e) => handleEndDateChange(e.target.value)}
                      helperText="Please select an end date"
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </div>
                </div>
              </div>
              {/* schedule */}

              {/* quantity here */}
              <div className="flex flex-col gap-2 mt-4">
                <div>
                  <p>Quantity:</p>
                </div>

                <div className="flex gap-2">
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    disabled={quantity <= 1}
                    onClick={handleCountMinus}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    max="10"
                    value={quantity}
                    className="w-20 p-2 border border-gray-300 rounded-md"
                  />
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                    onClick={handleCountPlus}
                  >
                    +
                  </button>

                  {selectedVariant && startDate && (
                    <p className="italic text-red-400">{availableQuantity} in stock</p>
                  )}
                </div>
              </div>
              {/* end of quantity */}
            </div>
            <div className="w-2/3 mt-4 flex flex-col ">
              <p className="font-bold">Available Schedule:</p>
              <div className="w-full">
                <CalendarEvent product={product} selectedVariant={selectedVariant} />
              </div>
            </div>
          </div>
          {/* form and calendar */}

          <div className="w-full flex flex-row justify-end gap-2">
            <button
              type="button"
              onClick={handleClickCart}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add to Cart
            </button>

            <div>
              <div>
                <button
                  onClick={handleClickRent}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Rent
                </button>
                <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                  <DrawerCart />
                </Drawer>
              </div>
            </div>
            {/* <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                    Rent
                    </button> */}
          </div>
        </div>
      </div>
      <div className="w-full flex flex-col px-24">
        <div className="mb-8">
          <p className="font-bold text-2xl">Product Reviews</p>
        </div>
        <div className="flex flex-col">
          {product.reviews.length > 0 ? (
            product.reviews.map((review) => (
              <div key={review.id} className="mb-4 border-b border-gray-300">
                <div className="flex flex-row items-center gap-2">
                  <Image
                    src={`/uploads/renter-profile/${review.user.profileImage}`}
                    alt="Profile Picture"
                    width={50}
                    height={50}
                    className={`rounded-full`}
                  />
                  <div className="flex flex-col">
                    <p className="font-bold">
                      {review.user.personalInfo.firstName} {review.user.personalInfo.lastName}
                    </p>

                    <p>
                      <Rating name="review" value={review.rating} precision={0.25} readOnly />
                    </p>
                  </div>
                </div>
                <div className="my-2">
                  <p>{review.comment}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No reviews yet</p>
          )}
        </div>
      </div>
    </>
  )
}
export default ProductPage
