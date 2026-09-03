import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  MenuItem,
  Chip,
} from "@mui/material"
import { toast } from "@/src/app/utils/toast"
import { useMutation } from "@blitzjs/rpc"
import addPayment from "../../mutations/addPayment"
import { formatDateTime, calculateRentTotals } from "./utils"

export default function PaymentModal({ open, onClose, selectedItem, refetch }: any) {
  const [addPaymentMutation] = useMutation(addPayment)

  const [selectedPaymentType, setSelectedPaymentType] = useState("partial")
  const [payNow, setPayNow] = useState(0)
  const [amountError, setAmountError] = useState(false)
  const [disableConfirm, setDisableConfirm] = useState(false)
  const [note, setNote] = useState("")

  // Reset and pre-calculate state when modal opens
  useEffect(() => {
    if (open && selectedItem) {
      setAmountError(false)
      setNote("")

      const { initialFee, totalPaid, remainingBalance } = calculateRentTotals(selectedItem)

      // Automatically select partial payment if the initial fee hasn't been met yet
      if (totalPaid < initialFee) {
        setSelectedPaymentType("partial")
        setPayNow(initialFee - totalPaid)
      } else {
        setSelectedPaymentType("full")
        setPayNow(remainingBalance)
      }

      setDisableConfirm(remainingBalance <= 0)
    }
  }, [open, selectedItem])

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

  const formatStatusText = (status?: string) => {
    if (!status) return "NO RECORDS"
    if (status.toLowerCase() === "partial") return "PARTIAL PAYMENT"
    return status.toUpperCase()
  }

  const onChangePaymentType = (balance: number, value: string, minimumPartial: number) => {
    setSelectedPaymentType(value)
    value === "full" ? setPayNow(balance) : setPayNow(minimumPartial)
    setAmountError(false)
  }

  const onChangeAmount = (value: number, maxPay: number, minimum: number) => {
    value > maxPay || value < minimum ? setAmountError(true) : setAmountError(false)
    if (value === maxPay) {
      setSelectedPaymentType("full")
    }
    setPayNow(value)
  }

  const handleConfirmPayment = async (finalAmount: number) => {
    try {
      await addPaymentMutation({
        rentItemId: selectedItem.id,
        amount: finalAmount,
        status: selectedPaymentType,
        note: note.trim() || undefined,
      })
      toast.success("Payment completed successfully!")
      onClose()
      refetch()
    } catch (error: any) {
      toast.error(error.message || "Failed to complete payment")
    }
  }

  if (!selectedItem) return null

  const {
    baseRent,
    totalCharges,
    totalPenalty,
    totalPaid,
    daysRented,
    grandTotal,
    remainingBalance,
    initialFee,
  } = calculateRentTotals(selectedItem)

  const balance = remainingBalance
  const maxPay = remainingBalance

  // The minimum they can pay is the remaining initial fee. If that's already paid, they can pay any partial amount (min ₱1).
  const minimum = totalPaid < initialFee ? initialFee - totalPaid : 1

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: "16px" } }}
    >
      <DialogTitle className="font-bold text-xl border-b border-gray-100">
        Rental Payment
      </DialogTitle>
      <DialogContent className="flex flex-col gap-6 pt-6 scrollbar-seamless">
        {/* Payment Summary */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-2">
          <h4 className="font-bold text-gray-900 mb-4">Payment Summary</h4>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Base Rent ({daysRented} days)</span>
            <span className="font-medium">
              ₱{baseRent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          {totalPaid < initialFee && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Initial Fee (50%)</span>
              <span className="font-medium">
                ₱{initialFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {totalCharges > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Additional Charges (Damage/Late)</span>
              <span className="font-medium text-red-600">
                ₱{totalCharges.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {totalPenalty > 0 && (
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Penalty Fees</span>
              <span className="font-medium text-red-600">
                ₱{totalPenalty.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm mt-3 pt-3 border-t border-gray-200">
            <span className="text-gray-900 font-semibold">Grand Total</span>
            <span className="font-bold text-lg text-[#1b2a80]">
              ₱{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-gray-600">Paid Amount</span>
            <span className="font-medium text-green-600">
              - ₱{totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <span className="font-semibold text-blue-800">Remaining Balance</span>
            <span className="font-bold text-blue-800">
              ₱{balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Input Fields */}
        {balance > 0 && (
          <div className="flex flex-col gap-4">
            <FormControl component="fieldset" fullWidth>
              <FormLabel className="text-sm font-semibold text-gray-700 mb-2">
                Payment Type
              </FormLabel>
              <RadioGroup
                row
                value={selectedPaymentType}
                onChange={(e) => onChangePaymentType(balance, e.target.value, minimum)}
              >
                <FormControlLabel
                  value="partial"
                  disabled={balance <= 0}
                  control={
                    <Radio sx={{ color: "#1b2a80", "&.Mui-checked": { color: "#1b2a80" } }} />
                  }
                  label={
                    <Typography
                      variant="body2"
                      className="font-medium"
                      color={balance <= 0 ? "text.disabled" : "inherit"}
                    >
                      {totalPaid < initialFee ? "Initial Payment" : "Partial Payment"}
                    </Typography>
                  }
                />
                <FormControlLabel
                  value="full"
                  control={
                    <Radio sx={{ color: "#1b2a80", "&.Mui-checked": { color: "#1b2a80" } }} />
                  }
                  label={
                    <Typography variant="body2" className="font-medium">
                      Full Payment
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>

            <TextField
              label="Amount to Pay Now (₱)"
              type="number"
              fullWidth
              value={selectedPaymentType === "full" ? maxPay : payNow}
              onChange={(e) => onChangeAmount(Number(e.target.value), maxPay, minimum)}
              slotProps={{ input: { readOnly: selectedPaymentType === "full" || maxPay === 0 } }}
              error={amountError}
              helperText={
                selectedPaymentType === "full"
                  ? maxPay > 0
                    ? "Will pay the remaining balance in full."
                    : "No balance remaining."
                  : payNow > maxPay
                  ? `Warning: Amount exceeds remaining balance of ₱${maxPay.toLocaleString(
                      "en-US",
                      { minimumFractionDigits: 2 }
                    )}.`
                  : payNow < minimum
                  ? `Minimum partial payment is ₱${minimum.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}.`
                  : `Max you can pay now: ₱${maxPay.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}.`
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />

            <TextField
              label="Note / Reference No. (Optional)"
              type="text"
              fullWidth
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Reference No: 123456789"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
            />
          </div>
        )}

        {/* Status & History */}
        <div className="border-t border-gray-100 pt-2">
          {selectedItem.payments?.length > 0 && (
            <div className="flex items-center gap-3 mb-4">
              <Typography variant="subtitle2" className="font-bold text-gray-700">
                Latest Status:
              </Typography>
              <div className="flex items-center gap-2">
                <Chip
                  label={formatStatusText(
                    selectedItem.payments[selectedItem.payments.length - 1].status
                  )}
                  color={getStatusColor(
                    selectedItem.payments[selectedItem.payments.length - 1].status
                  )}
                  size="small"
                  sx={{ fontWeight: "bold" }}
                />
                <span className="text-xs text-gray-500 font-medium">
                  {formatDateTime(
                    selectedItem.payments[selectedItem.payments.length - 1].createdAt ||
                      selectedItem.payments[selectedItem.payments.length - 1].date
                  )}
                </span>
              </div>
            </div>
          )}

          <Typography variant="subtitle2" className="font-bold text-gray-700 mb-2">
            Transaction History:
          </Typography>
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 max-h-48 overflow-y-auto scrollbar-seamless">
            {selectedItem.payments.length > 0 ? (
              <ul className="flex flex-col gap-3">
                {[...selectedItem.payments].reverse().map((pm: any) => (
                  <li
                    key={pm.id}
                    className="flex justify-between items-center text-sm border-b border-gray-200 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">
                        ₱{pm.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5">
                        {formatDateTime(pm.createdAt || pm.date)}
                      </span>
                      {pm.note && pm.note !== "Rent payment" && (
                        <span className="text-xs text-gray-500 italic mt-0.5 break-words max-w-[200px] sm:max-w-[250px] leading-tight">
                          Note: {pm.note}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <Chip
                        label={formatStatusText(pm.status)}
                        size="small"
                        color={getStatusColor(pm.status)}
                        sx={{ height: 20, fontSize: "0.65rem", fontWeight: "bold" }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <Typography variant="body2" className="text-gray-500 text-center py-4">
                No transactions yet.
              </Typography>
            )}
          </div>
        </div>
      </DialogContent>
      <DialogActions className="p-4 border-t border-gray-100">
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: "bold" }}>
          {balance <= 0 ? "Close" : "Cancel"}
        </Button>
        {balance > 0 && (
          <Button
            variant="contained"
            disabled={disableConfirm || amountError}
            onClick={() => handleConfirmPayment(selectedPaymentType === "full" ? maxPay : payNow)}
            sx={{
              bgcolor: "#1b2a80",
              "&:hover": { bgcolor: "#152266" },
              borderRadius: "8px",
              px: 4,
              fontWeight: "bold",
            }}
            disableElevation
          >
            {selectedPaymentType === "full" ? `Pay ₱${maxPay}` : "Confirm Payment"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
