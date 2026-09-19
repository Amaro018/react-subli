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
  rentId: number
  shopId?: number | null
  status: string
  quantity: number
  price: number
  startDate: Date | string
  endDate: Date | string
  deliveryMethod: string
  returnedDamagedQty?: number | null
  productVariant: {
    id: number
    quantity: number
    price: number
    attributes?: { attributeValue?: { value: string } | null }[] | null
    variantAttributeValues?: { attributeValue?: { value: string } | null }[] | null
    product: {
      id: number
      name: string
      status: string
      shopId: number
      images?: { isThumbnail: boolean | null; url: string }[]
    }
  }
  rent: {
    id: number
    userId: number
    deliveryAddress: string
    user?: {
      email: string
      personalInfo?: {
        firstName: string
        middleName?: string | null
        lastName: string
        phoneNumber?: string | null
      } | null
    } | null
  }
  payments?: Payment[]
  charges?: Charge[]
}

export interface RentItemRowProps {
  rentItem: RentItemData
  loadingAction: "accept" | "cancel" | "on_hand" | null
  handleAction: (rentItem: RentItemData, action: "accept" | "cancel") => void
  handleHandover: (rentItem: RentItemData) => void
  handleInspectReturn: (rentItem: RentItemData) => void
  handleViewReturnDetails: (rentItem: RentItemData) => void
  handleOpenPayments: (rentItem: RentItemData) => void
  isHighlighted?: boolean
}

const RentItemRow = memo(function RentItemRow({
  rentItem,
  loadingAction,
  handleAction,
  handleHandover,
  handleInspectReturn,
  handleViewReturnDetails,
  handleOpenPayments,
  isHighlighted,
}: RentItemRowProps) {
  const isReturned = ["returned", "returned_damaged", "completed"].includes(rentItem.status)
  const isHandedOver = ["on_hand", "rendering", "overdue"].includes(rentItem.status)

  const canShowActions = [
    "accepted",
    "rendering",
    "on_hand",
    "overdue",
    "returned",
    "returned_damaged",
    "completed",
  ].includes(rentItem.status)

  // Extract attributes safely handling both attributes and variantAttributeValues schemas
  const rawAttributes =
    rentItem.productVariant?.attributes || rentItem.productVariant?.variantAttributeValues || []
  const variantDisplay = rawAttributes
    .map((attr) => attr?.attributeValue?.value)
    .filter(Boolean)
    .join(" / ")

  const isProductArchived = rentItem?.productVariant?.product?.status === "deleted"
  const thumbnail =
    rentItem.productVariant?.product?.images?.find(
      (img: { isThumbnail: boolean | null; url: string }) => img.isThumbnail
    ) || rentItem.productVariant?.product?.images?.[0]

  const { baseRent, totalCharges, totalPenalty, totalPaid, grandTotal, remainingBalance } =
    calculateRentTotals(rentItem)

  const user = rentItem.rent?.user
  const personalInfo = user?.personalInfo
  const renterName = personalInfo
    ? `${personalInfo.firstName || ""} ${personalInfo.middleName || ""} ${
        personalInfo.lastName || ""
      }`.trim()
    : user?.email || "N/A"

  const imageSrc = thumbnail?.url
    ? thumbnail.url.startsWith("http") || thumbnail.url.startsWith("/")
      ? thumbnail.url
      : `/uploads/products/${thumbnail.url}`
    : "/placeholder.png"

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
          src={imageSrc}
          alt={rentItem.productVariant?.product?.name || "Product"}
          width={100}
          height={100}
          className="w-24 h-24 object-cover rounded-md shadow"
        />
      </div>

      {/* Product Details */}
      <div className="space-y-1 text-sm lg:col-span-4">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-lg">
            {rentItem.productVariant?.product?.name || "Unnamed Product"}
          </p>
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
        <p className="font-semibold">{renterName}</p>
        <p>{user?.email || "No email"}</p>
        <p>{personalInfo?.phoneNumber || "No phone"}</p>
        <p>{rentItem.rent?.deliveryAddress || "N/A"}</p>
        <p className="italic text-gray-600">Delivery: {rentItem.deliveryMethod}</p>
      </div>

      {/* Status + Stepper */}
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

        {/* Current Status Badge */}
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

        {/* Pending Actions */}
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

        {/* Guided Actions */}
        {canShowActions && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 w-full">
            {/* Primary Action: Step 1 (Accepted -> Hand Over) */}
            {rentItem.status === "accepted" && (
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all min-w-[130px] inline-flex items-center justify-center text-sm"
                onClick={() => handleHandover(rentItem)}
                disabled={loadingAction === "on_hand"}
              >
                {loadingAction === "on_hand" ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : (
                  "Hand Over Item"
                )}
              </button>
            )}

            {/* Primary Action: Step 2 (On Hand -> Return Inspection) */}
            {isHandedOver && (
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all min-w-[130px] inline-flex items-center justify-center text-sm"
                onClick={() => handleInspectReturn(rentItem)}
              >
                Process Return
              </button>
            )}

            {/* Primary Action: Step 3 (Returned -> Payment / Summary) */}
            {isReturned && (
              <>
                {remainingBalance > 0 ? (
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-all text-sm"
                    onClick={() => handleOpenPayments(rentItem)}
                  >
                    Settle ₱{remainingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </button>
                ) : (
                  <button
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-lg transition-all text-sm"
                    onClick={() => handleViewReturnDetails(rentItem)}
                  >
                    View Return Summary
                  </button>
                )}
              </>
            )}

            {/* Auxiliary Action: Payments Log */}
            {rentItem.status !== "completed" && !(isReturned && remainingBalance > 0) && (
              <button
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium px-3 py-2 rounded-lg text-sm transition-all"
                onClick={() => handleOpenPayments(rentItem)}
              >
                Payment History
              </button>
            )}
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
