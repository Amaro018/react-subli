"use client"
import React, { useState, useEffect } from "react"
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
  Typography,
} from "@mui/material"
import Image from "next/image"
// import addPayment from "../../mutations/addPayment"
import addPayment from "../../mutations/addPaymentNew"
import updateRentStatus from "../../mutations/updateRentStatus"

import getPaymentByRentId from "../../queries/getPaymentByRentId"
import getCurrentUser from "./../../users/queries/getCurrentUser"
import { toast } from "sonner"
import { set } from "zod"

const steps = ["Pending", "Accepted", "On Hand", "Returned", "Completed", "Canceled"]

const statuses = [
  { value: "ALL", label: "ALL" },
  { value: "pending", label: "PENDING" },
  { value: "rendering", label: "ON HAND" },
  { value: "completed", label: "COMPLETED" },
  { value: "canceled", label: "CANCELED" },
  { value: "returned", label: "RETURNED" },
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

type RentItemType = {
  id: number
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
  const [amount, setAmount] = useState<string | number>(0)
  const [status, setStatus] = useState("Partial")
  const [note, setNote] = useState("")
  const [payments, setPayments] = useState<any[]>([])
  const [sumOfPayment, setSumOfPayment] = useState(0)
  const [sumOfPFee, setSumOfPFee] = useState(0)
  const [addPaymentMutation] = useMutation(addPayment)
  const [updateRentStatusMutation] = useMutation(updateRentStatus)
  const [open, setOpen] = useState(false)
  const [openComplete, setOpenComplete] = useState(false)
  const [NumberOfDamageProduct, setNumberOfDamageProduct] = useState(0)

  const [valueOfDamageProduct, setValueOfDamageProduct] = useState(0)

  const [penaltyFee, setPenaltyFee] = useState(0)

  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true)
  const [isReturnDisabled, setIsReturnDisabled] = useState(false)

  const handleChangeOfDamageProduct1 = (value: number | string) => {
    const parsedValue = parseInt(value, 10)

    if (!isNaN(parsedValue)) {
      setIsReturnDisabled(false)
      setNumberOfDamageProduct(parsedValue)
      if (parsedValue > selectedItem?.quantity || parsedValue < 1) {
        setIsReturnDisabled(true)
        return
      }
      // setValueOfDamageProduct(parsedValue * (selectedItem?.price || 0))
    } else {
      setNumberOfDamageProduct(0)
      // setValueOfDamageProduct(0)
      setIsReturnDisabled(true)
    }

    // setValueOfDamageProduct(NumberOfDamageProduct * selectedItem?.price)
  }

  const filteredRentItems =
    statusFilter === "ALL" ? rentItems : rentItems.filter((item) => item.status === statusFilter)

  const handleOpen = async (rentItem: any) => {
    setStatus("Partial")
    setIsSubmitDisabled(false)

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
    const damagedFee = rentItem.price * rentItem.returnedDamagedQty

    const updatedItem = {
      ...rentItem,
      additionalPrice,
      basePrice,
      daysPassed,
      damagedFee,
    }

    setSelectedItem(updatedItem)

    try {
      const payments = await getPaymentByRentId({ rentItemId: rentItem.id })
      const paymentSum = payments.reduce((acc, p) => acc + p.amount, 0)
      const pFee = payments.reduce((acc, p) => acc + p.penaltyFee, 0)

      setSumOfPayment(paymentSum)
      setSumOfPFee(pFee)
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

  const handleAction = async (rentItem: RentItemType, action: "accept" | "cancel") => {
    try {
      const status = await updateRentStatusMutation({ rentItemId: rentItem.id, action })
      console.log(status)
      // Optionally refresh your data or update state
    } catch (error) {
      console.error("Failed to update rent status:", error)
    }
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
  // console.log("penaltyFee", lastPaymentPenaltyFee)

  const totalPayment = selectedItem?.payments?.reduce((total, payment) => total + payment.amount, 0)

  const remainingBalance =
    selectedItem?.price * selectedItem?.quantity * daysRenting -
    totalPayment +
    lastPaymentPenaltyFee +
    sumOfPFee

  useEffect(() => {
    if (!isNaN(remainingBalance)) {
      setAmount(Math.ceil(remainingBalance / 2))
    }
  }, [remainingBalance])

  // useEffect(() => {
  //   setStatus("Partial");
  // }, [status]);

  // console.log("remainingBalance", remainingBalance)

  const handleAmountChange = (value: number | string) => {
    // const numericValue = typeof value === "string" ? parseFloat(value) : value

    // if (numericValue <= 0) setAmount("")

    // if (
    //   value === "" ||
    //   isNaN(numericValue) ||
    //   numericValue < 1 ||
    //   numericValue > remainingBalance
    // ) {
    //   setIsSubmitDisabled(true)
    //   setStatus(amount !== "" ? "Amount exceeds remaining balance!" : "Partial")
    // } else {
    //   setStatus(value >= remainingBalance ? "Full" : "Partial")
    //   setIsSubmitDisabled(false)
    // }

    // (remainingBalance/2) > numericValue ? setAmount(remainingBalance/2) : setAmount(numericValue)

    const numericValue = typeof value === "string" ? parseFloat(value) : value

    const minAllowed = Math.ceil(remainingBalance / 2)

    setAmount(numericValue)

    const isEmpty = value === ""
    const isInvalid = isNaN(numericValue) || numericValue <= 0
    const exceedsBalance = numericValue > remainingBalance

    if (isEmpty || isInvalid) {
      setIsSubmitDisabled(true)
      setStatus("Is invalid")
      return
    }

    if (exceedsBalance) {
      setIsSubmitDisabled(true)
      setStatus("Amount exceeds remaining balance!")
      return
    }

    console.log(numericValue)
    console.log(remainingBalance)

    if (numericValue === remainingBalance) {
      setStatus("Full")
      setIsSubmitDisabled(false)
    } else if (numericValue < minAllowed) {
      setStatus("Amount is below the minimum partial payment.")
      setIsSubmitDisabled(true)
    } else {
      setStatus("Partial")
      setIsSubmitDisabled(false)
    }

    // Status: Full or Partial
    // setStatus(numericValue === remainingBalance ? "Full" : "Partial");
    // setIsSubmitDisabled(false);

    // Apply half-balance rule if needed
    // setAmount(numericValue < minAllowed ? minAllowed : numericValue);
  }

  const handleChangeOfDamageProduct = (value: React.ChangeEvent<HTMLInputElement>) => {
    const input = value.replace(/^0+(?!$)/, "")

    if (input > selectedItem?.quantity) return

    if (isNaN(input) || input > (selectedItem?.quantity || 0)) {
      setIsReturnDisabled(true)
      setNumberOfDamageProduct(0)
      setValueOfDamageProduct(0)
      return
    }

    setIsReturnDisabled(false)
    setNumberOfDamageProduct(input)
    setValueOfDamageProduct(input * (selectedItem?.price || 0))
  }

  // dito ako darrel naz
  const handleSubmitPenaltyFee = async () => {
    const damagedQty = parseInt(NumberOfDamageProduct)
    const itemStatus = damagedQty !== 0 ? "returned_damaged" : "returned"

    try {
      await addPaymentMutation({
        rentItemId: selectedItem.id,
        amount: Number(amount),
        status: itemStatus,
        returnedDamagedQty: damagedQty,
        penaltyFee: valueOfDamageProduct,
        note: note || "Damage penalty fee",
      })
      handleCloseComplete()
      refetch()
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmitPenaltyFee1 = async () => {
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
    if (!selectedItem) return

    const newAmount = parseInt(amount)

    // Prevent payment if below 50% of remaining balance
    const minPartial = Math.ceil(remainingBalance / 2)
    if (newAmount < minPartial) {
      alert(`Partial should be a minimum of ₱${minPartial}`)
      return
    }

    // Determine payment status
    let computedStatus: "full" | "partial" | "overpaid"
    console.log(newAmount)
    console.log(remainingBalance)
    if (newAmount === remainingBalance) {
      computedStatus = "full"
    } else if (newAmount < remainingBalance) {
      computedStatus = "partial"
    } else {
      computedStatus = "overpaid"
    }

    // Try submitting payment
    try {
      const createdPayment = await addPaymentMutation({
        rentItemId: selectedItem.id,
        amount: newAmount,
        status: computedStatus,
        note,
      })
      onClose()
      setAmount(0)
      setNote("")
      toast.success("Payment added successfully!")
      refetch()
    } catch (error) {
      console.error("Payment submission failed", error)
      toast.error("Failed to add payment")
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
            <div key={rentItem.id} className="grid grid-cols-4 gap-6 border-b py-6">
              {/* Product Image */}
              <div className="flex justify-center items-center">
                <Image
                  src={
                    `/uploads/products/${rentItem.productVariant.product.images[0]?.url}` ||
                    "/placeholder.png"
                  }
                  alt={rentItem.productVariant.product.name}
                  width={100}
                  height={100}
                  className="w-24 h-24 object-cover rounded-md shadow"
                />
              </div>

              {/* Product Details */}
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-lg">{rentItem.productVariant.product.name}</p>
                <p className="text-gray-600">
                  {rentItem.startDate.toLocaleDateString()} –{" "}
                  {rentItem.endDate.toLocaleDateString()} (
                  {Math.ceil(
                    (new Date(rentItem.endDate).getTime() -
                      new Date(rentItem.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days)
                </p>
                <p className="text-gray-600">
                  Variant: {rentItem.productVariant.size} - {rentItem.productVariant.color.name}
                </p>
                <p className="text-gray-600">Qty: {rentItem.quantity}</p>
                <p className="text-gray-600">₱{rentItem.price.toFixed(2)}</p>
                <p className="font-semibold">
                  Total: ₱{(rentItem.price * rentItem.quantity).toFixed(2)}
                </p>
              </div>

              {/* Renter Details */}
              <div className="space-y-1 text-sm">
                <p className="font-semibold">
                  {rentItem.rent.user.personalInfo?.firstName}{" "}
                  {rentItem.rent.user.personalInfo?.middleName}{" "}
                  {rentItem.rent.user.personalInfo?.lastName}
                </p>
                <p>{rentItem.rent.user.email}</p>
                <p>{rentItem.rent.user.personalInfo?.phoneNumber}</p>
                <p>{rentItem.rent.deliveryAddress}</p>
                <p className="italic text-gray-600">Delivery: {rentItem.deliveryMethod}</p>
              </div>

              {/* Status + Actions */}
              <div className="flex flex-col items-start space-y-3">
                {/* Stepper */}

                <Stepper
                  activeStep={
                    rentItem.status === "pending"
                      ? 0
                      : rentItem.status === "rendering" ||
                        rentItem.status === "returned_damaged" ||
                        rentItem.status === "returned"
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
                    <StepLabel>
                      {rentItem.status === "returned_damaged" || rentItem.status === "returned"
                        ? "Returned"
                        : "On Hand"}
                    </StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>On Hand</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Returned</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Completed</StepLabel>
                  </Step>
                </Stepper>

                {/* Current Status */}
                <p
                  className={`px-3 py-1 text-xs rounded font-semibold ${
                    rentItem.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : rentItem.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : rentItem.status === "canceled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {rentItem.status}
                </p>

                {/* Buttons */}
                {rentItem.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(rentItem, "accept")}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(rentItem, "cancel")}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {rentItem.status === "completed" && (
                  <div className="space-y-2">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                      Payments
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                      Return Status
                    </button>
                  </div>
                )}

                {rentItem.status === "canceled" && (
                  <p className="text-red-500 font-medium">This order was canceled</p>
                )}
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
                slotProps={{
                  input: {
                    inputProps: {
                      max: selectedItem?.quantity,
                      min: 0,
                    },
                  },
                }}
                onChange={(e) => handleChangeOfDamageProduct(e.target.value)}
              />
            </div>

            <div className="flex justify-between mt-4 items-center">
              <div>Total Added Balance: {NumberOfDamageProduct * (selectedItem?.price ?? 0)}</div>

              <div>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  onClick={handleSubmitPenaltyFee}
                  disabled={isReturnDisabled}
                >
                  return
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
                  selectedItem?.basePrice + sumOfPFee ?? 0
                )}
              </p>
            </div>
            <div className="flex gap-4 text-lg">
              <p>
                Remaining Balance :{" "}
                {selectedItem?.status === "completed"
                  ? "No balance"
                  : `₱${Number(selectedItem?.basePrice + sumOfPFee - sumOfPayment).toFixed(2)}`}
                {/* {selectedItem?.status === "completed"
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
                    )} */}
              </p>
              <p>
                Penalty:{" "}
                {selectedItem?.status === "returned_damaged" || selectedItem?.status === "returned"
                  ? `₱${Number(selectedItem?.damagedFee).toFixed(2)}`
                  : "No Penalty"}
              </p>
            </div>
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={
                  selectedItem?.status === "completed" ||
                  selectedItem?.status === "canceled" ||
                  remainingBalance === 0 ||
                  isSubmitDisabled
                }
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
              disabled={remainingBalance === 0}
              onKeyDown={(e) => {
                // Block e, E, +, -, .
                if (["e", "E", "+", "-", "."].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              value={amount}
              onChange={(e) => {
                const input = e.target.value
                const numericValue = input.replace(/\D/g, "") // remove non-digits
                handleAmountChange(numericValue ? Number(numericValue) : 0)
              }}
              inputProps={{
                min: Math.ceil(remainingBalance / 2),
                max: remainingBalance,
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
                <MenuItem value="Is invalid">Is invalid</MenuItem>
                <MenuItem value="Amount is below the minimum partial payment.">
                  Amount is below the minimum partial payment.
                </MenuItem>
                <MenuItem value="Amount exceeds remaining balance!">
                  Amount exceeds remaining balance!
                </MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Payment Note"
              disabled={remainingBalance === 0}
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
