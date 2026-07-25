import React, { memo } from "react"
import Image from "next/image"
import { Chip, Stepper, Step, StepLabel, CircularProgress, Tooltip } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import StepIcon from "@mui/material/StepIcon"
import { formatDateTime, calculateRentTotals } from "./utils"

type Payment = {
  id: number
  amount: number
  status: string
  penaltyFee?: number | null
  createdAt: Date | string
  date?: Date | string
  note?: string | null
}
type Charge = {
  id: number
  type: "damaged" | "late"
  subType: "repair" | "replacement"
  repairType: "minor" | "moderate" | "major"
  amount: number
  quantity: number
}

export interface RentItemData {
  id: number
  status: string
  quantity: number
  price: number
  startDate: Date | string
  endDate: Date | string
  deliveryMethod: string
  productVariant: {
    attributes: { attributeValue: { value: string } }[]
    product: {
      name: string
      status: string
      images?: { isThumbnail: boolean | null; url: string }[]
    }
  }
  rent: {
    user: {
      email: string
      personalInfo?: {
        firstName: string
        middleName?: string | null
        lastName: string
        phoneNumber?: string | null
      } | null
    }
    deliveryAddress: string
  }
  payments?: Payment[]
  charges?: Charge[]
}

export interface RentItemRowProps {
  rentItem: RentItemData
  loadingAction: "accept" | "cancel" | "on_hand" | null
  handleAction: (rentItem: RentItemData, action: "accept" | "cancel") => void
  handleOpenPayments: (rentItem: RentItemData) => void
  handleReturnAction: (rentItem: RentItemData, action: "view" | "return" | "handover") => void
  isHighlighted?: boolean
}

const RentItemRow = memo(function RentItemRow({
  rentItem,
  loadingAction,
  handleAction,
  handleOpenPayments,
  handleReturnAction,
  isHighlighted,
}: RentItemRowProps) {
  const isReturned = ["returned", "returned_damaged", "completed"].includes(rentItem.status)
  const isHandedOver = ["on_hand", "rendering", "overdue"].includes(rentItem.status)

  // Determine if the specific "Handover" action should be disabled
  const isHandoverDisabled = !isReturned && !isHandedOver && rentItem.status !== "accepted"

  const canShowActions = [
    "accepted",
    "rendering",
    "on_hand",
    "overdue",
    "returned",
    "returned_damaged",
    "completed",
  ].includes(rentItem.status)

  const variantDisplay = rentItem.productVariant.attributes
    .map((attr: { attributeValue: { value: string } }) => attr.attributeValue.value)
    .join(" / ")

  const isProductArchived = rentItem?.productVariant?.product?.status === "deleted"
  const thumbnail =
    rentItem.productVariant.product.images?.find(
      (img: { isThumbnail: boolean | null; url: string }) => img.isThumbnail
    ) || rentItem.productVariant.product.images?.[0]

  const { baseRent, totalCharges, totalPenalty, totalPaid, grandTotal, remainingBalance } =
    calculateRentTotals(rentItem)
  return (
    <div
      id={`order-row-${rentItem.id}`}
      className={`grid grid-cols-1 lg:grid-cols-12 gap-6 py-6 transition-colors duration-500 ease-in-out hover:bg-gray-50 -mx-4 px-4 sm:-mx-6 sm:px-6 ${
        isHighlighted ? "bg-[#eef2ff] rounded-xl" : ""
      }`}
    >
      {/* Product Image */}
      <div className="flex justify-center items-center lg:col-span-2">
        <Image
          src={thumbnail ? `/uploads/products/${thumbnail.url}` : "/placeholder.png"}
          alt={rentItem.productVariant.product.name}
          width={100}
          height={100}
          className="w-24 h-24 object-cover rounded-md shadow"
        />
      </div>

      {/* Product Details */}
      <div className="space-y-1 text-sm lg:col-span-4">
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
          {formatDateTime(rentItem.startDate)} – {formatDateTime(rentItem.endDate)} (
          {Math.ceil(
            (new Date(rentItem.endDate).getTime() - new Date(rentItem.startDate).getTime()) /
              (1000 * 60 * 60 * 24)
          )}{" "}
          days)
        </p>
        <p className="text-gray-600">Variant: {variantDisplay || "Default"}</p>
        <p className="text-gray-600">Qty: {rentItem.quantity}</p>
        <p className="text-gray-600">Price per item: ₱{rentItem.price.toFixed(2)}</p>
        <p className="font-semibold">
          Total Rent: ₱{baseRent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        {remainingBalance > 0 &&
          rentItem.status !== "pending" &&
          rentItem.status !== "canceled" && (
            <Tooltip
              title={
                <div className="p-1 space-y-1 text-xs">
                  <div className="flex justify-between gap-4">
                    <span>Base Rent:</span>
                    <span>₱{baseRent.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {totalCharges > 0 && (
                    <div className="flex justify-between gap-4">
                      <span>Damage Fees:</span>
                      <span>
                        ₱{totalCharges.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  {totalPenalty > 0 && (
                    <div className="flex justify-between gap-4">
                      <span>Late Penalties:</span>
                      <span>
                        ₱{totalPenalty.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                  <hr className="my-1 border-gray-500" />
                  <div className="flex justify-between gap-4 font-bold text-sm">
                    <span>Grand Total:</span>
                    <span>₱{grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-green-400">
                    <span>Total Paid:</span>
                    <span>
                      - ₱{totalPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <hr className="my-1 border-gray-500" />
                  <div className="flex justify-between gap-4 font-bold text-red-400">
                    <span>Outstanding:</span>
                    <span>
                      ₱{remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              }
              arrow
              placement="top-start"
            >
              <p className="font-bold text-red-600 cursor-help border-b border-dotted border-red-600 w-fit">
                Balance Due: ₱
                {remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </Tooltip>
          )}
      </div>

      {/* Renter Details */}
      <div className="space-y-1 text-sm lg:col-span-3">
        <p className="font-semibold">
          {rentItem.rent.user.personalInfo?.firstName} {rentItem.rent.user.personalInfo?.middleName}{" "}
          {rentItem.rent.user.personalInfo?.lastName}
        </p>
        <p>{rentItem.rent.user.email}</p>
        <p>{rentItem.rent.user.personalInfo?.phoneNumber}</p>
        <p>{rentItem.rent.deliveryAddress}</p>
        <p className="italic text-gray-600">Delivery: {rentItem.deliveryMethod}</p>
      </div>

      {/* Status + Stepper (occupies 3 columns) */}
      <div className="flex flex-col items-start space-y-3 lg:col-span-3">
        <Stepper
          activeStep={
            rentItem.status === "pending" ||
            rentItem.status === "accepted" ||
            rentItem.status === "canceled"
              ? 0
              : rentItem.status === "rendering" ||
                rentItem.status === "on_hand" ||
                rentItem.status === "overdue" ||
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
              : rentItem.status === "overdue"
              ? "bg-orange-100 text-orange-800 border border-orange-200 shadow-sm"
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
              onClick={() => handleOpenPayments(rentItem)}
            >
              Payments
            </button>
            <button
              className="px-4 py-2 rounded text-white bg-green-600 hover:bg-green-700 min-w-[120px] inline-flex items-center justify-center"
              onClick={() =>
                handleReturnAction(
                  rentItem,
                  isReturned ? "view" : isHandedOver ? "return" : "handover"
                )
              }
              disabled={loadingAction === "on_hand" || isHandoverDisabled}
              style={{
                opacity: isHandoverDisabled ? 0.6 : 1,
                cursor: isHandoverDisabled ? "not-allowed" : "pointer",
              }}
            >
              {loadingAction === "on_hand" ? (
                <CircularProgress size={20} sx={{ color: "white" }} />
              ) : isReturned ? (
                "View Returned Items"
              ) : isHandedOver ? (
                "Return Items"
              ) : (
                "Hand Items"
              )}
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

export default RentItemRow
