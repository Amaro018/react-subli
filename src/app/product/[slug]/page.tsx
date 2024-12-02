"use client"
import { invoke, useQuery } from "@blitzjs/rpc"
import getProductById from "../../queries/getProductById" // You'll need a query to fetch product details
import ProductCarousel from "../../components/ProductCarousel"

import GetTheNavBar from "../../components/GetTheNavBar"
import React, { useState } from "react"
import { set } from "zod"
import ProductSchedule from "../../components/ProductSchedule"
import { DateRangePicker } from "@nextui-org/date-picker"
import { q } from "@blitzjs/auth/dist/index-0ecbee46"
import getCurrentUser from "../../users/queries/getCurrentUser"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import Button from "@mui/material/Button"

import addToCart from "../../mutations/addToCart"
import CheckOutDrawer from "../../components/CheckOutDrawer"

import getAllCartItem from "../../queries/getAllCartItem"

const ProductPage = ({ params }: any) => {
  const { slug } = params
  //   const  id  = params.params.slug;
  const id = slug

  const [product, { refetch }] = useQuery(getProductById, { id: Number(id) })
  const [cartItems] = useQuery(getAllCartItem, {})

  const [selectedVariant, setSelectedVariant] = React.useState<number | null>(null)

  const [selectedColor, setSelectedColor] = React.useState<number | null>(null)
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null)

  const handleChangeColor = (colorId: number) => {
    setSelectedColor(colorId)
    setSelectedSize(null)
    setQuantity(1)
  }

  // for size sana
  const handleChangeSize = (size: string) => {
    setSelectedSize(size)
    if (selectedColor !== null && selectedSize !== null) {
      const selectedV = product.variants.find(
        (variant) => variant.color.id === selectedColor && variant.size === selectedSize
      )
      setSelectedVariant(selectedV.id)
    }
  }

  const handleClickCart = async () => {
    const currentUser = await invoke(getCurrentUser, null)
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
      variantId: selectedVariant.id, // Directly use the selected variant ID
      startDate: startDate,
      endDate: endDate,
    }

    console.log("Form Data:", formData)

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

  // Memoize unique colors to prevent unnecessary recalculation
  const uniqueColors = React.useMemo(() => {
    return Array.from(
      new Map(product.variants.map((variant) => [variant.color.id, variant.color])).values()
    )
  }, [product])

  const uniqueSizes = React.useMemo(() => {
    return Array.from(new Set(product.variants.map((variant) => variant.size)))
  }, [product])

  const [quantity, setQuantity] = React.useState(1)

  const handleCountMinus = () => {
    if (!selectedColor || !selectedSize) {
      alert("Please select a color and size")
    } else if (quantity === 1) {
      alert("You cannot decrease the count below 1")
    } else {
      const selectedVariant = product.variants.find(
        (variant) => variant.color.id === selectedColor && variant.size === selectedSize
      )
      setQuantity((prev) => prev - 1)
      console.log(selectedVariant.quantity)
    }
  }

  const handleCountPlus = () => {
    if (!selectedColor || !selectedSize) {
      alert("Please select a color and size")
    } else {
      const selectedVariant = product.variants.find(
        (variant) => variant.color.id === selectedColor && variant.size === selectedSize
      )
      if (quantity === selectedVariant.quantity) {
        alert("You cannot increase the count above the available quantity")
      } else setQuantity((prev) => prev + 1)
    }
  }

  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const handleStartDateChange = (date: any) => {
    // Convert the string to a Date object
    const dateObject = new Date(date)

    // Check if the selected date is in the future
    if (dateObject < new Date()) {
      alert("Please select a future date")
      setStartDate(null) // Reset the date value to null if invalid
    } else {
      setStartDate(dateObject) // Set the valid date
    }
  }

  const handleEndDateChange = (date: any) => {
    // Convert the string to a Date object
    const dateObject = new Date(date)

    // Check if the selected date is in the future
    if (dateObject < new Date() || dateObject <= startDate) {
      alert("mali")
      setEndDate(null) // Reset the date value to null if invalid
    } else {
      setEndDate(dateObject) // Set the valid date
    }
  }

  const [open, setOpen] = React.useState(false)

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen)
  }

  const DrawerList = (
    <Box
      sx={{
        width: 400,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 250,
          boxSizing: "border-box",
        },
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <div className="p-12">
        <p>items here</p>
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div>
              <p>{item.product.name}</p>
            </div>
          ))
        ) : (
          <p className="text-center">No items in cart</p>
        )}
      </div>
    </Box>
  )

  return (
    <>
      {/* <GetTheNavBar /> */}
      <div className="w-full flex flex-row p-24">
        <div className="w-1/2">
          <ProductCarousel product={product} />
        </div>
        <div className="w-1/2 bg-gray-50 p-12">
          <h1 className="text-2xl font-bold capitalize">{product.name}</h1>

          <div className="mt-4 border-t">
            <p>{product.description}</p>
          </div>

          {/* form and calendar */}
          <div className="flex flex-row gap-2">
            <div className="flex flex-col w-1/4">
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
                  <div className="flex flex-row gap-2 mt-4">
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

                <div className="flex flex-row gap-2">
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
            </div>
            <div className="w-full bg-red-900 mt-4">
              <p>Available Schedule:</p>
            </div>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <div className="flex flex-col gap-2 mt-4">
              <p>Select Schedule:</p>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startDate ? startDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                />
                <input
                  type="date"
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={endDate ? endDate.toISOString().split("T")[0] : ""}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                />
              </div>
            </div>
          </div>

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
            </div>
          </div>
          {/* end of quantity */}

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
                  onClick={toggleDrawer(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Rent
                </button>
                <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
                  {DrawerList}
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
    </>
  )
}
export default ProductPage
