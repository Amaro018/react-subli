"use client"
import Image from "next/image"
import React, { useState } from "react"
import { Box, Drawer, Modal } from "@mui/material"
import getAllCartItem from "../queries/getAllCartItem"
import { useMutation, useQuery } from "@blitzjs/rpc"
import updateCartByVariantId from "../mutations/updateCartByVariantId"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import deleteCartItemById from "../mutations/deleteCartItemById"
import CheckoutForm from "./CheckOutForm"

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1000,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
}

export default function DrawerCart() {
  const [deleteItem] = useMutation(deleteCartItemById)
  const [cartItems, { refetch }] = useQuery(getAllCartItem, {})
  const [updateCartItem] = useMutation(updateCartByVariantId)
  const [open, setOpen] = useState(false)
  const [checkOutItems, setCheckOutItems] = useState([])

  const checkboxChange = (e) => {
    const checked = e.target.checked
    if (checked) {
      setCheckOutItems((prev) => [...prev, e.target.value])
    } else {
      setCheckOutItems((prev) => prev.filter((item) => item !== e.target.value))
    }
  }

  const handleCheckOut = () => {
    if (checkOutItems.length === 0) {
      alert("Please select at least one item to checkout.")
      return
    }

    setOpen(true)
    console.log(checkOutItems)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleDelete = async (id) => {
    const confirmDelete = confirm("Are you sure you want to delete this item?")
    if (!confirmDelete) return

    console.log(id)
    try {
      const item = await deleteItem({ id })
      console.log(item)
      refetch()
      alert("Item deleted successfully!")
    } catch (error) {
      console.error("Failed to delete item:", error)
    }
  }

  const updateQuantity = async (variantId, newQuantity) => {
    const cartItem = cartItems.find((item) => item.variantId === variantId)
    console.log(cartItem.variant.quantity)
    if (!cartItem) {
      console.error("Cart item not found!")
      return
    }

    if (newQuantity > cartItem.variant.quantity) {
      alert("You cannot add more than the available quantity")
      return
    } else if (newQuantity < 1) {
      alert("Quantity cannot be less than 1.")
      return
    } else {
      try {
        // Update the local cart data for instant UI feedback
        cartItem.quantity = newQuantity

        // Call the mutation to update the quantity on the server
        const updatedItem = await updateCartItem({ variantId, quantity: newQuantity })

        // Update the local cache with the new quantity (optional for UI sync)
        refetch()
      } catch (error) {
        console.error("Failed to update cart item:", error)
      }
    }
  }

  return (
    <>
      <Box
        sx={{
          width: 400,
          height: "100vh",
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
          },
        }}
        role="presentation"
        className="bg-slate-600"
      >
        <div className="p-12 text-white flex flex-col gap-2 w-full">
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div className="flex flex-col justify-stretch" key={item.id}>
                <div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" value={item.id} onChange={checkboxChange} />
                    <Image
                      src={`/uploads/products/${item.product.images[0]?.url}`}
                      alt={item.product.name}
                      width={100}
                      height={100}
                      className="w-32 h-32 object-cover"
                    />
                    <div className="text-sm">
                      <div className="flex justify-between items-center">
                        <p className="underline">{item.product.shop.shopName}</p>

                        <button onClick={() => handleDelete(item.id)}>
                          <DeleteForeverIcon className="text-white" />
                        </button>
                      </div>
                      <p className="text-white">{item.product.name}</p>
                      <p className="text-gray-400">
                        {item.variant.size} - {item.variant.color.name}
                      </p>
                      <p className="text-sm">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "long",
                          day: "2-digit",
                          year: "numeric",
                        }).formatRange(new Date(item.startDate), new Date(item.endDate))}
                      </p>

                      <div className="flex my-2 border-b border-slate-500 py-2 justify-end">
                        <button
                          className="mx-2 text-slate-600 bg-slate-400 px-2 rounded-lg hover:bg-slate-500 shadow-lg"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          className="w-12 text-center text-slate-600"
                        />
                        <button
                          className="mx-2 text-slate-600 bg-slate-400 px-2 rounded-lg hover:bg-slate-500 shadow-lg"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
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
                      {Math.ceil(
                        (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </p>
                    <p>=</p>
                    <p>
                      &#x20B1;
                      {item.quantity *
                        item.variant.price *
                        Math.ceil(
                          (new Date(item.endDate).getTime() - new Date(item.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                        )}
                    </p>
                  </div>
                  {/* grand total computation  */}
                </div>
                <div>{item.user.personalInfo?.firstName}</div>
              </div>
            ))
          ) : (
            <p className="text-center">No items in cart</p>
          )}
        </div>

        <div className="p-4 flex justify-center w-full">
          <button
            className="bg-white hover:bg-gray-300 font-bold py-2 px-4 rounded w-full text-slate-600"
            onClick={handleCheckOut}
          >
            checkout
          </button>
        </div>
      </Box>

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <CheckoutForm />
        </Box>
      </Modal>
    </>
  )
}
