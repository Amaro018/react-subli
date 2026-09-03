import React, { useState } from "react"
import {
  Modal,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import StoreIcon from "@mui/icons-material/Store"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PendingIcon from "@mui/icons-material/Pending"
import CancelIcon from "@mui/icons-material/Cancel"
import BlockIcon from "@mui/icons-material/Block"
import ReportProblemIcon from "@mui/icons-material/ReportProblem"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag"
import Link from "next/link"
import getShops from "src/app/queries/getShops"
import { useSession } from "@blitzjs/auth"
import { useMutation, invalidateQuery, useQuery } from "@blitzjs/rpc"
import banShop from "src/app/mutations/banShop"
import { toast } from "@/src/app/utils/toast"
import unbanShop from "src/app/mutations/unbanShop"
import ShopHistory from "./ShopHistory"

type ShopType = Awaited<ReturnType<typeof getShops>>[number]

interface ShopDetailsModalProps {
  open: boolean
  onClose: () => void
  shop: ShopType | null
}

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", md: "80%" },
  maxWidth: 1000,
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 24,
  borderRadius: "12px",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  outline: "none",
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircleIcon fontSize="inherit" />
    case "pending":
      return <PendingIcon fontSize="inherit" />
    case "rejected":
      return <CancelIcon fontSize="inherit" />
    case "banned":
      return <BlockIcon fontSize="inherit" />
    case "reported":
      return <ReportProblemIcon fontSize="inherit" />
    default:
      return null
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "rejected":
      return "bg-red-100 text-red-800"
    case "banned":
      return "bg-red-100 text-red-800"
    case "reported":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

const ShopDetailsModal: React.FC<ShopDetailsModalProps> = ({ open, onClose, shop }) => {
  const handleOpenBanDialog = () => {
    setBanDialogOpen(true)
  }

  const handleCloseBanDialog = () => {
    setBanDialogOpen(false)
    setBanReason("")
  }

  const session = useSession()
  const [banShopMutation, { isLoading }] = useMutation(banShop)
  const [unbanShopMutation, { isLoading: isUnbanning }] = useMutation(unbanShop)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [confirmUnbanOpen, setConfirmUnbanOpen] = useState(false)

  if (!shop) return null

  const handleConfirmBan = async () => {
    if (!shop) return
    try {
      await banShopMutation({ shopId: shop.id, banReason: banReason })
      toast.success("Shop has been banned successfully.")
      await invalidateQuery(getShops, null)
      handleCloseBanDialog()
      onClose() // Close the main modal as well
    } catch (error: any) {
      toast.error(error.message || "Failed to ban the shop.")
    }
  }

  const handleConfirmUnban = async () => {
    if (!shop) return
    try {
      await unbanShopMutation({ shopId: shop.id })
      toast.success(`Shop "${shop.shopName}" has been un-banned.`)
      await invalidateQuery(getShops, null)
      setConfirmUnbanOpen(false)
      onClose() // Close the main modal as well
    } catch (error: any) {
      toast.error(error.message || "Failed to un-ban the shop.")
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box sx={style}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Shop Details</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="p-4 md:p-6 overflow-y-auto scrollbar-seamless">
            <div className="flex flex-col gap-6">
              {/* Shop Info */}
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-md font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                  <StoreIcon className="text-blue-600" />
                  Shop Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Shop Name
                    </p>
                    <p className="text-base font-medium text-gray-900">{shop.shopName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Owner Name
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {shop.user?.personalInfo
                        ? `${shop.user.personalInfo.firstName} ${shop.user.personalInfo.lastName}`
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Contact Number
                    </p>
                    <p className="text-base font-medium text-gray-900">{shop.contact}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Email Address
                    </p>
                    <p className="text-base font-medium text-gray-900">{shop.email}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Address
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {shop.street}, {shop.barangay}, {shop.city}, {shop.province}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                      Status
                    </p>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize items-center gap-1 ${getStatusColor(
                        shop.status
                      )}`}
                    >
                      {getStatusIcon(shop.status)}
                      {shop.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="text-md font-bold text-gray-900 mb-4">Legal Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      name: "DTI Registration",
                      status: shop.dtiStatus,
                      doc: shop.documentDTI,
                      path: "dti",
                    },
                    {
                      name: "Business Permit",
                      status: shop.permitStatus,
                      doc: shop.documentPermit,
                      path: "permit",
                    },
                    {
                      name: "Tax Clearance",
                      status: shop.taxStatus,
                      doc: shop.documentTax,
                      path: "tax",
                    },
                  ].map((doc) => (
                    <div
                      key={doc.name}
                      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-gray-700">{doc.name}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                            doc.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                      {doc.doc ? (
                        <Link
                          href={`/uploads/${doc.path}/${doc.doc}` as any}
                          target="_blank"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                        >
                          View Document
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not uploaded</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Appeal Section */}
              {shop.status === "banned" && shop.appeals && shop.appeals.length > 0 && (
                <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                  <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <HourglassEmptyIcon className="text-amber-600" />
                    Suspension Appeal
                  </h3>
                  {(() => {
                    const latestAppeal = shop.appeals[0]
                    return (
                      <div className="space-y-3">
                        <div className="bg-white p-4 rounded-lg border border-amber-100">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Appeal Status:</p>
                          <span
                            className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${
                              latestAppeal.status === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : latestAppeal.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {latestAppeal.status.charAt(0).toUpperCase() +
                              latestAppeal.status.slice(1)}
                          </span>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-amber-100">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Appeal Message:
                          </p>
                          <p className="text-sm text-gray-800 whitespace-pre-wrap">
                            {latestAppeal.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-3">
                            Submitted: {new Date(latestAppeal.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}

              {/* Shop Action History Section */}
              <ShopHistory shopId={shop.id} shopName="shop.shopName" />

              {/* Products Section */}
              {shop.products && shop.products.length > 0 && (
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingBagIcon className="text-blue-600" />
                    Current Products ({shop.products.length})
                  </h3>
                  <div className="space-y-3">
                    {shop.products.map((product: any) => (
                      <div
                        key={product.id}
                        className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Category:{" "}
                              <span className="font-medium text-gray-700">
                                {product.category?.name || "N/A"}
                              </span>
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full whitespace-nowrap ${
                              product.status === "active"
                                ? "bg-green-100 text-green-700"
                                : product.status === "inactive"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.status}
                          </span>
                        </div>
                        {product.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {session.role === "ADMIN" && (
            <div className="p-4 border-t border-gray-100 mt-auto bg-gray-50">
              <div className="flex justify-end gap-4">
                {shop.status !== "banned" && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<BlockIcon />}
                    onClick={handleOpenBanDialog}
                  >
                    Ban Shop
                  </Button>
                )}
                {shop.status === "banned" && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => setConfirmUnbanOpen(true)}
                    disabled={isUnbanning}
                  >
                    Un-ban Shop
                  </Button>
                )}
              </div>
            </div>
          )}
        </Box>
      </Modal>

      <Dialog open={banDialogOpen} onClose={handleCloseBanDialog}>
        <DialogTitle>Ban Shop</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please provide a reason for banning the shop &quot;{shop.shopName}&quot;. This reason{" "}
            will be recorded.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="banReason"
            label="Reason for Ban"
            type="text"
            fullWidth
            variant="standard"
            value={banReason} // This is the local state for the input
            onChange={(e) => setBanReason(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBanDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmBan}
            color="error"
            variant="contained"
            disabled={isLoading || banReason.trim() === ""}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : "Confirm Ban"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmUnbanOpen} onClose={() => setConfirmUnbanOpen(false)}>
        <DialogTitle>Confirm Un-ban</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to un-ban the shop &quot;{shop?.shopName}&quot;? After reviewing
            the appeal, shop details, and products, this action will restore the shop to approved
            status and re-enable all operations.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmUnbanOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmUnban}
            color="success"
            variant="contained"
            disabled={isUnbanning}
          >
            {isUnbanning ? <CircularProgress size={24} color="inherit" /> : "Confirm Un-ban"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ShopDetailsModal
