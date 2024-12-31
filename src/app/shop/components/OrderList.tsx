"use client"
import React, { useEffect, useState } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getRentItemsByShop from "../../queries/getRentItemsByShop"
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material"
import { useParams } from "next/navigation"
import Image from "next/image"
import addPayment from "../../mutations/addPayment"
import getPaymentByRentId from "../../queries/getPaymentByRentId"
import { set } from "zod"

const statuses = [
  {
    value: "ALL",
    label: "ALL",
  },
  {
    value: "pending",
    label: "PENDING",
  },
  {
    value: "rendering",
    label: "RENDERING",
  },
  {
    value: "completed",
    label: "COMPLETED",
  },
  {
    value: "canceled",
    label: "CANCELED",
  },
]

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

export const OrderList = () => {
  const { shopId } = useParams()
  const [rentItems, { refetch }] = useQuery(getRentItemsByShop, { shopId })
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedItem, setSelectedItem] = useState(null)
  const [amount, setAmount] = useState(0)
  const [status, setStatus] = useState("Partial")
  const [note, setNote] = useState("")

  const [payments, setPayments] = useState([])
  const [sumOfPayment, setSumOfPayment] = useState(0)
  const [rentItemsWithPayments, setRentItemsWithPayments] = useState([])
  const [addPaymentMutation] = useMutation(addPayment)
  // Filter the rentItems based on the selected statuss

  const filteredRentItems =
    statusFilter === "ALL" ? rentItems : rentItems.filter((item) => item.status === statusFilter)

  const [open, setOpen] = useState(false)

  const handleOpen = async (rentItem: any) => {
    setOpen(true)
    setSelectedItem(rentItem)

    console.log("selected item", selectedItem)

    const today = new Date()
    const endDate = new Date(rentItem?.endDate)
    const daysPassed = Math.max(
      0,
      Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24)+1)
    )
    const basePrice =
      rentItem?.price *
      rentItem?.quantity *
      Math.ceil(endDate.getDate() - new Date(rentItem?.startDate).getDate())
    const additionalPrice = daysPassed * basePrice

    console.log("Days passed:", additionalPrice)
    // Associate the additionalPrice with the selectedItem
    const updatedItem = {
      ...rentItem,
      additionalPrice: additionalPrice,
      basePrice: basePrice,
      daysPassed: daysPassed,
    }

    setSelectedItem(updatedItem) // Update the state with the modified object
    console.log("Updated selected item", updatedItem)

    try {
      const payments = await getPaymentByRentId({ rentItemId: rentItem.id })
      const sum = payments.reduce((acc, p) => acc + p.amount, 0)
      setSumOfPayment(sum)
      setPayments(payments)
    } catch (error) {
      console.error("Error fetching payments:", error)
    }
  }

  const onClose = () => {
    setOpen(false)
    setPayments([]) // Clear payments when the modal closes (optional)
  }

  const handleCancel = async (rentItem: any) => {
    setSelectedItem(rentItem)
    try {
      await addPaymentMutation({
        rentItemId: selectedItem.id,
        amount: 0,
        status: "canceled",
        note: "Payment canceled",
      })
      alert("Payment canceled successfully!")
      onClose()
      refetch()
    } catch (error) {
      console.error("Error canceling payment:", error)
      alert("Failed to cancel payment")
    }
  }

  const handleSubmit = async () => {
    console.log("succeed")

    try {
      await addPaymentMutation({ rentItemId: selectedItem.id, amount, status, note })
      alert("Payment added successfully!")
      onClose()
      setAmount(0)
      setStatus("Partial")
      setNote("")
      refetch()
    } catch (error) {
      console.error("Error adding payment:", error)
      alert("Failed to add payment")
    }
  }

  return (
    <>
      <div>
        <div className="flex gap-4 justify-between items-center mb-4">
          <h1 className="font-bold text-xl">Rent Items for Shop {shopId}</h1>
          <TextField
            id="outlined-select-status"
            select
            label="Filter by Status"
            value={statusFilter}
            className="w-48"
            onChange={(e) => setStatusFilter(e.target.value)} // Update the filter
          >
            {statuses.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {filteredRentItems.map((rentItem) => (
          <div
            key={rentItem.id}
            className="border rounded-lg shadow-md p-4 bg-white flex justify-start gap-16 my-2"
          >
            <div className="">
              <Image
                src={`/uploads/products/${rentItem.productVariant.product.images[0]?.url}`}
                alt={rentItem.productVariant.product.name}
                width={250}
                height={150}
                className="w-48 h-48 object-cover"
              />
            </div>
            <div className="flex flex-col justify-between">
              <h2 className="text-lg font-semibold">{rentItem.productVariant.product.name}</h2>
              <div className="flex gap-2">
                <p>
                  Rent Range:{" "}
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  }).formatRange(new Date(rentItem.startDate), new Date(rentItem.endDate))}
                </p>
                <p>
                  (
                  {Math.ceil(
                    (new Date(rentItem.endDate).getTime() -
                      new Date(rentItem.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)+1
                  )}{" "}
                  days)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label htmlFor="">Variant:</label>
                <p>{rentItem.productVariant.size} -</p>
                {rentItem.productVariant.color.name}{" "}
                <span
                  className="w-4 h-4 inline-block rounded-full"
                  style={{ backgroundColor: rentItem.productVariant.color.hexCode }}
                ></span>
              </div>
              <p>Quantity: {rentItem.quantity}</p>

              <p>
                Price:{" "}
                {Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "PHP",
                }).format(rentItem.price)}
              </p>
              <p>
                Total Price:{" "}
                {Intl.NumberFormat("en-US", { style: "currency", currency: "PHP" }).format(
                  rentItem.price *
                    rentItem.quantity *
                    Math.ceil(
                      (new Date(rentItem.endDate).getTime() -
                        new Date(rentItem.startDate).getTime()) /
                        (1000 * 60 * 60 * 24)+1
                    )
                )}
              </p>
            </div>

            <div className="capitalize flex flex-col justify-between">
              <p className="font-semibold">Renter Details</p>
              <p>
                Renter: {rentItem.rent.user.personalInfo?.firstName}{" "}
                {rentItem.rent.user.personalInfo?.middleName}{" "}
                {rentItem.rent.user.personalInfo?.lastName}
              </p>
              <p>Email: {rentItem.rent.user.email}</p>
              <p>Phone: {rentItem.rent.user.personalInfo?.phoneNumber}</p>
              <p>Address: {rentItem.rent.deliveryAddress}</p>
              <p>Delivery method : {rentItem.deliveryMethod}</p>
            </div>

            <div className="flex flex-col w-1/4 gap-2 justify-between">
              <div>
                <Stepper
                  activeStep={
                    rentItem.status === "pending"
                      ? 0
                      : rentItem.status === "rendering"
                      ? 1
                      : rentItem.status === "completed"
                      ? 2
                      : 0
                  }
                >
                  <Step>
                    <StepLabel>Pending</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Rendering</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Completed</StepLabel>
                  </Step>
                </Stepper>
              </div>
              <div className="">
                <p>Order Status: {rentItem.status}</p>
              </div>
              <div className="">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
                  onClick={() => handleOpen(rentItem)}
                >
                  VIEW PAYMENT
                </button>
              </div>

              <div>
                <button
                  className={`${
                    rentItem.status === "completed"
                      ? "bg-green-600"
                      : rentItem.status === "rendering"
                      ? "bg-yellow-400"
                      : rentItem.status === "canceled"
                      ? "bg-red-600"
                      : "bg-red-500 hover:bg-red-700"
                  } text-white font-bold py-2 px-4 rounded w-full`}
                  onClick={() => handleCancel(rentItem)}
                  disabled={
                    rentItem.status === "completed" ||
                    rentItem.status === "canceled" ||
                    rentItem.status === "rendering"
                  }
                >
                  {rentItem.status === "completed"
                    ? "Order Completed"
                    : rentItem.status === "rendering"
                    ? "Item on Render"
                    : rentItem.status === "canceled"
                    ? "Order Canceled"
                    : "Cancel Order"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <div className="flex flex-row justify-between items-center">
            <div>
              <p>
                Total Price :
                {Intl.NumberFormat("en-US", { style: "currency", currency: "PHP" }).format(
                  selectedItem?.basePrice
                )}
              </p>
            </div>

            <div className="flex gap-4 text-lg">
              <p>
                Remaining Balance :{" "}
                {selectedItem?.status === "completed"
                  ? "No Balance"
                  : Intl.NumberFormat("en-US", { style: "currency", currency: "PHP" }).format(
                      Math.max(
                        0,
                        selectedItem?.price *
                          selectedItem?.quantity *
                          Math.ceil(
                            (new Date(selectedItem?.endDate).getTime() -
                              new Date(selectedItem?.startDate).getTime()) /
                              (1000 * 60 * 60 * 24)+1
                          ) -
                          sumOfPayment +
                          selectedItem?.additionalPrice
                      )
                    )}
              </p>

              <p>
                Penalty:{" "}
                {selectedItem?.status === "completed"
                  ? "No Penalty"
                  : selectedItem?.additionalPrice}
              </p>
            </div>

            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={selectedItem?.status === "completed"}
              >
                Submit
              </Button>
              <Button sx={{ ml: 2 }} variant="contained" color="warning" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
          <div className="flex flex-row gap-2 mt-2">
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
            />
            <FormControl fullWidth>
              <Select
                labelId="payment-method-label"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                helperText="select a payment status"
              >
                <MenuItem value="Partial">Partial</MenuItem>
                <MenuItem value="Full">Full</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className="my-2">
            <table className="table-auto w-full border-collapse border border-slate-400 rounded-lg">
              <thead className="bg-slate-600 text-white">
                <tr>
                  <th className="border border-slate-300 p-2">Date</th>

                  <th className="border border-slate-300 p-2">Amount</th>
                  <th className="border border-slate-300 p-2">Status</th>
                  <th className="border border-slate-300 p-2">Note</th>
                </tr>
              </thead>
              <tbody>
                {!payments.length ? (
                  <tr>
                    <td colSpan={4} className="border border-slate-300 p-2 text-center">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="border border-slate-300 p-2">
                        {new Date(payment.createdAt).toLocaleString("en-US", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </td>
                      <td className="border border-slate-300 p-2">{payment.amount}</td>
                      <td className="border border-slate-300 p-2">{payment.status}</td>
                      <td className="border border-slate-300 p-2">{payment.note}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Box>
      </Modal>
    </>
  )
}

export default OrderList
