import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { toast } from "sonner"

const TEXTFIELD_SX = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    "&:hover fieldset": { borderColor: "#1b2a80" },
    "&.Mui-focused fieldset": { borderColor: "#1b2a80", borderWidth: "2px" },
  },
}

const formatTime = (timeStr: string) => {
  const [h, m] = timeStr.split(":").map(Number)
  return `${h! % 12 || 12}:${String(m).padStart(2, "0")} ${h! >= 12 ? "PM" : "AM"}`
}

interface BookingCheckoutModalProps {
  open: boolean
  onClose: () => void
  onConfirm: (deliveryAddress: string) => void
  isCheckingOut: boolean
  product: any
  selectedVariant: any
  selectedAttributes: Record<string, string>
  quantity: number
  rentalMetrics: any
  rentalBasePrice: number
  initialFee: number
  selectedDelivery: string | null
  defaultUserAddress: string
  barangays: any[]
  startDate: Date | null
  endDate: Date | null
  startTime: string
  endTime: string
}

export default function BookingCheckoutModal({
  open,
  onClose,
  onConfirm,
  isCheckingOut,
  product,
  selectedVariant,
  selectedAttributes,
  quantity,
  rentalMetrics,
  rentalBasePrice,
  initialFee,
  selectedDelivery,
  defaultUserAddress,
  barangays,
  startDate,
  endDate,
  startTime,
  endTime,
}: BookingCheckoutModalProps) {
  const [addressOption, setAddressOption] = useState<"default" | "custom">("default")
  const [customAddressObj, setCustomAddressObj] = useState({
    street: "",
    barangay: "",
    city: "Legazpi City",
    province: "Albay",
    country: "Philippines",
    zipCode: "4500",
  })

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingAddress, setPendingAddress] = useState("")

  useEffect(() => {
    if (!defaultUserAddress) {
      setAddressOption("custom")
    } else {
      setAddressOption("default")
    }
  }, [defaultUserAddress, open])

  const handleConfirm = () => {
    let deliveryAddress = ""
    if (selectedDelivery === "delivery") {
      if (addressOption === "default") {
        deliveryAddress = defaultUserAddress
      } else {
        if (!customAddressObj.street.trim() || !customAddressObj.barangay) {
          toast.error("Please fill out both Street and Barangay for your custom address.")
          return
        }
        deliveryAddress = `${customAddressObj.street.trim()}, ${customAddressObj.barangay}, ${
          customAddressObj.city
        }, ${customAddressObj.province}, ${customAddressObj.country}, ${customAddressObj.zipCode}`
      }
      if (!deliveryAddress) {
        toast.error("A valid delivery address is required to proceed.")
        return
      }
    } else {
      deliveryAddress = "Pickup at Shop"
    }

    setPendingAddress(deliveryAddress)
    setConfirmOpen(true)
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px" } }}
      >
        <DialogTitle className="font-bold text-xl border-b border-gray-100">
          Checkout Summary
        </DialogTitle>
        <DialogContent className="flex flex-col gap-6 pt-6 scrollbar-seamless">
          {/* Order Summary breakdown */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-2">
            <h4 className="font-bold text-gray-900 mb-4">Order Details</h4>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Item</span>
              <span className="font-medium text-right max-w-[60%]">{product.name}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Variant</span>
              <span className="font-medium">
                {selectedVariant ? Object.values(selectedAttributes).join(" / ") || "Default" : ""}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Quantity</span>
              <span className="font-medium">{quantity}x</span>
            </div>
            {startDate && endDate && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Schedule</span>
                <span className="font-medium text-right max-w-[60%]">
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(startDate)}{" "}
                  at {formatTime(startTime)}
                  <br />
                  <span className="text-gray-400 text-xs mx-1">to</span>
                  {new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }).format(endDate)}{" "}
                  at {formatTime(endTime)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{rentalMetrics.display}</span>
            </div>
            <div className="flex justify-between text-sm mb-2 mt-3 pt-3 border-t border-gray-200">
              <span className="text-gray-900 font-semibold">Total Rent</span>
              <span className="font-bold text-lg text-[#1b2a80]">
                ₱{rentalBasePrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1 text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-100">
              <span className="font-semibold flex items-center gap-1">
                <InfoOutlinedIcon sx={{ fontSize: 16 }} /> Initial Fee (50%)
              </span>
              <span className="font-bold">
                ₱{initialFee.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2 italic text-center">
              Note: The initial fee must be paid upon delivery or pickup.
            </p>
          </div>

          {/* Delivery Address Selection */}
          {selectedDelivery === "delivery" && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Delivery Address</p>
              <div className="flex flex-col gap-3">
                {defaultUserAddress && (
                  <label
                    htmlFor="address-default"
                    className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border transition-all hover:bg-gray-50 ${
                      addressOption === "default"
                        ? "border-[#1b2a80] bg-[#1b2a80]/5 ring-1 ring-[#1b2a80]"
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      id="address-default"
                      type="radio"
                      name="modalAddressOption"
                      value="default"
                      checked={addressOption === "default"}
                      onChange={() => setAddressOption("default")}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Default Profile Address</p>
                      <p className="text-xs text-gray-600 mt-1">{defaultUserAddress}</p>
                    </div>
                  </label>
                )}
                <label
                  htmlFor="address-custom"
                  className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border transition-all hover:bg-gray-50 ${
                    addressOption === "custom"
                      ? "border-[#1b2a80] bg-[#1b2a80]/5 ring-1 ring-[#1b2a80]"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    id="address-custom"
                    type="radio"
                    name="modalAddressOption"
                    value="custom"
                    checked={addressOption === "custom"}
                    onChange={() => setAddressOption("custom")}
                    className="mt-1.5"
                  />
                  <div className="w-full">
                    <p className="font-bold text-gray-900 text-sm mb-3">Use a Different Address</p>
                    {addressOption === "custom" && (
                      <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                          <TextField
                            required
                            size="small"
                            label="Street"
                            value={customAddressObj.street}
                            onChange={(e) =>
                              setCustomAddressObj((prev) => ({ ...prev, street: e.target.value }))
                            }
                            fullWidth
                            sx={TEXTFIELD_SX}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth required size="small" sx={TEXTFIELD_SX}>
                            <InputLabel>Barangay</InputLabel>
                            <Select
                              value={customAddressObj.barangay}
                              label="Barangay"
                              onChange={(e) => {
                                const selectedBarangay = barangays.find(
                                  (b: any) => b.name === e.target.value
                                )
                                setCustomAddressObj((prev) => ({
                                  ...prev,
                                  barangay: e.target.value as string,
                                  zipCode: selectedBarangay?.zipCode || prev.zipCode,
                                }))
                              }}
                            >
                              {barangays.map((b: any) => (
                                <MenuItem key={b.id} value={b.name}>
                                  {b.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <TextField
                            size="small"
                            label="City"
                            value={customAddressObj.city}
                            fullWidth
                            disabled
                            sx={TEXTFIELD_SX}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            size="small"
                            label="Province"
                            value={customAddressObj.province}
                            fullWidth
                            disabled
                            sx={TEXTFIELD_SX}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            size="small"
                            label="Country"
                            value={customAddressObj.country}
                            fullWidth
                            disabled
                            sx={TEXTFIELD_SX}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            size="small"
                            label="Zip Code"
                            value={customAddressObj.zipCode}
                            fullWidth
                            disabled
                            sx={TEXTFIELD_SX}
                          />
                        </Grid>
                      </Grid>
                    )}
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Pickup Location Note */}
          {selectedDelivery === "pickup" && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Pickup Location</p>
              <div className="p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 flex gap-3 items-start">
                <InfoOutlinedIcon sx={{ fontSize: 20 }} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm mb-1">{product?.shop?.shopName} Address</p>
                  <p className="text-sm">
                    {[
                      product?.shop?.street,
                      product?.shop?.barangay,
                      product?.shop?.city,
                      product?.shop?.province,
                      product?.shop?.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ") || "Shop address not provided."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions className="p-4 border-t border-gray-100">
          <Button
            onClick={onClose}
            disabled={isCheckingOut}
            color="inherit"
            sx={{ fontWeight: "bold" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isCheckingOut}
            variant="contained"
            sx={{
              bgcolor: "#1b2a80",
              "&:hover": { bgcolor: "#152266" },
              borderRadius: "8px",
              px: 4,
              fontWeight: "bold",
            }}
          >
            {isCheckingOut ? "Processing..." : "Confirm Order"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Checkout</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to proceed with the checkout?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setConfirmOpen(false)
              onConfirm(pendingAddress)
            }}
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
