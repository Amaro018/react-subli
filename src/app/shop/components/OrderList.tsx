"use client"
import React, { useState, useEffect, useMemo, useCallback, memo } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getRentItemsByShop from "../../queries/getRentItemsByShop"
import {
  Chip,
  Box,
  FormControl,
  MenuItem,
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
  InputAdornment,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Alert,
} from "@mui/material"

import CloseIcon from "@mui/icons-material/Close"
import StepIcon from "@mui/material/StepIcon"

import Image from "next/image"
// import addPayment from "../../mutations/addPayment"
import addPayment from "../../mutations/addPaymentNew"
import updateRentStatus from "../../mutations/updateRentStatus"
import updateReturnStatus from "../../mutations/updateReturnStatus"

import getPaymentByRentId from "../../queries/getPaymentByRentId"
import getCurrentUser from "./../../users/queries/getCurrentUser"
import { toast } from "sonner"

const statuses = [
  { value: "ALL", label: "ALL" },
  { value: "pending", label: "PENDING" },
  { value: "accepted", label: "ACCEPTED" },
  { value: "rendering", label: "ON HAND" },
  { value: "completed", label: "COMPLETED" },
  { value: "canceled", label: "CANCELED" },
  { value: "returned", label: "RETURNED" },
]

type RentItemType = {
  id: number
}

type Charge = {
  id: number
  type: "damaged" | "late"
  subType: "repair" | "replacement"
  repairType: "minor" | "moderate" | "major"
  amount: number
  quantity: number
}

// Depreciation Logic Helpers
const DEPRECIATION_RATES: Record<string, number> = {
  Electronics: 0.3, // 30% per year
  Furniture: 0.1, // 10% per year
  Tools: 0.1,
  Luxury: 0.0, // No depreciation
  Vintage: 0.0,
  Default: 0.2, // 20% fallback
}

const calculateCurrentValue = (
  originalPrice: number,
  purchaseDate: string | Date,
  originalMSRP: number,
  originalPurchaseDate: string | Date,
  depreciationRate = 0.2,
  minFloorPercent = 0.1
) => {
  if (!originalPrice || !purchaseDate) return originalPrice || 0
  if (!originalMSRP || !originalPurchaseDate) return originalMSRP || 0

  const bought = new Date(originalPurchaseDate)
  const now = new Date()

  // Calculate age in years
  const diffTime = Math.abs(now.getTime() - bought.getTime())
  const ageInYears = diffTime / (1000 * 60 * 60 * 24 * 365)

  // Fairness Formula: Original Price * (1 - Rate) ^ Age
  const currentValue = originalMSRP * Math.pow(1 - depreciationRate, ageInYears)
  const floorValue = originalMSRP * minFloorPercent

  return Math.max(floorValue, currentValue)
}

const RentItemRow = memo(function RentItemRow({
  rentItem,
  loadingAction,
  handleAction,
  handleOpenComplete,
  handleOpenReturnRepairReplacement,
}: any) {
  const isReturned = rentItem.status === "returned" || rentItem.status === "returned_damaged"
  const handItems = rentItem.payments?.some(
    (payment: any) => payment.status === "partial" || payment.status === "full"
  )

  const canShowActions = [
    "accepted",
    "rendering",
    "on_hand",
    "returned",
    "returned_damaged",
    "completed",
  ].includes(rentItem.status)

  const variantDisplay = rentItem.productVariant.attributes
    .map((attr: any) => attr.attributeValue.value)
    .join(" / ")

  const isProductArchived = rentItem?.productVariant?.product?.status === "deleted"

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 border-b py-6">
      {/* Product Image */}
      <div className="flex justify-center items-center">
        <Image
          src={
            rentItem.productVariant.product.images[0]
              ? `/uploads/products/${rentItem.productVariant.product.images[0].url}`
              : "/placeholder.png"
          }
          alt={rentItem.productVariant.product.name}
          width={100}
          height={100}
          className="w-24 h-24 object-cover rounded-md shadow"
        />
      </div>

      {/* Product Details */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-lg">{rentItem.productVariant.product.name}</p>
          {isProductArchived && (
            <Chip
              label="Archived Product"
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                fontWeight: "bold",
                bgcolor: "#fee2e2",
                color: "#991b1b",
                border: "none",
              }}
            />
          )}
        </div>
        <p className="text-gray-600">
          {rentItem.startDate.toLocaleDateString()} – {rentItem.endDate.toLocaleDateString()} (
          {Math.ceil(
            (new Date(rentItem.endDate).getTime() - new Date(rentItem.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )}{" "}
          days)
        </p>
        <p className="text-gray-600">Variant: {variantDisplay || "Default"}</p>
        <p className="text-gray-600">Qty: {rentItem.quantity}</p>
        <p className="text-gray-600">₱{rentItem.price.toFixed(2)}</p>
        <p className="font-semibold">Total: ₱{(rentItem.price * rentItem.quantity).toFixed(2)}</p>
      </div>

      {/* Renter Details */}
      <div className="space-y-1 text-sm">
        <p className="font-semibold">
          {rentItem.rent.user.personalInfo?.firstName} {rentItem.rent.user.personalInfo?.middleName}{" "}
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
                "& .MuiStepLabel-label": { color: rentItem.status === "canceled" ? "red" : "" },
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

        {canShowActions && (
          <div className="space-y-2 space-x-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => handleOpenComplete(rentItem)}
            >
              Payments
            </button>
            <button
              className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700"
              onClick={() => handleOpenReturnRepairReplacement(rentItem, isReturned, handItems)}
            >
              {isReturned ? "View Returned Items" : handItems ? "Return Items" : "Hand Items"}
            </button>
          </div>
        )}
        {rentItem.status === "canceled" && (
          <p className="text-red-500 font-medium">This order was canceled</p>
        )}
      </div>
    </div>
  )
})

export const OrderList: any = () => {
  const paymentMethods = ["GCash", "Bank Transfer", "Cash"]

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("Cash")
  const [selectedPaymentType, setSelectedPaymentType] = useState("full")
  const [payNow, setPayNow] = useState(0)
  const [amountError, setAmountError] = useState(false)
  const [disableConfirm, setDisableConfirm] = useState(false)

  // RETURN
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const [deductedQty, setDeductedQty] = useState(0)
  const [goodQty, setGoodQty] = useState(0)
  const [repairFee, setRepairFee] = useState(0)
  const [repairQty, setRepairQty] = useState(0)
  const [replacementFee, setReplacementFee] = useState(0)
  const [replacementQty, setReplacementQty] = useState(0)
  const [manualCost, setManualCost] = useState(0)
  const [manualFee, setManualFee] = useState(0)
  const [manualQty, setManualQty] = useState(0)
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([])
  const [repairQuantities, setRepairQuantities] = useState<{ [key: string]: number }>({})
  const [repairFees, setRepairFees] = useState<{ [key: string]: number }>({})
  const [totalFee, setTotalFee] = useState(0)

  // Advanced Resolution Workflow Modifiers
  const [isGrossNegligence, setIsGrossNegligence] = useState(false)
  const [chargeLossOfUse, setChargeLossOfUse] = useState(false)
  const [shopKeepsSalvage, setShopKeepsSalvage] = useState(false)

  const repairCost = selectedItem?.productVariant?.manualRepairCost ?? 0
  const replacementCost = selectedItem?.productVariant?.replacementCost ?? 0

  // Calculate Fair Market Value Cap
  const currentFairValue = React.useMemo(() => {
    if (!selectedItem?.productVariant) return Infinity

    const category = selectedItem.productVariant.product?.category
    const rate =
      category?.annualDepreciationRate ?? DEPRECIATION_RATES[category?.name || "Default"] ?? 0.2
    const minPercent = category?.minimumValuePercent ?? 0.1

    return calculateCurrentValue(
      selectedItem.productVariant.originalPrice,
      selectedItem.productVariant.purchaseDate,
      selectedItem.productVariant.originalMSRP,
      selectedItem.productVariant.originalPurchaseDate,
      rate,
      minPercent
    )
  }, [selectedItem])

  useEffect(() => {
    const allRepairQuantities = Object.entries(repairQuantities).reduce(
      (acc, [name, qty]) => {
        acc.total += Number(qty)
        acc.details.push({ name, qty })
        return acc
      },
      { total: 0, details: [] as { name: string; qty: number }[] }
    )

    const totalQty = goodQty + repairQty + replacementQty + manualQty + allRepairQuantities.total
    if (totalQty > selectedItem?.quantity) return

    // Cap costs per unit to current fair value
    const effectiveRepairCost = Math.min(repairCost, currentFairValue)
    const effectiveReplacementCost = Math.min(replacementCost, currentFairValue)
    const effectiveManualCost = Math.min(manualCost, currentFairValue)

    const repairTotalFee = effectiveRepairCost * repairQty
    const replacementTotalFee = effectiveReplacementCost * replacementQty
    const manualTotalFee = effectiveManualCost * manualQty
    let allRepairTotalFee = 0

    allRepairQuantities.details.forEach((detail) => {
      const severityPercent =
        selectedItem?.productVariant?.damagePolicies?.find(
          (policy: any) => policy.damageSeverity === detail.name
        )?.damageSeverityPercent ?? 0

      const repairFeeSeverity = replacementCost * (severityPercent / 100) * detail.qty

      // Cap repair fee based on item's current value
      const cappedRepairFeeSeverity = Math.min(repairFeeSeverity, currentFairValue * detail.qty)

      allRepairTotalFee += cappedRepairFeeSeverity

      setRepairFees((prev) => ({
        ...prev,
        [detail.name]: cappedRepairFeeSeverity,
      }))
    })

    // Apply Fairness Cap: The total charge for damage cannot exceed the current depreciated value
    // However, we apply this logic primarily to 'Replacement' or major costs.
    // For simplicity, we can cap the calculated total damage fee.
    let rawTotalDamageFee =
      repairTotalFee + replacementTotalFee + allRepairTotalFee + manualTotalFee

    // Resolution Workflow Modifiers
    if (rawTotalDamageFee > 0) {
      if (isGrossNegligence) {
        rawTotalDamageFee += rawTotalDamageFee * 0.2 // 20% Administrative Penalty
      }
      if (chargeLossOfUse) {
        rawTotalDamageFee += (selectedItem?.price ?? 0) * 3 // 3 Days Loss of Use
      }
      if (shopKeepsSalvage) {
        rawTotalDamageFee -= rawTotalDamageFee * 0.15 // 15% Salvage Credit
      }
    }

    setDeductedQty(totalQty)
    setRepairFee(repairTotalFee)
    setReplacementFee(replacementTotalFee)
    setManualFee(manualTotalFee)
    setTotalFee(Number(rawTotalDamageFee.toFixed(2)))
  }, [
    goodQty,
    repairQty,
    replacementQty,
    repairQuantities,
    manualQty,
    manualCost,
    repairCost,
    replacementCost,
    selectedItem?.productVariant?.damagePolicies,
    selectedItem?.quantity,
    currentFairValue,
    isGrossNegligence,
    chargeLossOfUse,
    shopKeepsSalvage,
    selectedItem?.price,
  ])

  const handleReturnConfirm = async () => {
    if ((manualCost === 0) !== (manualQty === 0)) {
      alert("Please input both manual cost and manual quantity.")
      return
    }

    const status = goodQty === selectedItem.quantity ? "returned" : "returned_damaged"

    console.log(selectedItem.quantity - goodQty)

    try {
      const returnStatus = await updateReturnStatusMutation({
        rentItemId: selectedItem.id,
        status: status,
        noteMessage: "Payment canceled",
        amount: totalFee,

        manualFee: manualFee,
        replacementFee: replacementFee,
        repairFee: repairFee,
        repairFees: repairFees,

        selectedQty: selectedItem.quantity,
        goodQty: goodQty,
        manualQty: manualQty,
        replacementQty: replacementQty,
        repairQty: repairQty,
        repairQuantities: repairQuantities,
        isGrossNegligence,
        chargeLossOfUse,
        shopKeepsSalvage,
      })
      console.log(returnStatus)
    } catch (error) {
      console.error(error)
    }

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

  const handleConfirmPayment = async () => {
    try {
      const newPayment = await addPaymentMutation({
        rentItemId: selectedItem.id,
        amount: payNow,
        status: selectedPaymentType,
        note: "Payment completed",
      })
      alert("Payment completed successfully!")
      handleCloseComplete()
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

  const onChangePaymentType = (balance: number, value: string) => {
    setSelectedPaymentType(value)
    value === "full" ? setPayNow(balance) : setPayNow(balance / 2)
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

  const [addPaymentMutation] = useMutation(addPayment)
  const [updateRentStatusMutation] = useMutation(updateRentStatus)
  const [updateReturnStatusMutation] = useMutation(updateReturnStatus)
  const [openComplete, setOpenComplete] = useState(false)
  const [statusFilter, setStatusFilter] = useState("ALL")

  const filteredRentItems = useMemo(() => {
    return statusFilter === "ALL"
      ? rentItems
      : rentItems.filter((item: any) => item.status === statusFilter)
  }, [rentItems, statusFilter])

  const handleOpenComplete = useCallback((rentItem: any) => {
    setOpenComplete(true)
    setSelectedItem(rentItem)
    setSelectedPaymentType("full")

    const rentAmount = rentItem.quantity * rentItem.price
    const repairFee =
      rentItem.payments?.reduce(
        (total: number, payment: { penaltyFee: number }) => total + (payment.penaltyFee || 0),
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
  }, [])

  const handleCloseComplete = () => {
    setOpenComplete(false)
    setSelectedPaymentType("full")
    setAmountError(false)
  }

  const [openReturnRepairReplacement, setOpenReturnRepairReplacement] = useState(false)
  const [openViewReturnedItems, setOpenViewReturnedItems] = useState(false)

  const handleHandItems = useCallback(async () => {
    console.log("test")
  }, [])

  const handleOpenReturnRepairReplacement = useCallback(
    (rentItem: any, isReturned: boolean, handItems: boolean) => {
      if (!isReturned) {
        if (handItems) {
          handleHandItems()
        } else {
          setOpenReturnRepairReplacement(true)
        }
      } else {
        setOpenViewReturnedItems(true)
      }
      setSelectedItem(rentItem)
    },
    [handleHandItems]
  )

  const handleCloseViewReturnedItems = () => {
    setOpenViewReturnedItems(false)
  }

  const handleCloseReturnRepairReplacement = () => {
    // *** USE THIS INSTEAD IF WORKING ON DYNAMIC
    // setRepairFees((prev) =>
    //   Object.keys(prev).reduce((acc: any, key: string) => {
    //     acc[key] = 0
    //     return acc
    //   }, {})
    // )

    // setRepairQuantities((prev) =>
    //   Object.keys(prev).reduce((acc: any, key: string) => {
    //     acc[key] = 0
    //     return acc
    //   }, {})
    // )

    resetState()

    setOpenReturnRepairReplacement(false)
  }

  const resetState = () => {
    setRepairFees({})
    setRepairQuantities({})

    setDeductedQty(0)
    setGoodQty(0)
    setRepairFee(0)
    setRepairQty(0)
    setReplacementFee(0)
    setReplacementQty(0)
    setManualCost(0)
    setManualFee(0)
    setManualQty(0)
    setTotalFee(0)

    setIsGrossNegligence(false)
    setChargeLossOfUse(false)
    setShopKeepsSalvage(false)
  }

  const handleAction = useCallback(
    async (rentItem: RentItemType, action: "accept" | "cancel") => {
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
    },
    [updateRentStatusMutation, refetch]
  )

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
              {filteredRentItems.map((rentItem: any) => (
                <RentItemRow
                  key={rentItem.id}
                  rentItem={rentItem}
                  loadingAction={loadingAction}
                  handleAction={handleAction}
                  handleOpenComplete={handleOpenComplete}
                  handleOpenReturnRepairReplacement={handleOpenReturnRepairReplacement}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* reason */}
      <Dialog open={cancelOpen} onClose={cancelClose} fullWidth>
        <DialogTitle>Cancel Rental</DialogTitle>
        <DialogContent className="scrollbar-seamless">
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

      <Dialog
        open={openViewReturnedItems}
        onClose={handleCloseViewReturnedItems}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Returned Items</DialogTitle>
        <DialogContent dividers className="scrollbar-seamless">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ textTransform: "uppercase", fontWeight: "bold", color: "primary.main" }}
                >
                  Type
                </TableCell>
                <TableCell
                  sx={{ textTransform: "uppercase", fontWeight: "bold", color: "primary.main" }}
                >
                  SubType
                </TableCell>
                <TableCell
                  sx={{ textTransform: "uppercase", fontWeight: "bold", color: "primary.main" }}
                >
                  Repair Type
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ textTransform: "uppercase", fontWeight: "bold", color: "primary.main" }}
                >
                  Amount
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ textTransform: "uppercase", fontWeight: "bold", color: "primary.main" }}
                >
                  Quantity
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {selectedItem?.charges?.length > 0 ? (
                selectedItem.charges.map((charge: Charge) => (
                  <TableRow key={charge.id}>
                    <TableCell sx={{ textTransform: "capitalize" }}>{charge.type}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{charge.subType}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {charge.repairType ?? "N/A"}
                    </TableCell>
                    <TableCell align="right">{charge.amount}</TableCell>
                    <TableCell align="right">{charge.quantity}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No returned items
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewReturnedItems} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* return items */}
      {selectedItem && (
        <Dialog
          open={openReturnRepairReplacement}
          onClose={handleCloseReturnRepairReplacement}
          fullWidth
          maxWidth="sm"
        >
          {(() => {
            const adornmentData = (label: string, qty: number, severity?: string) => {
              const remainingQty = (selectedItem.quantity ?? 0) - (deductedQty ?? 0)

              // Precompute values
              const totalQty = Number(remainingQty) + Number(qty)
              // console.log({ label, qty, remainingQty, totalQty });

              // Map MAX and RESET actions per label
              const qtyData: Record<string, { max: () => void; reset: () => void }> = {
                Good: {
                  max: () => setGoodQty(totalQty),
                  reset: () => setGoodQty(0),
                },
                Repair: {
                  max: () => setRepairQty(totalQty),
                  reset: () => setRepairQty(0),
                },
                Replacement: {
                  max: () => setReplacementQty(totalQty),
                  reset: () => setReplacementQty(0),
                },
                Manual: {
                  max: () => setManualQty(totalQty),
                  reset: () => setManualQty(0),
                },
                Repairs: {
                  max: () => {
                    if (!severity) return
                    setRepairQuantities((prev) => ({ ...prev, [severity]: totalQty }))
                  },
                  reset: () => {
                    if (!severity) return
                    setRepairQuantities((prev) => ({ ...prev, [severity]: 0 }))
                  },
                },
              }

              const isRepairUneconomical =
                (repairQty > 0 && repairCost > currentFairValue * 0.7) ||
                (manualQty > 0 && manualCost > currentFairValue * 0.7) ||
                Object.entries(repairQuantities).some(([sev, q]) => {
                  if (q <= 0) return false
                  const policy = selectedItem?.productVariant?.damagePolicies?.find(
                    (p: any) => p.damageSeverity === sev
                  )
                  const cost = replacementCost * ((policy?.damageSeverityPercent ?? 0) / 100)
                  return cost > currentFairValue * 0.7
                })

              return (
                <InputAdornment
                  position="end"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <button
                    onClick={qtyData[label].max}
                    className="text-xs font-bold px-2 py-1 rounded hover:bg-gray-200"
                  >
                    MAX
                  </button>
                  <button
                    onClick={qtyData[label].reset}
                    className="text-xs font-bold px-2 py-1 rounded hover:bg-gray-200"
                  >
                    RESET
                  </button>
                </InputAdornment>
              )
            }

            return (
              <>
                <DialogTitle>
                  Return Items
                  <div className="flex gap-6 mt-2 items-center">
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "primary.main" }}>
                      Quantity to Return: {selectedItem.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "error.main" }}>
                      Remaining Quantity: {selectedItem.quantity - deductedQty}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: "bold", color: "warning.main" }}>
                      Total Fee: ₱{totalFee}
                    </Typography>
                    {totalFee > currentFairValue && (
                      <Chip
                        label={`Exceeds Fair Value (₱${currentFairValue.toFixed(2)})`}
                        color="warning"
                        size="small"
                      />
                    )}
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => resetState()}
                    >
                      RESET ALL
                    </Button>
                  </div>
                </DialogTitle>
                <DialogContent className="scrollbar-seamless">
                  <div className="mt-4">
                    <h4 className="mb-2 font-semibold">Returned in Good Condition</h4>
                    <div className="flex items-center gap-4 mb-2">
                      <TextField
                        type="number"
                        label="Qty"
                        value={goodQty}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          const max = selectedItem.quantity - deductedQty + goodQty

                          if (val > max) {
                            setGoodQty(max)
                            return
                          }

                          setGoodQty(Number(e.target.value))
                        }}
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            max: selectedItem.quantity - deductedQty + goodQty,
                          },
                          input: {
                            endAdornment: adornmentData("Good", goodQty),
                          },
                        }}
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Replacement Fee with Qty + Fee */}
                  <div className="mt-4">
                    <h4 className="mb-2 font-semibold">Replacement Fee (Default)</h4>
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
                          input: {
                            endAdornment: adornmentData("Replacement", replacementQty),
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
                    <h4 className="mb-2 font-semibold">Repair Fee (Default)</h4>
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
                          input: {
                            endAdornment: adornmentData("Repair", repairQty),
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
                      Repair Fee
                      <small className="ml-2 text-red-500">(Percentage-Based)</small>
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
                            value={repairQuantities[repair.damageSeverity] ?? 0}
                            onChange={(e) => {
                              const sev = repair.damageSeverity
                              const raw = e.target.value

                              if (raw === "" || raw === "-") {
                                setRepairQuantities((prev) => ({ ...prev, [sev]: 0 }))
                                return
                              }

                              let n = Number(raw)
                              if (!Number.isFinite(n) || n < 0) n = 0 // sanitize negatives / NaN
                              n = Math.floor(n) // optional: force integer

                              // Compute max without double-counting the current severity
                              const current = Number(repairQuantities[sev] ?? 0)
                              const max = selectedItem.quantity - deductedQty + current

                              const clamped = Math.min(n, max)

                              setRepairQuantities((prev) => ({
                                ...prev,
                                [sev]: clamped, // always a number
                              }))
                            }}
                            // disabled={!selectedRepairs.includes(repair.key)}
                            slotProps={{
                              htmlInput: {
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                                min: 0,
                                max:
                                  selectedItem.quantity -
                                  deductedQty +
                                  (repairQuantities[repair.damageSeverity] ?? 0),
                              },
                              input: {
                                endAdornment: adornmentData(
                                  "Repairs",
                                  repairQuantities[repair.damageSeverity] ?? 0,
                                  repair.damageSeverity
                                ),
                              },
                            }}
                            className="flex-1"
                          />
                          =
                          <TextField
                            type="number"
                            label="Fee"
                            value={repairFees[repair.damageSeverity] ?? 0}
                            // disabled={!selectedRepairs.includes(repair.key)}
                            className="flex-1"
                            slotProps={{
                              input: {
                                readOnly: true,
                                startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                              },
                            }}
                          />
                        </div>
                      )
                    })}
                  </div>

                  {/* Manual Repair/Replacement Fee */}

                  <div className="mt-4">
                    <h4 className="mb-2 font-semibold">Manual Repair/Replacement Fee</h4>
                    <div className="flex items-center gap-4 mb-2">
                      <TextField
                        fullWidth
                        type="number"
                        label="Unit Fee"
                        value={manualCost}
                        onChange={(e) => setManualCost(Number(e.target.value))}
                        slotProps={{
                          input: {
                            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                          },
                        }}
                        margin="dense"
                        className="flex-1"
                        disabled={selectedItem.quantity - deductedQty === 0 && manualQty === 0}
                      />
                      x
                      <TextField
                        fullWidth
                        type="number"
                        label="Qty"
                        value={manualQty}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          const max = selectedItem.quantity - deductedQty + manualQty

                          if (val > max) {
                            setManualQty(Number(max))
                            return
                          }

                          setManualQty(Number(e.target.value))
                        }}
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            max: selectedItem.quantity - deductedQty + manualQty,
                          },
                          input: {
                            endAdornment: adornmentData("Manual", manualQty),
                          },
                        }}
                        margin="dense"
                        className="flex-1"
                      />
                      =
                      <TextField
                        type="number"
                        label="Fee"
                        value={manualFee}
                        className="flex-1"
                        slotProps={{
                          input: {
                            readOnly: true,
                            startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Advanced Resolution Workflow */}
                  {(repairQty > 0 ||
                    replacementQty > 0 ||
                    manualQty > 0 ||
                    Object.values(repairQuantities).some((q) => q > 0)) && (
                    <div className="mt-8 border-t border-gray-200 pt-6">
                      <h4 className="mb-4 font-semibold text-slate-800">
                        Advanced Resolution Workflow
                      </h4>

                      {isRepairUneconomical && (
                        <Alert severity="warning" className="mb-4">
                          <strong>Repair Cost &gt; 70% of Fair Value:</strong> The cost to repair
                          this item exceeds 70% of its current depreciated value (₱
                          {currentFairValue.toFixed(2)}). Consider converting this claim to a Total
                          Loss (Replacement).
                        </Alert>
                      )}

                      <div className="flex flex-col gap-1">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isGrossNegligence}
                              onChange={(e) => setIsGrossNegligence(e.target.checked)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              Apply Gross Negligence Penalty (+20%)
                            </Typography>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={chargeLossOfUse}
                              onChange={(e) => setChargeLossOfUse(e.target.checked)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              Charge Loss of Use (+3 Days Rent: ₱
                              {((selectedItem?.price ?? 0) * 3).toFixed(2)})
                            </Typography>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={shopKeepsSalvage}
                              onChange={(e) => setShopKeepsSalvage(e.target.checked)}
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              Shop Keeps Salvage / Broken Item (-15% Discount)
                            </Typography>
                          }
                        />
                      </div>
                    </div>
                  )}
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

      {/* payments */}
      {selectedItem && (
        <Dialog open={openComplete} onClose={handleCloseComplete} fullWidth maxWidth="sm">
          {(() => {
            // ✅ compute values here based on selectedRentItem
            const rentAmount = selectedItem.quantity * selectedItem.price
            const repairFee =
              selectedItem.payments?.reduce(
                (total: number, payment: { penaltyFee: number }) =>
                  total + (payment.penaltyFee || 0),
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
                <DialogContent dividers className="scrollbar-seamless">
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
                      onChange={(e) => onChangePaymentType(balance, e.target.value)}
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
    </>
  )
}

export default OrderList
