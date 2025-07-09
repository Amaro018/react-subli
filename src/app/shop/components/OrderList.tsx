"use client"
import React, { useState } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getRentItemsByShop from "../../queries/getRentItemsByShop"
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
} from "@mui/material"
import Image from "next/image"
import addPayment from "../../mutations/addPayment"
import getPaymentByRentId from "../../queries/getPaymentByRentId"
import getCurrentUser from "./../../users/queries/getCurrentUser"
import { toast } from "sonner"

const statuses = [
  { value: "ALL", label: "ALL" },
  { value: "pending", label: "PENDING" },
  { value: "rendering", label: "ON HAND" },
  { value: "completed", label: "COMPLETED" },
  { value: "canceled", label: "CANCELED" },
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
  const [currentUser] = useQuery(getCurrentUser, null)
  const shopId = currentUser?.shop?.id

  // Only fetch rent items if shopId exists
  const [rentItems = [], { refetch }] = useQuery(
    getRentItemsByShop,
    shopId ? { shopId } : { shopId: 0 },
    { enabled: !!shopId }
  )

  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [amount, setAmount] = useState()
  const [status, setStatus] = useState("Partial")
  const [note, setNote] = useState("")
  const [payments, setPayments] = useState<any[]>([])
  const [sumOfPayment, setSumOfPayment] = useState(0)
  const [addPaymentMutation] = useMutation(addPayment)
  const [open, setOpen] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)
  const [NumberOfDamageProduct, setNumberOfDamageProduct] = useState(0)

  const [valueOfDamageProduct, setValueOfDamageProduct] = useState(0)

  const [penaltyFee, setPenaltyFee] = useState(0)

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true)

  const handleChangeOfDamageProduct = (value: string) => {
    const parsedValue = parseInt(value, 10)
    if (!isNaN(parsedValue)) {
      setNumberOfDamageProduct(parsedValue)
    } else {
      setNumberOfDamageProduct(0)
    }

    setValueOfDamageProduct(NumberOfDamageProduct * selectedItem?.price)
  }

  const filteredRentItems =
    statusFilter === "ALL" ? rentItems : rentItems.filter((item) => item.status === statusFilter)

  const handleOpen = async (rentItem: any) => {
    setOpen(true)
    // Calculate additional price and base price
    const today = new Date()
    const endDate = new Date(rentItem?.endDate)
    const daysPassed = Math.max(
      0,
      Math.ceil((today.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24) + 1)
    )
    const basePrice =
      rentItem?.price *
      rentItem?.quantity *
      Math.ceil(
        (new Date(rentItem?.endDate).getTime() - new Date(rentItem?.startDate).getTime()) /
          (1000 * 60 * 60 * 24) +
          1
      )
    const additionalPrice = daysPassed * basePrice

    const updatedItem = {
      ...rentItem,
      additionalPrice,
      basePrice,
      daysPassed,
    }
    setSelectedItem(updatedItem)

    try {
      const payments = await getPaymentByRentId({ rentItemId: rentItem.id })
      const sum = payments.reduce((acc, p) => acc + p.amount, 0)
      setSumOfPayment(sum)
      setPayments(payments)
    } catch (error) {
      setPayments([])
      setSumOfPayment(0)
    }
  }

  const onClose = () => {
    setOpen(false)
    setPayments([])
    setSelectedItem(null)
  }

  const handleOpenComplete = (rentItem: any) => {
    setOpenComplete(true)
    setSelectedItem(rentItem)
  }
  const handleCloseComplete = () => {
    setOpenComplete(false)
    setValueOfDamageProduct(0)
  }

  const handleComplete = async (rentItem: any) => {
    handleOpenComplete(rentItem)
    // try {
    //   await addPaymentMutation({
    //     rentItemId: rentItem.id,
    //     amount: 0,
    //     status: "completed",
    //     note: "Payment completed",
    //   })
    //   alert("Payment completed successfully!")
    //   onClose()
    //   refetch()
    // } catch (error) {
    //   alert("Failed to complete payment")
    // }
  }

  const handleCancel = async (rentItem: any) => {
    try {
      await addPaymentMutation({
        rentItemId: rentItem.id,
        amount: 0,
        status: "canceled",
        note: "Payment canceled",
      })
      alert("Payment canceled successfully!")
      onClose()
      refetch()
    } catch (error) {
      alert("Failed to cancel payment")
    }
  }

  const daysRenting = Math.ceil(
    (new Date(selectedItem?.endDate).getTime() - new Date(selectedItem?.startDate).getTime()) /
      (1000 * 60 * 60 * 24) +
      1
  )
  const addedPenaltyFee = selectedItem?.payments?.[selectedItem.payments.length - 1]?.penaltyFee

  const lastPaymentPenaltyFee =
    selectedItem?.payments?.[selectedItem.payments.length - 1]?.penaltyFee ?? 0
  console.log("penaltyFee", lastPaymentPenaltyFee)

  const totalPayment = selectedItem?.payments?.reduce((total, payment) => total + payment.amount, 0)

  const remainingBalance =
    selectedItem?.price * selectedItem?.quantity * daysRenting -
    totalPayment +
    lastPaymentPenaltyFee

  console.log("remainingBalance", remainingBalance)

  const handleAmountChange = (value: number) => {
    setAmount(value)

    if (value === "" || isNaN(value) || value < 1 || value > remainingBalance) {
      setIsSubmitDisabled(true)
    } else {
      setStatus(value >= remainingBalance ? "Full" : "Partial")
      setIsSubmitDisabled(false)
    }
  }

  const handleSubmitPenaltyFee = async () => {
    const computedPenalty = Number(selectedItem?.price) * NumberOfDamageProduct
    setPenaltyFee(computedPenalty)

    console.log("computedPenalty", computedPenalty)

    try {
      await addPaymentMutation({
        rentItemId: selectedItem.id,
        amount,
        status,
        penaltyFee: computedPenalty,
        note: note || "Penalty Fee",
      })

      toast.success("Penalty Fee added successfully!")
      onClose()
      setAmount(0)
      setPenaltyFee(0)
      setNote("")
      refetch()
    } catch (error) {
      console.error("Add payment error:", error)
      alert("Failed to add payment")
    }
  }

  const handleSubmit = async () => {
    if (amount < remainingBalance / 2) {
      alert(`Partial should be a minimum of ₱${remainingBalance / 2}`)
      return
    }
  }

  const handleSubmit1 = async () => {
    if (!selectedItem) return

    // Calculate how many payments there are already
    const paymentCount = payments.length

    // Determine if full payment is made
    const isFullyPaid = amount >= remainingBalance
    console.log("amount", amount)
    console.log("remainingBalance", remainingBalance)

    console.log("isFullyPaid", isFullyPaid)
    // Decide final status to send to the mutation
    const computedStatus =
      selectedItem.status === "canceled"
        ? "canceled"
        : paymentCount >= 1 || isFullyPaid
        ? "completed"
        : "rendering"

    try {
      await addPaymentMutation({
        rentItemId: selectedItem.id,
        amount,
        status: computedStatus,
        note,
      })
      toast.success("Payment added successfully!")
      onClose()
      setAmount(0)
      setStatus("Partial")
      setNote("")
      refetch()
    } catch (error) {
      console.error("Payment submission failed", error)
      toast.error("Failed to add payment")
    }
  }

  return (
    <>
      <div>
        <div className="flex gap-4 justify-between items-center mb-4">
          <h1 className="font-bold text-xl">
            Rent Items for Shop {currentUser?.shop?.shopName ?? "..."}
          </h1>
          <TextField
            id="outlined-select-status"
            select
            label="Filter by Status"
            value={statusFilter}
            className="w-48"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statuses.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {filteredRentItems.length === 0 ? (
          <div className="text-center text-gray-500">No orders found.</div>
        ) : (
          filteredRentItems.map((rentItem) => (
            <div
              key={rentItem.id}
              className="border rounded-lg shadow-md p-4 flex justify-start gap-16 my-2 flex-col md:flex-row"
            >
              <div className="flex justify-start items-center w-1/4 border-b border-gray-200">
                <Image
                  src={`/uploads/products/${rentItem.productVariant.product.images[0]?.url}`}
                  alt={rentItem.productVariant.product.name}
                  width={100}
                  height={100}
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
              <div className="flex flex-col justify-between w-full">
                <p className="font-bold">Product Details</p>
                <p className="text-lg font-semibold">{rentItem.productVariant.product.name}</p>
                <div className="flex flex-col gap-2">
                  <p className="text-sm ">
                    Rent Range:{" "}
                    {new Intl.DateTimeFormat("en-US", {
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    }).formatRange(new Date(rentItem.startDate), new Date(rentItem.endDate))}
                  </p>
                  <p className="text-sm">
                    (
                    {Math.ceil(
                      (new Date(rentItem.endDate).getTime() -
                        new Date(rentItem.startDate).getTime()) /
                        (1000 * 60 * 60 * 24) +
                        1
                    )}{" "}
                    days)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label>Variant:</label>
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
                          (1000 * 60 * 60 * 24) +
                          1
                      )
                  )}
                </p>
              </div>
              <div className="capitalize flex flex-col justify-between w-full">
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
              <div className="flex flex-col gap-2 justify-between">
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
                      <StepLabel>On Hand</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Completed</StepLabel>
                    </Step>
                  </Stepper>
                </div>
                <div>
                  <p>Order Status: {rentItem.status}</p>
                </div>
                <div>
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
                    onClick={() =>
                      rentItem.status === "rendering"
                        ? handleComplete(rentItem)
                        : handleCancel(rentItem)
                    }
                    disabled={rentItem.status === "completed" || rentItem.status === "canceled"}
                  >
                    {rentItem.status === "completed"
                      ? "Order Completed"
                      : rentItem.status === "rendering"
                      ? "Return Status"
                      : rentItem.status === "canceled"
                      ? "Order Canceled"
                      : "Cancel Order"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal open={openComplete} onClose={handleCloseComplete}>
        <Box sx={style}>
          <div className="flex flex-col ">
            <div className="flex justify-between items-center">
              <p className="font-semibold text-2xl mb-4">
                Completing order for {selectedItem?.productVariant.product.name}
              </p>
              <p>Product Price: {selectedItem?.price}</p>
            </div>

            <div className="flex flex-row gap-4 items-center justify-start">
              <TextField
                fullWidth
                label="Rented Quantity"
                value={selectedItem?.quantity}
                InputProps={{
                  readOnly: true,
                }}
                inputProps={{
                  tabIndex: -1, // prevent keyboard focus
                  style: { pointerEvents: "none" }, // prevent mouse input
                }}
              />

              <TextField
                fullWidth
                label="Number of Damaged Product"
                type="number"
                value={NumberOfDamageProduct}
                inputProps={{ max: selectedItem?.quantity, min: 0 }}
                onChange={(e) => handleChangeOfDamageProduct(e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-4 items-center">
              <div>Total Added Balance: {NumberOfDamageProduct * (selectedItem?.price ?? 0)}</div>

              <div>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  onClick={handleSubmitPenaltyFee}
                >
                  submit
                </button>
                <button
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
                  onClick={handleCloseComplete}
                >
                  cancel
                </button>
              </div>
            </div>
          </div>
        </Box>
      </Modal>

      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <div className="flex flex-row justify-between items-center">
            <div>
              <p>
                Total Price :
                {Intl.NumberFormat("en-US", { style: "currency", currency: "PHP" }).format(
                  selectedItem?.basePrice ?? 0
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
                        (selectedItem?.price ?? 0) *
                          (selectedItem?.quantity ?? 0) *
                          Math.ceil(
                            (new Date(selectedItem?.endDate).getTime() -
                              new Date(selectedItem?.startDate).getTime()) /
                              (1000 * 60 * 60 * 24) +
                              1
                          ) -
                          sumOfPayment +
                          (selectedItem?.additionalPrice ?? 0)
                      ) +
                        (selectedItem?.payments?.[selectedItem.payments.length - 1]?.penaltyFee ??
                          0)
                    )}
              </p>
              <p>
                Penalty:{" "}
                {selectedItem?.status === "completed"
                  ? "No Penalty"
                  : selectedItem?.additionalPrice ?? 0}
              </p>
            </div>
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={selectedItem?.status === "completed" || isSubmitDisabled}
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
              onKeyDown={(e) => {
                // Block e, +, -, .
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              value={amount}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0
                handleAmountChange(value)
              }}
              inputProps={{
                min: 1,
                max: remainingBalance, // <- your variable here
              }}
            />
            <FormControl fullWidth>
              <Select
                labelId="payment-method-label"
                value={status}
                readOnly
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="Partial">Partial</MenuItem>
                <MenuItem value="Full">Full</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Payment Note"
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
                      <td className="border border-slate-300 p-2">
                        {payment.penaltyFee ? `+${payment.penaltyFee}` : payment.amount}
                      </td>
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
