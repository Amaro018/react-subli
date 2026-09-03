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
  DialogContentText,
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

import Image from "next/image"
import updateRentStatus from "../../mutations/updateRentStatus"
import updateReturnStatus from "../../mutations/updateReturnStatus"

import getCurrentUser from "./../../users/queries/getCurrentUser"
import { toast } from "@/src/app/utils/toast"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { calculateCurrentValue } from "./utils"
import RentItemRow, { RentItemData } from "./RentItemRow"
import ReturnItemsModal from "./ReturnItemsModal"
import PaymentModal from "./PaymentModal"

const statuses = [
  { value: "ACTIVE", label: "ACTIVE ORDERS" },
  { value: "ALL", label: "ALL" },
  { value: "pending", label: "PENDING" },
  { value: "accepted", label: "ACCEPTED" },
  { value: "rendering", label: "ON HAND" },
  { value: "completed", label: "COMPLETED" },
  { value: "canceled", label: "CANCELED" },
  { value: "returned", label: "RETURNED" },
  { value: "overdue", label: "OVERDUE" },
  { value: "due_today", label: "DUE TODAY" },
]

type Payment = {
  id: number
  amount: number
  status: string
  penaltyFee?: number | null
  note?: string | null
  createdAt: Date | string
  date?: Date | string
}

type ExtendedRentItem = RentItemData & {
  charges?: Charge[]
  payments?: Payment[]
  productVariant: RentItemData["productVariant"] & {
    originalMSRP: number
    originalPurchaseDate: Date | string
    damagePolicies?: {
      id: number
      damageSeverity: string
      damageSeverityPercent: number
      description?: string | null
    }[]
    product: RentItemData["productVariant"]["product"] & {
      category?: {
        annualDepreciationRate?: number
        minimumValuePercent?: number
      }
    }
  }
}

type Charge = {
  id: number
  type: string
  severity?: string | null
  amount: number
  quantity: number
}

// Advanced Resolution Policy Configuration
export const POLICY_CONFIG = {
  GROSS_NEGLIGENCE_PENALTY_RATE: 0.2, // 20%
  LOSS_OF_USE_DAYS: 3, // 3 Days Rent
  SALVAGE_CREDIT_RATE: 0.15, // 15%
  UNECONOMICAL_REPAIR_THRESHOLD: 0.7, // 70%
}

export const OrderList = () => {
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

  // RETURN
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const highlightId = searchParams?.get("highlight")
  const [selectedItem, setSelectedItem] = useState<ExtendedRentItem | null>(null)

  const [loadingAction, setLoadingAction] = useState<null | "accept" | "cancel" | "on_hand">(null)

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
      toast.success("Rental canceled successfully.")
    } catch (error: unknown) {
      const err = error as { message?: string }
      console.error("Failed to update rent status:", err)
      toast.error(err.message || "Failed to cancel rental.")
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

  const [updateRentStatusMutation] = useMutation(updateRentStatus)
  const [openComplete, setOpenComplete] = useState(false)
  const [statusFilter, setStatusFilter] = useState(searchParams?.get("status") || "ACTIVE")

  useEffect(() => {
    const status = searchParams?.get("status")
    if (status) {
      setStatusFilter(status)
    }
  }, [searchParams])

  const filteredRentItems = useMemo<ExtendedRentItem[]>(() => {
    const items = rentItems as unknown as ExtendedRentItem[]
    const today = new Date()

    if (statusFilter === "ALL") return items
    if (statusFilter === "ACTIVE") {
      return items.filter((item) => !["completed", "canceled"].includes(item.status))
    }

    if (statusFilter === "due_today") {
      return items.filter((item: any) => {
        const isCompleted = ["completed", "returned", "returned_damaged", "canceled"].includes(
          item.status
        )
        if (isCompleted) return false
        const endDate = new Date(item.endDate)
        return (
          endDate.getDate() === today.getDate() &&
          endDate.getMonth() === today.getMonth() &&
          endDate.getFullYear() === today.getFullYear()
        )
      })
    }

    if (statusFilter === "overdue") {
      return items.filter((item: any) => {
        if (item.status === "overdue") return true

        const isCompleted = ["completed", "returned", "returned_damaged", "canceled"].includes(
          item.status
        )
        if (isCompleted) return false
        const endDate = new Date(item.endDate)
        const isDueToday =
          endDate.getDate() === today.getDate() &&
          endDate.getMonth() === today.getMonth() &&
          endDate.getFullYear() === today.getFullYear()
        return today > endDate && !isDueToday
      })
    }

    return items.filter((item) => item.status === statusFilter)
  }, [rentItems, statusFilter])

  const statusCounts = useMemo(() => {
    const today = new Date()
    const counts: Record<string, number> = {
      ACTIVE: 0,
      ALL: rentItems.length,
      pending: 0,
      accepted: 0,
      rendering: 0,
      completed: 0,
      canceled: 0,
      returned: 0,
      overdue: 0,
      due_today: 0,
    }

    rentItems.forEach((item: any) => {
      const isFinal = ["completed", "returned", "returned_damaged", "canceled"].includes(
        item.status
      )
      const endDate = new Date(item.endDate)

      // Standard status counts (grouping returned_damaged into returned)
      if (item.status === "returned_damaged") {
        counts.returned++
      } else if (counts[item.status] !== undefined) {
        counts[item.status]++
      }

      // ACTIVE count (All except completed and canceled)
      if (!["completed", "canceled"].includes(item.status)) counts.ACTIVE++

      // Dynamic date-based counts
      const isDueToday =
        !isFinal &&
        endDate.getDate() === today.getDate() &&
        endDate.getMonth() === today.getMonth() &&
        endDate.getFullYear() === today.getFullYear()
      const isOverdueCalc = !isFinal && today > endDate && !isDueToday

      if (isDueToday) counts.due_today++
      if (isOverdueCalc && item.status !== "overdue") counts.overdue++
    })
    return counts
  }, [rentItems])

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout
    let clearUrlTimeout: NodeJS.Timeout

    if (highlightId && filteredRentItems.length > 0) {
      const targetId = Number(highlightId)
      const exists = filteredRentItems.some((item) => item.id === targetId)

      if (exists) {
        scrollTimeout = setTimeout(() => {
          const el = document.getElementById(`order-row-${targetId}`)
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" })
            clearUrlTimeout = setTimeout(() => {
              const params = new URLSearchParams(searchParams.toString())
              if (params.has("highlight")) {
                params.delete("highlight")
                router.replace(
                  `${pathname}${params.toString() ? `?${params.toString()}` : ""}` as any,
                  { scroll: false }
                )
              }
            }, 2000)
          }
        }, 100)
      }
    }

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout)
      if (clearUrlTimeout) clearTimeout(clearUrlTimeout)
    }
  }, [highlightId, filteredRentItems, pathname, router, searchParams])

  const handleOpenComplete = useCallback((rentItem: RentItemData) => {
    setOpenComplete(true)
    setSelectedItem(rentItem as ExtendedRentItem)
  }, [])

  const handleCloseComplete = () => {
    setOpenComplete(false)
  }

  const [openReturnRepairReplacement, setOpenReturnRepairReplacement] = useState(false)
  const [openViewReturnedItems, setOpenViewReturnedItems] = useState(false)

  const handleHandItems = useCallback(
    async (rentItem: RentItemData) => {
      if (!rentItem) return

      if (rentItem.status !== "accepted") {
        toast.error("Item must be in 'Accepted' status before it can be handed over.")
        return
      }

      setConfirmMessage("Confirm that you have handed the item to the renter?")
      setConfirmAction(() => async () => {
        try {
          setLoadingAction("on_hand")
          await updateRentStatusMutation({
            rentItemId: rentItem.id,
            action: "on_hand",
            noteMessage: "Item handed over to renter.",
          })
          toast.success("Item status updated to 'On Hand'.")
          await refetch()
        } catch (error: unknown) {
          const err = error as { message?: string }
          console.error("Failed to update rent status:", err)
          toast.error("Failed to update item status.")
        } finally {
          setLoadingAction(null)
        }
      })
      setConfirmOpen(true)
    },
    [updateRentStatusMutation, refetch]
  )

  const handleCloseViewReturnedItems = () => {
    setOpenViewReturnedItems(false)
  }

  const handleCloseReturnRepairReplacement = () => {
    setOpenReturnRepairReplacement(false)
  }

  const handleReturnAction = useCallback(
    (rentItem: RentItemData, action: "view" | "return" | "handover") => {
      setSelectedItem(rentItem as ExtendedRentItem)
      switch (action) {
        case "view":
          setOpenViewReturnedItems(true)
          break
        case "return":
          setOpenReturnRepairReplacement(true)
          break
        case "handover":
          handleHandItems(rentItem)
          break
      }
    },
    [handleHandItems]
  )

  const handleAction = useCallback(
    async (rentItem: RentItemData, action: "accept" | "cancel") => {
      if (action === "cancel") {
        // Open modal first, don't call mutation yet
        setCancelOpen(true)
        setRenterId(rentItem.id)
        return
      }

      setConfirmMessage(
        `Are you sure you want to accept this rental request for "${rentItem.productVariant.product.name}"?`
      )
      setConfirmAction(() => async () => {
        try {
          setLoadingAction(action)
          await updateRentStatusMutation({
            rentItemId: rentItem.id,
            action,
            noteMessage: "accepted",
          })
          toast.success("Rental accepted successfully.")
          await refetch()
        } catch (error: unknown) {
          const err = error as { message?: string }
          console.error("Failed to update rent status:", err)
          toast.error(err.message || "Failed to update rental status.")
        } finally {
          setLoadingAction(null)
        }
      })
      setConfirmOpen(true)
    },
    [updateRentStatusMutation, refetch]
  )

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus)
    const params = new URLSearchParams(searchParams?.toString())
    params.set("status", newStatus)
    // Use router to update URL so the state remains consistent on refresh
    router.push(`${pathname}?${params.toString()}` as any, { scroll: false })
  }

  return (
    <>
      <div className="w-full">
        {statusCounts.overdue > 0 && (
          <Alert severity="error" className="mb-4 rounded-xl shadow-sm border border-red-200">
            You have <strong>{statusCounts.overdue}</strong> overdue{" "}
            {statusCounts.overdue > 1 ? "rentals" : "rental"} that require immediate attention!
          </Alert>
        )}
        {statusCounts.due_today > 0 && (
          <Alert severity="warning" className="mb-4 rounded-xl shadow-sm border border-orange-200">
            You have <strong>{statusCounts.due_today}</strong>{" "}
            {statusCounts.due_today > 1 ? "rentals" : "rental"} due for return today!
          </Alert>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center w-full p-4 mb-6 bg-white rounded-xl shadow-sm border border-gray-200">
          <div>
            <p className="text-2xl font-bold text-gray-800">Rent Orders</p>
            <p className="text-sm text-gray-500 mt-1">
              Manage rentals for {currentUser?.shop?.shopName ?? "your shop"}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <TextField
              id="outlined-select-status"
              select
              label="Filter by Status"
              size="small"
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              sx={{
                minWidth: 160,
                "& .MuiOutlinedInput-root": { borderRadius: "8px" },
              }}
            >
              {statuses.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label} ({statusCounts[status.value] || 0})
                </MenuItem>
              ))}
            </TextField>
          </div>
        </div>

        {/* Orders */}
        {filteredRentItems.length === 0 ? (
          <div className="flex flex-col justify-center items-center w-full py-24 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 h-full min-h-[400px]">
            <Typography variant="h6" fontWeight="bold" className="text-gray-900 mb-2">
              No orders found
            </Typography>
            <Typography variant="body2" className="text-gray-500 max-w-sm text-center">
              We couldn&apos;t find any rent orders matching your current filter.
            </Typography>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col divide-y divide-gray-100 px-4 sm:px-6">
              {filteredRentItems.map((rentItem) => (
                <RentItemRow
                  key={rentItem.id}
                  rentItem={rentItem}
                  loadingAction={loadingAction}
                  handleAction={handleAction}
                  handleOpenPayments={handleOpenComplete}
                  handleReturnAction={handleReturnAction}
                  isHighlighted={rentItem.id === Number(highlightId)}
                />
              ))}
            </div>
          </div>
        )}
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
                  Category
                </TableCell>
                <TableCell
                  sx={{ textTransform: "uppercase", fontWeight: "bold", color: "primary.main" }}
                >
                  Assessment Details
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ textTransform: "uppercase", fontWeight: "bold", color: "primary.main" }}
                >
                  Qty
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ textTransform: "uppercase", fontWeight: "bold", color: "primary.main" }}
                >
                  Amount
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {selectedItem?.charges && selectedItem.charges.length > 0 ? (
                selectedItem.charges.map((charge: Charge) => (
                  <TableRow key={charge.id}>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {charge.type.toLowerCase()}
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {(charge.severity || "General").replace(/_/g, " ").toLowerCase()}
                    </TableCell>
                    <TableCell align="center">{charge.quantity}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: "bold" }}>
                      ₱{charge.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No additional charges. Items returned in good condition.
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
        <ReturnItemsModal
          open={openReturnRepairReplacement}
          onClose={handleCloseReturnRepairReplacement}
          selectedItem={selectedItem}
          refetch={refetch}
        />
      )}

      {/* payments */}
      {selectedItem && (
        <PaymentModal
          open={openComplete}
          onClose={handleCloseComplete}
          selectedItem={selectedItem}
          refetch={refetch}
        />
      )}

      <Dialog open={confirmOpen} onClose={handleConfirmClose}>
        <DialogTitle>Confirm Action</DialogTitle>
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

export default OrderList
