import React, { useState, useEffect, useMemo } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from "@mui/material"
import { toast } from "sonner"
import { useMutation } from "@blitzjs/rpc"
import updateReturnStatus from "../../mutations/updateReturnStatus"
import { calculateCurrentValue } from "./utils"

export interface DamagePolicy {
  id: number
  damageSeverity: string
  damageSeverityPercent: number
  description?: string | null
}

export interface ReturnItemType {
  id: number
  quantity: number
  price: number
  endDate: Date | string
  productVariant?: {
    originalMSRP: number
    originalPurchaseDate: Date | string
    product?: {
      category?: {
        annualDepreciationRate?: number
        minimumValuePercent?: number
      }
    }
    damagePolicies?: DamagePolicy[]
  }
}

export interface ReturnItemsModalProps {
  open: boolean
  onClose: () => void
  selectedItem: ReturnItemType | null
  refetch: () => void
}

// Configuration for the grace period (e.g., 1 hour)
const GRACE_PERIOD_MS = 1 * 60 * 60 * 1000

export default function ReturnItemsModal({
  open,
  onClose,
  selectedItem,
  refetch,
}: ReturnItemsModalProps) {
  const [updateReturnStatusMutation] = useMutation(updateReturnStatus)

  // Core Inputs
  const [goodQty, setGoodQty] = useState(0)
  const [replacementQty, setReplacementQty] = useState(0)
  const [repairQuantities, setRepairQuantities] = useState<{ [key: string]: number }>({})
  const [isOnTime, setIsOnTime] = useState(true)

  // Automatically clean up state every time the modal is opened
  useEffect(() => {
    if (open) {
      setGoodQty(selectedItem?.quantity || 0)
      setReplacementQty(0)
      setRepairQuantities({})

      // Automatically detect if the item is returned past the end date
      const end = selectedItem?.endDate ? new Date(selectedItem.endDate).getTime() : 0
      const now = new Date().getTime()
      setIsOnTime(now <= end + GRACE_PERIOD_MS)
    }
  }, [open, selectedItem])

  // Calculate Fair Market Value Cap
  const currentFairValue = useMemo(() => {
    if (!selectedItem?.productVariant) return Infinity

    const category = selectedItem.productVariant.product?.category
    const rate = category?.annualDepreciationRate ?? 0.2 // Fallback to 20% if not set in DB
    const minPercent = category?.minimumValuePercent ?? 0.1

    return calculateCurrentValue(
      selectedItem.productVariant.originalMSRP,
      selectedItem.productVariant.originalPurchaseDate,
      rate,
      minPercent
    )
  }, [selectedItem])

  // Calculate all derived totals purely during render
  const totals = useMemo(() => {
    const replacementCost = currentFairValue === Infinity ? 0 : currentFairValue

    // Quantities
    const allRepairQty = Object.values(repairQuantities).reduce(
      (sum, qty) => sum + (Number(qty) || 0),
      0
    )
    const deductedQty = goodQty + replacementQty + allRepairQty

    // Cap costs per unit to current fair value
    const effectiveReplacementCost = Math.min(replacementCost, currentFairValue)

    // Base Fees
    const replacementTotalFee = effectiveReplacementCost * replacementQty

    const repairFeesMap: Record<string, number> = {}
    let allRepairTotalFee = 0

    Object.entries(repairQuantities).forEach(([severity, qty]) => {
      if (!qty) return
      const policy = selectedItem?.productVariant?.damagePolicies?.find(
        (p: DamagePolicy) => p.damageSeverity === severity
      )
      const severityPercent = policy?.damageSeverityPercent ?? 0
      const rawFee = replacementCost * (severityPercent / 100) * qty
      const cappedFee = Math.min(rawFee, currentFairValue * qty)

      repairFeesMap[severity] = cappedFee
      allRepairTotalFee += cappedFee
    })

    let lateFee = 0
    let daysLate = 0
    if (!isOnTime && selectedItem?.endDate) {
      const end = new Date(selectedItem.endDate).getTime()
      const now = new Date().getTime()
      daysLate = Math.max(1, Math.ceil((now - (end + GRACE_PERIOD_MS)) / (1000 * 60 * 60 * 24))) // Minimum 1 day late if toggled
      // Standard Late Fee Formula: (Days Late) * (Daily Rent Price) * Quantity
      lateFee = daysLate * selectedItem.price * selectedItem.quantity
    }

    return {
      replacementCost,
      deductedQty,
      replacementFee: replacementTotalFee,
      repairFeesMap,
      allRepairTotalFee,
      lateFee,
      daysLate,
      totalFee: Number((replacementTotalFee + allRepairTotalFee + lateFee).toFixed(2)),
    }
  }, [goodQty, replacementQty, repairQuantities, currentFairValue, selectedItem, isOnTime])

  const handleReturnConfirm = async () => {
    if (!selectedItem) return

    const status = goodQty === selectedItem.quantity ? "returned" : "returned_damaged"

    try {
      const returnStatus = await updateReturnStatusMutation({
        rentItemId: selectedItem.id,
        status: status,
        noteMessage: isOnTime ? "Item returned on time" : "Item returned late",
        amount: totals.totalFee,

        manualFee: 0,
        replacementFee: totals.replacementFee,
        repairFee: totals.allRepairTotalFee,
        repairFees: totals.repairFeesMap,
        lateFee: totals.lateFee, // Pass the late fee to the backend

        selectedQty: selectedItem.quantity,
        goodQty: goodQty,
        manualQty: 0,
        replacementQty: replacementQty,
        repairQty: Object.values(repairQuantities).reduce((sum, q) => sum + (Number(q) || 0), 0),
        repairQuantities: repairQuantities,
        isGrossNegligence: false,
        chargeLossOfUse: false,
        shopKeepsSalvage: false,
      })
      toast.success("Return processed successfully!")
      onClose()
      refetch()
    } catch (error: unknown) {
      const err = error as { name?: string; message?: string; issues?: { message: string }[] }
      console.error("Return processing failed:", err)
      if (err.name === "ZodError") {
        toast.error(`Validation Error: ${err.issues?.[0]?.message || "Please check your inputs."}`)
      } else {
        toast.error(err.message || "Failed to process return. Please try again.")
      }
    }
  }

  if (!selectedItem) return null

  // Simplified Helper for Qty Buttons
  const renderQtyAdornment = (currentVal: number, setter: (val: number) => void) => {
    const maxAllowed = currentVal + (selectedItem.quantity - totals.deductedQty)
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
          onClick={() => setter(maxAllowed)}
          className="text-[10px] leading-none font-bold px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
        >
          MAX
        </button>
        <button
          onClick={() => setter(0)}
          className="text-[10px] leading-none font-bold px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
        >
          CLR
        </button>
      </InputAdornment>
    )
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle className="font-bold text-xl border-b border-gray-100">
        Process Return
      </DialogTitle>
      <DialogContent className="flex flex-col gap-6 pt-6 scrollbar-seamless">
        <div className="flex justify-between items-center bg-blue-50 p-5 rounded-xl border border-blue-100 mt-2">
          <div className="flex flex-col">
            <span className="text-sm text-blue-800 font-semibold uppercase tracking-wider">
              Total Rented
            </span>
            <span className="text-2xl font-bold text-blue-900">{selectedItem.quantity}</span>
          </div>
          {selectedItem.quantity - totals.deductedQty > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-sm text-red-600 font-semibold uppercase tracking-wider">
                Unaccounted Items
              </span>
              <span className="text-2xl font-bold text-red-600">
                {selectedItem.quantity - totals.deductedQty}
              </span>
            </div>
          )}
        </div>

        {/* 1. Return Timeline */}
        <div>
          <h4 className="font-bold text-gray-900 mb-4">1. Return Timeline</h4>
          <div className="flex items-center justify-between">
            <RadioGroup
              row
              value={isOnTime ? "yes" : "no"}
              onChange={(e) => setIsOnTime(e.target.value === "yes")}
            >
              <FormControlLabel
                value="yes"
                control={
                  <Radio
                    size="small"
                    sx={{ color: "#1b2a80", "&.Mui-checked": { color: "#1b2a80" } }}
                  />
                }
                label={<span className="text-sm font-medium">Returned On Time</span>}
              />
              <FormControlLabel
                value="no"
                control={<Radio size="small" color="error" />}
                label={<span className="text-sm font-medium text-red-600">Returned Late</span>}
              />
            </RadioGroup>
            {!isOnTime && totals.lateFee > 0 && (
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-red-600">
                  {totals.daysLate} Day{totals.daysLate > 1 ? "s" : ""} Late
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                  (₱{selectedItem.price.toFixed(2)} × {selectedItem.quantity} qty ×{" "}
                  {totals.daysLate} day{totals.daysLate > 1 ? "s" : ""})
                </span>
                <span className="text-xs text-gray-500">+₱{totals.lateFee.toFixed(2)} penalty</span>
              </div>
            )}
          </div>
        </div>

        <Divider />

        {/* Good Condition */}
        <div>
          <h4 className="font-bold text-gray-900 mb-4">2. Item Condition</h4>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col flex-1">
              <span className="font-bold text-gray-800 text-base">Good Condition</span>
              <span className="text-xs text-gray-500">Items returned with no new damages</span>
            </div>
            <TextField
              type="number"
              placeholder="0"
              value={goodQty === 0 ? "" : goodQty}
              onChange={(e) => {
                const raw = e.target.value
                if (raw === "") {
                  setGoodQty(0)
                  return
                }
                const val = Number(raw)
                const max = selectedItem.quantity - totals.deductedQty + goodQty
                setGoodQty(val > max ? max : val)
              }}
              slotProps={{
                htmlInput: {
                  min: 0,
                  max: selectedItem.quantity - totals.deductedQty + goodQty,
                },
                input: {
                  endAdornment: renderQtyAdornment(goodQty, setGoodQty),
                },
              }}
              sx={{ width: 140, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
          </div>
        </div>

        {/* Damages Section (Progressively Disclosed) */}
        {selectedItem.quantity - goodQty > 0 && (
          <div className="flex flex-col gap-6">
            <Divider />
            <div>
              <h4 className="font-bold text-gray-900 mb-4">3. Report Damages & Losses</h4>

              <div className="flex flex-col gap-4">
                {selectedItem?.productVariant?.damagePolicies?.map((repair: DamagePolicy) => {
                  const feePerItem = (
                    totals.replacementCost *
                    (repair.damageSeverityPercent / 100)
                  ).toFixed(2)

                  return (
                    <div key={repair.id} className="flex items-center justify-between gap-4">
                      <div className="flex flex-col flex-1">
                        <span className="font-bold text-gray-800 capitalize">
                          {repair.damageSeverity} Damage
                        </span>
                        <span className="text-xs text-gray-500">+₱{feePerItem} per item</span>
                      </div>
                      <TextField
                        type="number"
                        placeholder="0"
                        value={repairQuantities[repair.damageSeverity] || ""}
                        onChange={(e) => {
                          const sev = repair.damageSeverity
                          const raw = e.target.value
                          if (raw === "" || raw === "-") {
                            setRepairQuantities((prev) => ({ ...prev, [sev]: 0 }))
                            return
                          }
                          let n = Number(raw)
                          if (!Number.isFinite(n) || n < 0) n = 0
                          n = Math.floor(n)

                          const current = Number(repairQuantities[sev] ?? 0)
                          const max = selectedItem.quantity - totals.deductedQty + current
                          const clamped = Math.min(n, max)

                          setRepairQuantities((prev) => ({ ...prev, [sev]: clamped }))
                        }}
                        slotProps={{
                          htmlInput: {
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                            min: 0,
                            max:
                              selectedItem.quantity -
                              totals.deductedQty +
                              (repairQuantities[repair.damageSeverity] ?? 0),
                          },
                          input: {
                            endAdornment: renderQtyAdornment(
                              repairQuantities[repair.damageSeverity] ?? 0,
                              (val) =>
                                setRepairQuantities((prev) => ({
                                  ...prev,
                                  [repair.damageSeverity]: val,
                                }))
                            ),
                          },
                        }}
                        sx={{ width: 140, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                      />
                    </div>
                  )
                })}

                {/* Missing / Total Loss */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-gray-800">Missing / Total Loss</span>
                    <span className="text-xs text-gray-500">
                      +₱{totals.replacementCost.toFixed(2)} per item
                    </span>
                  </div>
                  <TextField
                    type="number"
                    placeholder="0"
                    value={replacementQty === 0 ? "" : replacementQty}
                    onChange={(e) => {
                      const raw = e.target.value
                      if (raw === "") {
                        setReplacementQty(0)
                        return
                      }
                      const val = Number(raw)
                      const max = selectedItem.quantity - totals.deductedQty + replacementQty
                      setReplacementQty(val > max ? max : val)
                    }}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        max: selectedItem.quantity - totals.deductedQty + replacementQty,
                      },
                      input: {
                        endAdornment: renderQtyAdornment(replacementQty, setReplacementQty),
                      },
                    }}
                    sx={{ width: 140, "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {totals.totalFee > 0 && (
          <div className="flex justify-between items-center bg-red-50 p-5 rounded-xl border border-red-100">
            <span className="font-bold text-red-900">Total Penalty Fee</span>
            <span className="text-xl font-bold text-red-700">
              ₱{totals.totalFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </DialogContent>

      <DialogActions className="p-4 border-t border-gray-100">
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: "bold" }}>
          Cancel
        </Button>
        <Button
          onClick={handleReturnConfirm}
          variant="contained"
          disabled={selectedItem.quantity - totals.deductedQty !== 0}
          sx={{
            bgcolor: "#1b2a80",
            "&:hover": { bgcolor: "#152266" },
            borderRadius: "8px",
            px: 4,
            fontWeight: "bold",
          }}
          disableElevation
        >
          Confirm Return
        </Button>
      </DialogActions>
    </Dialog>
  )
}
