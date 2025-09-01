"use client"
import React, { useState, useEffect } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getRentItemsByShop from "../../queries/getRentItemsByShop"
import {
  Chip,
  Box,
  FormControl,
  MenuItem,
  Modal,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Checkbox,
  InputAdornment,
} from "@mui/material"

import CloseIcon from "@mui/icons-material/Close"
import CheckIcon from "@mui/icons-material/Check"
import CircleIcon from "@mui/icons-material/Circle"
import { StepIconProps } from "@mui/material/StepIcon"
import StepIcon from "@mui/material/StepIcon"

import HourglassBottomIcon from "@mui/icons-material/HourglassBottom"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import Inventory2Icon from "@mui/icons-material/Inventory2"
import UndoIcon from "@mui/icons-material/Undo"
import DoneAllIcon from "@mui/icons-material/DoneAll"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"

import Image from "next/image"
// import addPayment from "../../mutations/addPayment"
import addPayment from "../../mutations/addPaymentNew"
import updateRentStatus from "../../mutations/updateRentStatus"

import getPaymentByRentId from "../../queries/getPaymentByRentId"
import getCurrentUser from "./../../users/queries/getCurrentUser"
import { toast } from "sonner"
import { set } from "zod"

// with stepper
const steps = ["Pending", "Paid", "Confirmed"]

const statuses = [
  { value: "ALL", label: "ALL" },
  { value: "pending", label: "PENDING" },
  { value: "accepted", label: "ACCEPTED" },
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
  // third
  // const [paymentStatusdd, setPaymentStatusdd] = useState("pending")
  // const stepsdd = ["Damage Report", "Payment Pending", "Payment Completed"]

  // second
  // const [statusdd] = useState("pending") // pending | completed
  const conditions = ["Good", "Damaged", "Late"]

  // first
  const [paymentStatus, setPaymentStatus] = useState("pending") // pending | paid | failed
  const paymentMethods = ["GCash", "Bank Transfer", "Cash"]
  const paymentType = ["full", "partial"]

  // const rentAmount = 1050
  // const repairFee = 180

  // paidAmount - payNow
  // const paidAmount = 500
  // const payNow = 500

  // boolean
  // const amountError = false
  // const disableConfirm = false

  // balance = maxPay
  // const balance = rentAmount - paidAmount
  // const maxPay = rentAmount - paidAmount
  // const totalAmount = balance + repairFee

  // selectedMethod = paymentType
  // const [selectedMethod, setSelectedMethod] = useState("Cash")
  // const [paymentType, setPaymentType] = useState("full")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash")
  const [selectedPaymentType, setSelectedPaymentType] = useState("full")
  const [payNow, setPayNow] = useState(0)
  const [amountError, setAmountError] = useState(false)
  const [disableConfirm, setDisableConfirm] = useState(false)

  // RETURN
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const [returnQty, setReturnQty] = useState(1)

  const [deductedQty, setDeductedQty] = useState(0)
  const [repairFee, setRepairFee] = useState(0)
  const [repairQty, setRepairQty] = useState(0)
  const [replacementFee, setReplacementFee] = useState(0)
  const [replacementQty, setReplacementQty] = useState(0)

  const [repairLevel, setRepairLevel] = useState(1)

  const [damageSeverity, setDamageSeverity] = useState("")
  const [damageSeverityValue, setDamageSeverityValue] = useState(0)
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([])
  const [repairQuantities, setRepairQuantities] = useState<{ [key: string]: number }>({
    minor: 0,
    moderate: 0,
    major: 0,
  })
  const [repairFees, setRepairFees] = useState<{ [key: string]: number }>({
    minor: 0,
    moderate: 0,
    major: 0,
  })
  const [totalFee, setTotalFee] = useState(0)

  const repairCost = selectedItem?.productVariant?.repairCost ?? 0
  const replacementCost = selectedItem?.productVariant?.replacementCost ?? 0

  useEffect(() => {
    // const allRepairQuantities = Object.values(repairQuantities).reduce(
    //   (sum, qty) => sum + Number(qty),
    //   0
    // )
    const allRepairQuantities = Object.entries(repairQuantities).reduce(
      (acc, [name, qty]) => {
        acc.total += Number(qty)
        acc.details.push({ name, qty })
        return acc
      },
      { total: 0, details: [] as { name: string; qty: number }[] }
    )

    const totalQty = repairQty + replacementQty + allRepairQuantities.total
    if (totalQty > selectedItem?.quantity) return

    const repairFeeTotal = repairCost * repairQty
    const replacementFeeTotal = replacementCost * replacementQty
    let allRepairFeeTotal = 0
    allRepairQuantities.details.forEach((detail) => {
      const severityPercent = selectedItem?.productVariant?.damagePolicies?.find(
        (policy: any) => policy.damageSeverity === detail.name
      )?.damageSeverityPercent

      const repairFeeSeverity = replacementCost * (severityPercent / 100) * detail.qty

      allRepairFeeTotal += repairFeeSeverity

      setRepairFees((prev) => ({
        ...prev,
        [detail.name]: repairFeeSeverity,
      }))
    })

    setDeductedQty(totalQty)
    setRepairFee(repairFeeTotal)
    setReplacementFee(replacementFeeTotal)
    setTotalFee(repairFeeTotal + replacementFeeTotal + allRepairFeeTotal)
  }, [repairQty, replacementQty, repairQuantities])

  const handleRepairCheck = (key: string, checked: boolean) => {
    setSelectedRepairs((prev) => (checked ? [...prev, key] : prev.filter((r) => r !== key)))
  }

  const handleRepairQuantityChange = (key: string, value: number) => {
    setDamageSeverity(key)
    setDamageSeverityValue(value)
    setRepairQuantities((prev) => ({ ...prev, [key]: value }))
  }

  const handleRepairFeeChange = (key: string, value: number) => {
    setRepairFees((prev) => ({ ...prev, [key]: value }))
  }

  const handleReturnConfirm = () => {
    console.log("test")
  }

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "full":
        return "success"
      case "partial":
        return "warning"
      case "failed":
      case "canceled":
        return "error"
      default:
        return "default"
    }
  }

  const transactions: any[] = [
    {
      id: 1,
      date: new Date(),
      // amount: paidAmount,
      amount: 430,
      status: "partial",
    },
    {
      id: 2,
      date: new Date(),
      amount: 100,
      // amount: paidAmount,
      status: "gooding",
    },
  ]

  const handleConfirmPayment = async () => {
    try {
      const newPayment = await addPaymentMutation({
        rentItemId: selectedItem.id,
        amount: payNow,
        status: selectedPaymentType,
        note: "Payment completed",
      })
      alert("Payment completed successfully!")
      onClose()
      refetch()
      // if (newPayment.status === "full") {
      //   setDisableConfirm(true)
      // }
      console.log(selectedPaymentType)
      // setSelectedItem()
    } catch (error) {
      alert("Failed to complete payment")
    }
  }

  const onChangePaymentType = (minimum: number, value: string) => {
    setSelectedPaymentType(value)
    setPayNow(minimum)
    setAmountError(false)
    console.log(payNow)
  }

  const onChangeAmount = (value: number, maxPay: number, minimum: number) => {
    value > maxPay || value < minimum ? setAmountError(true) : setAmountError(false)

    if (value === maxPay) {
      setSelectedPaymentType("full")
    }

    setPayNow(value)
  }

  // with stepper
  const statuse = "pending"
  const activeStep = statuse === "pending" ? 0 : statuse === "paid" ? 1 : 2

  // const [paymentStatus, setPaymentStatus] = useState("full")
  const [returnStatus, setReturnStatus] = useState("")
  const [repairCostType, setRepairCostType] = useState("")

  const handleSave = () => {
    console.log({
      paymentStatus,
      returnStatus,
      repairCostType,
    })
    onClose()
  }

  const [loadingAction, setLoadingAction] = useState<null | "accept" | "cancel">(null)

  const [selectedReason, setSelectedReason] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [cancelOpen, setCancelOpen] = useState(false)
  const [renterId, setRenterId] = useState(0)

  const reasons = [
    "No stock available – The product is not available at the moment.",
    "Item already rented out – Another customer has already taken the item.",
    "Item damaged / under maintenance – The product cannot be rented due to issues.",
    "Owner unavailable – The owner is not available to proceed with the transaction.",
    "Schedule conflict – The requested rental dates are not possible.",
    "Incorrect listing / details – The product information was inaccurate.",
    "Payment / verification issue – Transaction cannot proceed due to missing verification.",
    "Safety or policy concern – The owner canceled because it didn’t meet rental policies.",
    "Changed mind – The owner decided not to proceed with the rental.",
    "Other",
  ]

  const handleConfirm = async () => {
    const noteMessage = selectedReason === "Other" ? customReason : selectedReason
    if (!noteMessage) return // Prevent confirm without reason

    console.log(noteMessage)

    try {
      setLoadingAction("cancel")
      await updateRentStatusMutation({
        rentItemId: renterId,
        action: "cancel",
        noteMessage: noteMessage,
      })
      setCancelOpen(false)
      await refetch()
    } catch (error) {
      console.error("Failed to update rent status:", error)
    } finally {
      setLoadingAction(null)
    }
  }
  // onConfirm(note);
  // setSelectedReason("");
  // setCustomReason("");

  const cancelClose = () => {
    setCancelOpen(false)
  }

  const [currentUser] = useQuery(getCurrentUser, null)
  const shopId = currentUser?.shop?.id

  // Only fetch rent items if shopId exists
  const [rentItems = [], { refetch }] = useQuery(
    getRentItemsByShop,
    shopId ? { shopId } : { shopId: 0 },
    { enabled: !!shopId }
  )

  const [statusFilter, setStatusFilter] = useState("ALL")
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
    console.log(rentItems)
    setOpenComplete(true)
    setSelectedItem(rentItem)
    setSelectedPaymentType("full")

    const rentAmount = rentItem.quantity * rentItem.price
    const repairFee =
      rentItem.payments?.reduce(
        (total: number, payment: { penaltyFee: number }) => total + payment.penaltyFee,
        0
      ) ?? 0
    const paidAmount =
      rentItem.payments?.reduce(
        (total: number, payment: { amount: number }) => total + payment.amount,
        0
      ) ?? 0

    const toPayNow = rentAmount + repairFee - paidAmount

    setPayNow(toPayNow)
    setDisableConfirm(toPayNow === 0 ? true : false)
  }

  const handleCloseComplete = () => {
    setOpenComplete(false)
    setValueOfDamageProduct(0)
    setSelectedPaymentType("full")
    setAmountError(false)
  }

  const [openReturnRepairReplacement, setOpenReturnRepairReplacement] = useState(false)

  const handleOpenReturnRepairReplacement = (rentItem: any) => {
    console.log(rentItem)
    setOpenReturnRepairReplacement(true)
    setSelectedItem(rentItem)
  }

  const handleCloseReturnRepairReplacement = () => {
    setRepairFees((prev) =>
      Object.keys(prev).reduce((acc: any, key: string) => {
        acc[key] = 0
        return acc
      }, {})
    )

    setRepairQuantities((prev) =>
      Object.keys(prev).reduce((acc: any, key: string) => {
        acc[key] = 0
        return acc
      }, {})
    )

    setDeductedQty(0)
    setRepairFee(0)
    setRepairQty(0)
    setReplacementFee(0)
    setReplacementQty(0)
    setTotalFee(0)
    setOpenReturnRepairReplacement(false)
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
    if (action === "cancel") {
      // Open modal first, don't call mutation yet
      setCancelOpen(true)
      setRenterId(rentItem.id)
      return
    }

    try {
      setLoadingAction(action)
      await updateRentStatusMutation({
        rentItemId: rentItem.id,
        action,
        noteMessage: "accepted",
      })
      await refetch()
    } catch (error) {
      console.error("Failed to update rent status:", error)
    } finally {
      setLoadingAction(null)
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
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
            <h1 className="font-bold text-xl">
              Rent Items for Shop {currentUser?.shop?.shopName ?? "..."}
            </h1>
            <TextField
              id="outlined-select-status"
              select
              label="Filter by Status"
              value={statusFilter}
              className="w-full md:w-48"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
          </div>

          {/* Orders */}
          {filteredRentItems.length === 0 ? (
            <div className="text-center text-gray-500">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              {filteredRentItems.map((rentItem) => (
                <div
                  key={rentItem.id}
                  className="grid grid-cols-1 md:grid-cols-5 gap-6 border-b py-6"
                >
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

                  {/* Status + Stepper (occupies 2 columns) */}
                  <div className="flex flex-col items-start space-y-3 md:col-span-2">
                    <Stepper
                      activeStep={
                        rentItem.status === "pending" ||
                        rentItem.status === "accepted" ||
                        rentItem.status === "canceled"
                          ? 0
                          : rentItem.status === "rendering" ||
                            rentItem.status === "on_hand" ||
                            rentItem.status === "returned"
                          ? 1
                          : rentItem.status === "completed"
                          ? 2
                          : 0
                      }
                    >
                      <Step
                        completed={
                          rentItem.status !== "pending" &&
                          rentItem.status !== "accepted" &&
                          rentItem.status !== "canceled"
                        }
                      >
                        <StepLabel
                          StepIconComponent={(props) =>
                            rentItem.status === "canceled" ? (
                              <CloseIcon sx={{ color: "red" }} />
                            ) : (
                              <StepIcon {...props} />
                            )
                          }
                          sx={{
                            "& .MuiStepLabel-label": {
                              color: rentItem.status === "canceled" ? "red" : "",
                            },
                            // "& .MuiStepIcon-root": {
                            //   color:
                            //     rentItem.status === "canceled"
                            //       ? "red"
                            //       : "",
                            // },
                          }}
                        >
                          {rentItem.status === "pending"
                            ? "Pending"
                            : rentItem.status === "canceled"
                            ? "Canceled"
                            : "Accepted"}
                        </StepLabel>
                      </Step>
                      <Step
                        completed={
                          rentItem.status === "returned" ||
                          rentItem.status === "returned_damaged" ||
                          rentItem.status === "completed"
                        }
                      >
                        <StepLabel>
                          {rentItem.status === "returned_damaged" ||
                          rentItem.status === "returned" ||
                          rentItem.status === "completed"
                            ? "Returned"
                            : "On Hand"}
                        </StepLabel>
                      </Step>
                      <Step completed={rentItem.status === "completed"}>
                        <StepLabel>Completed</StepLabel>
                      </Step>
                    </Stepper>

                    {/* Current Status */}
                    <p
                      className={`uppercase px-3 py-1 text-xs rounded font-semibold ${
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
                          disabled={loadingAction === "accept"}
                          onClick={() => handleAction(rentItem, "accept")}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                        >
                          {loadingAction === "accept" ? (
                            <CircularProgress size={20} sx={{ color: "white" }} />
                          ) : (
                            "Accept"
                          )}
                        </button>
                        <button
                          disabled={loadingAction === "cancel"}
                          onClick={() => handleAction(rentItem, "cancel")}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                        >
                          {loadingAction === "cancel" ? (
                            <CircularProgress size={20} sx={{ color: "white" }} />
                          ) : (
                            "Cancel"
                          )}
                        </button>
                      </div>
                    )}

                    {(rentItem.status === "accepted" ||
                      rentItem.status === "rendering" ||
                      rentItem.status === "on_hand" ||
                      rentItem.status === "returned" ||
                      rentItem.status === "returned_damaged" ||
                      rentItem.status === "completed") && (
                      <div className="space-y-2 space-x-2">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                          onClick={() => handleOpenComplete(rentItem)}
                        >
                          Payments
                        </button>
                        <button
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                          onClick={() => handleOpenReturnRepairReplacement(rentItem)}
                        >
                          Return Status
                        </button>
                      </div>
                    )}

                    {rentItem.status === "canceled" && (
                      <p className="text-red-500 font-medium">This order was canceled</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* reason */}
      <Dialog open={cancelOpen} onClose={cancelClose} fullWidth>
        <DialogTitle>Cancel Rental</DialogTitle>
        <DialogContent>
          <RadioGroup value={selectedReason} onChange={(e) => setSelectedReason(e.target.value)}>
            {reasons.map((reason, index) => (
              <FormControlLabel key={index} value={reason} control={<Radio />} label={reason} />
            ))}
          </RadioGroup>

          {selectedReason === "Other" && (
            <TextField
              fullWidth
              label="Custom Reason"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              margin="dense"
            />
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={cancelClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            color="error"
            variant="contained"
            disabled={!selectedReason || (selectedReason === "Other" && !customReason)}
          >
            Confirm Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {selectedItem && (
        <Dialog
          open={openReturnRepairReplacement}
          onClose={handleCloseReturnRepairReplacement}
          fullWidth
          maxWidth="sm"
        >
          {(() => {
            return (
              <>
                <DialogTitle>
                  Return Items
                  <div className="flex gap-6 mt-2">
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "primary.main" }}>
                      Quantity to Return: {selectedItem.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "error.main" }}>
                      Remaining Quantity: {selectedItem.quantity - deductedQty}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "warning.main" }}>
                      Total Fee: ₱{totalFee}
                    </Typography>
                  </div>
                </DialogTitle>
                <DialogContent>
                  {/* Replacement Fee with Qty + Fee */}
                  <div className="mt-4">
                    <h4 className="mb-2 font-semibold">Default Replacement Fee</h4>
                    <div className="flex items-center gap-4 mb-2">
                      <TextField
                        type="number"
                        label="UnitFee"
                        value={replacementCost}
                        slotProps={{
                          input: {
                            readOnly: true,
                            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                          },
                        }}
                        className="flex-1"
                      />
                      x
                      <TextField
                        type="number"
                        label="Qty"
                        value={replacementQty}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          const max = selectedItem.quantity - deductedQty + replacementQty

                          if (val > max) {
                            setReplacementQty(max)
                            return
                          }

                          setReplacementQty(Number(e.target.value))
                        }}
                        className="flex-1"
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            max: selectedItem.quantity - deductedQty + replacementQty,
                          },
                        }}
                      />
                      =
                      <TextField
                        type="number"
                        label="Fee"
                        value={replacementFee}
                        slotProps={{
                          input: {
                            readOnly: true,
                            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                          },
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Manual Repair Fee with Qty + Fee */}
                  <div className="mt-4">
                    <h4 className="mb-2 font-semibold">Default Repair Fee</h4>
                    <div className="flex items-center gap-4 mb-2">
                      <TextField
                        type="number"
                        label="UnitFee"
                        value={repairCost}
                        slotProps={{
                          input: {
                            readOnly: true,
                            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                          },
                        }}
                        className="flex-1"
                      />
                      x
                      <TextField
                        type="number"
                        label="Qty"
                        value={repairQty}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          const max = selectedItem.quantity - deductedQty + repairQty

                          if (val > max) {
                            setRepairQty(max)
                            return
                          }
                          setRepairQty(Number(e.target.value))
                        }}
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            max: selectedItem.quantity - deductedQty + repairQty,
                          },
                        }}
                        className="flex-1"
                      />
                      =
                      <TextField
                        type="number"
                        label="Fee"
                        value={repairFee}
                        slotProps={{
                          input: {
                            readOnly: true,
                            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                          },
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Repair Fees with Quantity */}
                  <div className="mt-4">
                    <h4 className="mb-2 font-semibold">
                      Repair Percentage Fees
                      <small className="ml-2 text-red-500">
                        (percentage based on replacement fee)
                      </small>
                    </h4>
                    {selectedItem.productVariant.damagePolicies?.map((repair: any) => {
                      const label = `${repair.damageSeverity} Repair (${repair.damageSeverityPercent}%)`

                      return (
                        <div key={repair.id} className="flex items-center gap-4 mb-2">
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold", color: "primary.main" }}
                            className="flex-1 capitalize"
                          >
                            {label}
                          </Typography>
                          x
                          <TextField
                            type="number"
                            label="Qty"
                            value={repairQuantities[repair.damageSeverity]}
                            onChange={(e) => {
                              const val = Number(e.target.value)
                              const max =
                                selectedItem.quantity -
                                deductedQty +
                                repairQuantities[repair.damageSeverity]

                              if (val > max) {
                                setRepairQuantities((prev) => ({
                                  ...prev,
                                  [repair.damageSeverity]: max,
                                }))
                                return
                              }

                              setRepairQuantities((prev) => ({
                                ...prev,
                                [repair.damageSeverity]: e.target.value,
                              }))
                            }}
                            // disabled={!selectedRepairs.includes(repair.key)}
                            slotProps={{
                              htmlInput: {
                                min: 0,
                                max:
                                  selectedItem.quantity -
                                  deductedQty +
                                  repairQuantities[repair.damageSeverity],
                              },
                            }}
                            className="flex-1"
                          />
                          =
                          <TextField
                            type="number"
                            label="Fee"
                            value={repairFees[repair.damageSeverity] ?? 0}
                            // value={repairFees[repair.key] || ""}
                            // onChange={(e) =>
                            //   handleRepairFeeChange(repair.key, Number(e.target.value))
                            // }
                            // disabled={!selectedRepairs.includes(repair.key)}
                            className="flex-1"
                            slotProps={{
                              input: {
                                startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                              },
                            }}
                          />
                        </div>
                      )
                    })}
                    {/* {[
                      { key: "minor", label: "Minor Repair (10%)" },
                      { key: "moderate", label: "Moderate Repair (30%)" },
                      { key: "major", label: "Major Repair (60%)" },
                    ].map((repair) => (
                      <div key={repair.key} className="flex items-center gap-4 mb-2">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedRepairs.includes(repair.key)}
                              onChange={(e) => handleRepairCheck(repair.key, e.target.checked)}
                            />
                          }
                          label={repair.label}
                          className="flex-1"
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", color: "primary.main" }}
                          className="flex-1"
                        >
                          {repair.label}
                        </Typography>
                        x
                        <TextField
                          type="number"
                          label="Qty"
                          value={repairQuantities[repair.key] || ""}
                          onChange={(e) =>
                            handleRepairQuantityChange(repair.key, Number(e.target.value))
                          }
                          disabled={!selectedRepairs.includes(repair.key)}
                          className="flex-1"
                        />
                        =
                        <TextField
                          type="number"
                          label="Fee"
                          value={repairFees[repair.key] || ""}
                          onChange={(e) =>
                            handleRepairFeeChange(repair.key, Number(e.target.value))
                          }
                          disabled={!selectedRepairs.includes(repair.key)}
                          className="flex-1"
                          slotProps={{
                            input: {
                              startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                            }
                          }}
                        />
                      </div>
                    ))} */}
                  </div>

                  {/* Total Fee */}
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Fee"
                    value={totalFee}
                    slotProps={{
                      input: {
                        readOnly: true,
                      },
                    }}
                    margin="dense"
                  />
                </DialogContent>

                <DialogActions>
                  <Button onClick={handleCloseReturnRepairReplacement} color="inherit">
                    Cancel
                  </Button>
                  <Button onClick={handleReturnConfirm} variant="contained" color="primary">
                    Confirm Return
                  </Button>
                </DialogActions>
              </>
            )
          })()}
        </Dialog>
      )}

      {selectedItem && (
        <Dialog open={openComplete} onClose={handleCloseComplete} fullWidth maxWidth="sm">
          {(() => {
            // ✅ compute values here based on selectedRentItem
            const rentAmount = selectedItem.quantity * selectedItem.price
            const repairFee =
              selectedItem.payments?.reduce(
                (total: number, payment: { penaltyFee: number }) => total + payment.penaltyFee,
                0
              ) ?? 0
            const paidAmount =
              selectedItem.payments?.reduce(
                (total: number, payment: { amount: number }) => total + payment.amount,
                0
              ) ?? 0
            const maxPay = rentAmount - paidAmount
            const balance = rentAmount - paidAmount
            const totalAmount = rentAmount + repairFee

            const minimum = Math.ceil(balance / 2)

            return (
              <>
                <DialogTitle>Rental Payment</DialogTitle>
                <DialogContent dividers>
                  {/* Payment Summary */}
                  <Typography variant="h6" gutterBottom>
                    Payment Summary
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1">Rent Amount: ₱{rentAmount}</Typography>
                    <Typography variant="body1">Repair / Replacement Fee: ₱{repairFee}</Typography>
                    <Typography variant="body1" fontWeight="bold">
                      Total Amount: ₱{totalAmount}
                    </Typography>
                    <Typography variant="body1" color="primary">
                      Paid: ₱{paidAmount}
                    </Typography>
                    <Typography variant="body1" color={balance > 0 ? "error" : "success"}>
                      Balance: ₱{balance}
                    </Typography>
                  </Box>

                  {/* Payment Type */}
                  <FormControl component="fieldset" fullWidth margin="dense">
                    <FormLabel>Payment Type</FormLabel>
                    <RadioGroup
                      row
                      value={selectedPaymentType}
                      onChange={(e) => onChangePaymentType(minimum, e.target.value)}
                      // onChange={(e) => setSelectedPaymentType(e.target.value)}
                    >
                      <FormControlLabel
                        value="full"
                        control={<Radio />}
                        label={`Full (₱${maxPay})`}
                      />
                      <FormControlLabel value="partial" control={<Radio />} label="Partial" />
                    </RadioGroup>
                  </FormControl>

                  {/* Amount (only for Partial, auto-filled/disabled for Full) */}
                  <TextField
                    label="Amount to Pay Now (₱)"
                    type="number"
                    fullWidth
                    margin="dense"
                    value={selectedPaymentType === "full" ? maxPay : payNow}
                    onChange={(e) => onChangeAmount(Number(e.target.value), maxPay, minimum)}
                    // disabled={selectedPaymentType === "full" || maxPay === 0}
                    slotProps={{
                      input: {
                        readOnly: selectedPaymentType === "full" || maxPay === 0,
                      },
                    }}
                    error={amountError}
                    helperText={
                      selectedPaymentType === "full"
                        ? maxPay > 0
                          ? "Will pay the remaining balance in full."
                          : "No balance remaining."
                        : amountError
                        ? `Enter an amount between ₱${minimum} and ₱${maxPay}.`
                        : `Max you can pay now: ₱${maxPay}.`
                    }
                  />

                  {/* Payment Method */}
                  <TextField
                    select
                    label="Payment Method"
                    fullWidth
                    margin="normal"
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  >
                    {paymentMethods.map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* Status as Chip */}
                  <Typography variant="subtitle2" gutterBottom>
                    Status:
                  </Typography>
                  <Chip
                    label={
                      selectedItem.payments.length > 0
                        ? selectedItem.payments[
                            selectedItem.payments.length - 1
                          ].status.toUpperCase()
                        : "NO RECORDS"
                    }
                    color={
                      selectedItem.payments?.[selectedItem.payments.length - 1]?.status
                        ? getStatusColor(selectedItem.payments[0].status)
                        : "default"
                    }
                    sx={{ mb: 2 }}
                  />
                  {/* Transaction History */}
                  <Typography variant="subtitle2" gutterBottom>
                    Transaction History:
                  </Typography>
                  {selectedItem.payments.length > 0 ? (
                    [...selectedItem.payments].reverse().map((pm: any) => (
                      <Typography key={pm.id} variant="body2" color="text.secondary">
                        {pm.createdAt instanceof Date
                          ? pm.createdAt.toLocaleString()
                          : String(pm.date)}{" "}
                        — ₱{pm.amount} — {pm.status}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No transactions yet.
                    </Typography>
                  )}
                </DialogContent>

                <DialogActions>
                  <Button onClick={handleCloseComplete}>Cancel</Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={disableConfirm}
                    onClick={
                      () => handleConfirmPayment()
                      // handleConfirmPayment({
                      //   amount: paymentType === "full" ? maxPay : payNow,
                      //   type: paymentType,
                      //   method: selectedMethod,
                      // })
                    }
                  >
                    {balance <= 0
                      ? "Paid in Full"
                      : selectedPaymentType === "full"
                      ? `Pay ₱${maxPay}`
                      : "Confirm Payment"}
                  </Button>
                </DialogActions>
              </>
            )
          })()}
        </Dialog>
      )}

      {/* <Dialog 
        open={openReturnRepairReplacement} 
        onClose={handleCloseReturnRepairReplacement} 
        fullWidth 
        maxWidth="sm"
      > */}
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        {/* <Dialog open={openComplete} onClose={handleCloseComplete} fullWidth maxWidth="sm"> */}
        <DialogTitle>Return Item</DialogTitle>
        <DialogContent dividers>
          <TextField
            select
            label="Return Condition"
            fullWidth
            margin="normal"
            defaultValue={conditions[0]}
          >
            {conditions.map((cond) => (
              <MenuItem key={cond} value={cond}>
                {cond}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Owner Notes"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            placeholder="e.g. Missing parts, scratches..."
          />

          {/* Status */}
          <Typography variant="subtitle2" gutterBottom>
            Status:
          </Typography>
          <Chip
            label={paymentStatus === "pending" ? "Pending Inspection" : "Completed"}
            color={paymentStatus === "pending" ? "warning" : "success"}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseComplete}>Close</Button>
          <Button variant="contained" color="primary">
            Confirm Return
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
      // open={openReturnRepairReplacement}
      // onClose={handleCloseReturnRepairReplacement}
      // fullWidth
      // maxWidth="sm"
      >
        <DialogTitle>Return Items</DialogTitle>
        <DialogContent>
          {/* Quantity */}
          <TextField
            fullWidth
            type="number"
            label="Quantity to Return"
            value={returnQty}
            onChange={(e) => setReturnQty(Number(e.target.value))}
            margin="dense"
          />

          {/* Manual Repair Fee */}
          <TextField
            fullWidth
            type="number"
            label="Manual Repair Fee (₱)"
            value={repairFee}
            onChange={(e) => setRepairFee(Number(e.target.value))}
            margin="dense"
          />

          {/* Replacement Fee */}
          <TextField
            fullWidth
            type="number"
            label="Replacement Fee (₱)"
            value={replacementFee}
            onChange={(e) => setReplacementFee(Number(e.target.value))}
            margin="dense"
          />

          {/* Repair Percentage Fee */}
          <FormLabel component="legend" sx={{ mt: 2 }}>
            Repair Fee Percentage
          </FormLabel>
          <RadioGroup value={repairLevel} onChange={(e) => setRepairLevel(e.target.value)}>
            <FormControlLabel value="minor" control={<Radio />} label="Minor Repair (10%)" />
            <FormControlLabel value="moderate" control={<Radio />} label="Moderate Repair (30%)" />
            <FormControlLabel value="major" control={<Radio />} label="Major Repair (60%)" />
          </RadioGroup>

          {/* Total Fee */}
          <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 2 }}>
            <Typography variant="subtitle1">Total Fee: ₱{totalFee.toLocaleString()}</Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseReturnRepairReplacement} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleReturnConfirm}
            color="primary"
            variant="contained"
            disabled={returnQty <= 0}
          >
            Confirm Return
          </Button>
        </DialogActions>
      </Dialog>

      {/* <Modal open={openComplete} onClose={handleCloseComplete}>
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
      </Modal> */}
    </>
  )
}

export default OrderList
