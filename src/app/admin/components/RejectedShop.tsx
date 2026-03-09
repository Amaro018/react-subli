"use client"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getShops from "../../queries/getShops"
import React, { useState, useEffect, useRef, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import {
  Button,
  Typography,
  Modal,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material"
import CancelIcon from "@mui/icons-material/Cancel"
import CloseIcon from "@mui/icons-material/Close"
import StoreIcon from "@mui/icons-material/Store"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore"
import DocumentViewer from "./DocumentViewer"
import updateShopStatus from "../../mutations/updateShopStatus"
import { toast } from "sonner"

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "95%", md: "90%" },
  maxWidth: 1200,
  bgcolor: "background.paper",
  border: "none",
  boxShadow: 24,
  borderRadius: "12px",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  outline: "none",
}

type ShopType = Awaited<ReturnType<typeof getShops>>[number]

interface RejectedShopProps {
  status?: string
}

export default function RejectedShop({ status }: RejectedShopProps) {
  const [shops, { refetch }] = useQuery(getShops, null)
  const searchParams = useSearchParams()
  const [updateStatusMutation] = useMutation(updateShopStatus)
  const [currentPage, setCurrentPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState<ShopType | null>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ShopType
    direction: "asc" | "desc"
  } | null>(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{
    documentType: any
    status: any
  } | null>(null)
  const [note, setNote] = useState("")
  const [stagedDecisions, setStagedDecisions] = useState<
    Record<number, Record<string, { status: string; note?: string }>>
  >({})
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false)

  const itemsPerPage = 10
  const lastProcessedShopId = useRef<number | null>(null)

  const sortedShops = useMemo(() => {
    let sortableItems = [...shops]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key]
        let bValue: any = b[sortConfig.key]

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1
        }
        return 0
      })
    }
    return sortableItems
  }, [shops, sortConfig])

  const filteredShops = sortedShops.filter((shop: ShopType) => {
    return status ? shop.status === status : true
  })

  const highlightShopId = Number(searchParams.get("shopId"))

  useEffect(() => {
    if (highlightShopId && filteredShops.length > 0) {
      if (lastProcessedShopId.current !== highlightShopId) {
        const shopIndex = filteredShops.findIndex((s) => s.id === highlightShopId)
        if (shopIndex !== -1) {
          const targetPage = Math.floor(shopIndex / itemsPerPage) + 1
          if (currentPage !== targetPage) {
            setCurrentPage(targetPage)
          }
          lastProcessedShopId.current = highlightShopId

          setTimeout(() => {
            const element = document.getElementById(`shop-row-${highlightShopId}`)
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" })
            }
          }, 100)
        }
      }
    }
  }, [highlightShopId, filteredShops, currentPage])

  useEffect(() => {
    const hasUnsavedChanges = Object.keys(stagedDecisions).length > 0
    if (typeof window !== "undefined") {
      ;(window as any).hasUnsavedChanges = hasUnsavedChanges
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      if (typeof window !== "undefined") {
        ;(window as any).hasUnsavedChanges = false
      }
    }
  }, [stagedDecisions])

  const handleOpen = (shop: ShopType) => {
    setSelectedShop(shop)
    setOpen(true)
  }
  const handleClose = () => {
    if (open && selectedShop) {
      const decisions = stagedDecisions[selectedShop.id]
      if (decisions && Object.keys(decisions).length > 0) {
        setCloseConfirmOpen(true)
        return
      }
    }
    setOpen(false)
  }

  const handleConfirmClose = () => {
    setCloseConfirmOpen(false)
    setOpen(false)
  }

  const openConfirmModal = (documentType: string | null, status: string) => {
    setPendingAction({ documentType, status })
    setNote("")
    setConfirmModalOpen(true)
  }

  const handleConfirm = async () => {
    if (!pendingAction) return

    if (pendingAction.documentType) {
      // Stage the decision locally
      const currentShopDecisions: Record<string, { status: string; note?: string }> =
        stagedDecisions[selectedShop!.id] || {}
      const newShopDecisions: Record<string, { status: string; note?: string }> = {
        ...currentShopDecisions,
        [pendingAction.documentType]: { status: pendingAction.status, note },
      }

      setStagedDecisions((prev) => ({ ...prev, [selectedShop!.id]: newShopDecisions }))
      toast.success(`${pendingAction.documentType} marked as ${pendingAction.status}`)
      setConfirmModalOpen(false)
      setPendingAction(null)
      setNote("")

      if (selectedShop) {
        const dtiPending =
          selectedShop.dtiStatus === "pending" || selectedShop.dtiStatus === "resubmit"
        const permitPending =
          selectedShop.permitStatus === "pending" || selectedShop.permitStatus === "resubmit"
        const taxPending =
          selectedShop.taxStatus === "pending" || selectedShop.taxStatus === "resubmit"

        const dtiDecided = !dtiPending || !!newShopDecisions["DTI"]
        const permitDecided = !permitPending || !!newShopDecisions["PERMIT"]
        const taxDecided = !taxPending || !!newShopDecisions["TAX_CLEARANCE"]

        if (dtiDecided && permitDecided && taxDecided) {
          setOpen(false)
        }
      }
    } else {
      // It's a shop status update, proceed with mutation
      await handleUpdateStatus(null, pendingAction.status, note)
      setConfirmModalOpen(false)
      setPendingAction(null)
      setNote("")
    }
  }

  const handleUpdateStatus = async (documentType: any, status: any, note?: string) => {
    if (!selectedShop) return

    const shopDecisions = stagedDecisions[selectedShop.id]

    try {
      await updateStatusMutation({
        shopId: selectedShop.id,
        documentType: documentType || undefined,
        status,
        shopUserId: selectedShop.userId,
        note,
        documentUpdates: !documentType ? shopDecisions : undefined,
      })
      toast.success(`${documentType || "Shop"} has been ${status}`)
      // Clear staged decisions for this shop after successful update
      setStagedDecisions((prev) => {
        const newState = { ...prev }
        delete newState[selectedShop.id]
        return newState
      })
      await refetch()
      setOpen(false)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const requestSort = (key: keyof ShopType) => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <UnfoldMoreIcon fontSize="inherit" className="opacity-40" />
    }
    if (sortConfig.direction === "asc") {
      return <ArrowUpwardIcon fontSize="inherit" />
    }
    return <ArrowDownwardIcon fontSize="inherit" />
  }

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage)
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="w-full">
      <div className="w-full rounded-lg border border-gray-200 shadow-sm overflow-x-auto scrollbar-hide">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider w-12">
                #
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider">
                <button
                  onClick={() => requestSort("shopName")}
                  className="flex items-center gap-1 group hover:text-gray-700"
                >
                  Name {getSortIcon("shopName")}
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell">
                <button
                  onClick={() => requestSort("updatedAt")}
                  className="flex items-center gap-1 group hover:text-gray-700"
                >
                  Resubmission Date {getSortIcon("updatedAt")}
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden lg:table-cell">
                Rejection Reason
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
                Status
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedShops.length > 0 ? (
              paginatedShops.map((shop: ShopType, index: number) => {
                const shopStaged = stagedDecisions[shop.id] || {}
                const dtiStatus = shopStaged["DTI"]?.status || shop.dtiStatus
                const permitStatus = shopStaged["PERMIT"]?.status || shop.permitStatus
                const taxStatus = shopStaged["TAX_CLEARANCE"]?.status || shop.taxStatus

                const hasStagedChanges = Object.keys(shopStaged).length > 0
                const allDocumentsApproved =
                  dtiStatus === "approved" &&
                  permitStatus === "approved" &&
                  taxStatus === "approved"
                const anyDocumentRejected =
                  dtiStatus === "rejected" ||
                  permitStatus === "rejected" ||
                  taxStatus === "rejected"
                const hasPendingDocuments =
                  dtiStatus === "pending" ||
                  dtiStatus === "resubmit" ||
                  permitStatus === "pending" ||
                  permitStatus === "resubmit" ||
                  taxStatus === "pending" ||
                  taxStatus === "resubmit"
                const hasResubmitted =
                  shop.dtiStatus === "pending" ||
                  shop.dtiStatus === "resubmit" ||
                  shop.permitStatus === "pending" ||
                  shop.permitStatus === "resubmit" ||
                  shop.taxStatus === "pending" ||
                  shop.taxStatus === "resubmit"

                return (
                  <tr
                    key={shop.id}
                    id={`shop-row-${shop.id}`}
                    className={`${
                      shop.id === highlightShopId ? "bg-blue-50" : "hover:bg-gray-50"
                    } transition-colors`}
                  >
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                      {shop.shopName}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell whitespace-nowrap">
                      {new Date(shop.updatedAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-red-500 hidden lg:table-cell">
                      {shop.rejectionReason || "No reason provided"}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 capitalize items-center gap-1">
                          <CancelIcon fontSize="inherit" />
                          {shop.status}
                        </span>
                        {hasResubmitted && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 capitalize items-center gap-1">
                            Resubmitted
                          </span>
                        )}
                        {hasStagedChanges && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 capitalize items-center gap-1">
                            Unsaved Changes
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap">
                      {hasResubmitted ? (
                        <div className="flex flex-col gap-2">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors w-full"
                            onClick={() => handleOpen(shop)}
                          >
                            View Documents
                          </button>
                          <div className="flex gap-2 justify-center">
                            <Tooltip
                              title={
                                hasPendingDocuments
                                  ? "Please review resubmitted documents first"
                                  : !allDocumentsApproved
                                  ? "All documents must be approved to approve the shop"
                                  : ""
                              }
                            >
                              <span className="flex-1">
                                <button
                                  className={`w-full text-white text-xs font-medium py-2 px-3 rounded transition-colors ${
                                    !hasPendingDocuments && allDocumentsApproved
                                      ? "bg-green-500 hover:bg-green-600"
                                      : "bg-gray-400 cursor-not-allowed"
                                  }`}
                                  disabled={hasPendingDocuments || !allDocumentsApproved}
                                  onClick={() => {
                                    setSelectedShop(shop)
                                    openConfirmModal(null, "approved")
                                  }}
                                >
                                  Approve
                                </button>
                              </span>
                            </Tooltip>
                            <Tooltip
                              title={
                                hasPendingDocuments
                                  ? "Please review resubmitted documents first"
                                  : !anyDocumentRejected
                                  ? "At least one document must be rejected to reject the shop"
                                  : ""
                              }
                            >
                              <span className="flex-1">
                                <button
                                  className={`w-full text-white text-xs font-medium py-2 px-3 rounded transition-colors whitespace-nowrap ${
                                    !hasPendingDocuments && anyDocumentRejected
                                      ? "bg-red-500 hover:bg-red-600"
                                      : "bg-gray-400 cursor-not-allowed"
                                  }`}
                                  disabled={hasPendingDocuments || !anyDocumentRejected}
                                  onClick={() => {
                                    setSelectedShop(shop)
                                    openConfirmModal(null, "rejected")
                                  }}
                                >
                                  Reject
                                </button>
                              </span>
                            </Tooltip>
                          </div>
                          {!hasPendingDocuments && (
                            <div className="text-xs font-bold text-center">
                              {allDocumentsApproved ? (
                                <span className="text-green-600">Documents Approved</span>
                              ) : anyDocumentRejected ? (
                                <span className="text-red-600">Documents Rejected</span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <button
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                            onClick={() => handleOpen(shop)}
                          >
                            View Documents
                          </button>
                          <span className="text-xs text-gray-500 italic">
                            Shop has not resubmitted
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 sm:px-6 py-10 text-center text-gray-500 text-sm">
                  No rejected shops found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center my-4 items-center gap-4">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
            Previous
          </Button>
          <Typography variant="body2">
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-bold text-gray-800">Review Documents</h2>
              {selectedShop?.rejectionReason && (
                <p className="text-sm text-red-600">
                  <span className="font-semibold">Rejection Reason:</span>{" "}
                  {selectedShop.rejectionReason}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row scrollbar-seamless">
            <div className="w-full lg:w-1/3 p-4 md:p-6 lg:h-full lg:overflow-y-auto scrollbar-seamless">
              {selectedShop && (
                <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm h-fit">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b pb-4">
                    <StoreIcon className="text-blue-600" /> Shop Details
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Shop Name
                      </p>
                      <p className="text-base font-medium text-gray-900">{selectedShop.shopName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Owner Name
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedShop.user?.personalInfo
                          ? `${selectedShop.user.personalInfo.firstName} ${selectedShop.user.personalInfo.lastName}`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Contact Number
                      </p>
                      <p className="text-base font-medium text-gray-900">{selectedShop.contact}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Email Address
                      </p>
                      <p className="text-base font-medium text-gray-900">{selectedShop.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full lg:w-2/3 p-4 md:p-6 bg-gray-50 lg:h-full lg:overflow-y-auto scrollbar-seamless flex flex-col gap-6">
              {selectedShop && (
                <>
                  {selectedShop.dtiStatus === "pending" || selectedShop.dtiStatus === "resubmit" ? (
                    <DocumentViewer
                      title="DTI Document"
                      documentUrl={
                        selectedShop.documentDTI ? `/uploads/dti/${selectedShop.documentDTI}` : null
                      }
                      status={
                        (stagedDecisions[selectedShop.id]?.["DTI"]?.status ||
                          selectedShop.dtiStatus) as any
                      }
                      onApprove={() => openConfirmModal("DTI", "approved")}
                      onReject={() => openConfirmModal("DTI", "rejected")}
                      showActions={true}
                    />
                  ) : selectedShop.dtiStatus === "rejected" ? (
                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">DTI Document</h3>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 capitalize">
                          Rejected
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <CancelIcon className="text-gray-400 mb-2" fontSize="large" />
                        <p>Renter has not resubmitted this file yet.</p>
                      </div>
                    </div>
                  ) : null}

                  {selectedShop.permitStatus === "pending" ||
                  selectedShop.permitStatus === "resubmit" ? (
                    <DocumentViewer
                      title="Permit Document"
                      documentUrl={
                        selectedShop.documentPermit
                          ? `/uploads/permit/${selectedShop.documentPermit}`
                          : null
                      }
                      status={
                        (stagedDecisions[selectedShop.id]?.["PERMIT"]?.status ||
                          selectedShop.permitStatus) as any
                      }
                      onApprove={() => openConfirmModal("PERMIT", "approved")}
                      onReject={() => openConfirmModal("PERMIT", "rejected")}
                      showActions={true}
                    />
                  ) : selectedShop.permitStatus === "rejected" ? (
                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Permit Document</h3>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 capitalize">
                          Rejected
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <CancelIcon className="text-gray-400 mb-2" fontSize="large" />
                        <p>Renter has not resubmitted this file yet.</p>
                      </div>
                    </div>
                  ) : null}

                  {selectedShop.taxStatus === "pending" || selectedShop.taxStatus === "resubmit" ? (
                    <DocumentViewer
                      title="Tax Clearance Document"
                      documentUrl={
                        selectedShop.documentTax ? `/uploads/tax/${selectedShop.documentTax}` : null
                      }
                      status={
                        (stagedDecisions[selectedShop.id]?.["TAX_CLEARANCE"]?.status ||
                          selectedShop.taxStatus) as any
                      }
                      onApprove={() => openConfirmModal("TAX_CLEARANCE", "approved")}
                      onReject={() => openConfirmModal("TAX_CLEARANCE", "rejected")}
                      showActions={true}
                    />
                  ) : selectedShop.taxStatus === "rejected" ? (
                    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Tax Clearance Document</h3>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 capitalize">
                          Rejected
                        </span>
                      </div>
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <CancelIcon className="text-gray-400 mb-2" fontSize="large" />
                        <p>Renter has not resubmitted this file yet.</p>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
        </Box>
      </Modal>

      <Modal open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} disableAutoFocus>
        <Box
          sx={{
            ...style,
            width: { xs: "95%", sm: 400 },
            maxWidth: 400,
            p: 4,
            height: "auto",
            maxHeight: "auto",
          }}
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            {pendingAction?.status === "approved" ? "Approve" : "Reject"}{" "}
            {pendingAction?.documentType ? "Document" : "Shop"}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to {pendingAction?.status === "approved" ? "approve" : "reject"}{" "}
            this {pendingAction?.documentType ? "document" : "shop"}? This action cannot be undone.
          </p>

          {pendingAction?.documentType && (
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 mb-6 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              rows={4}
              placeholder={
                pendingAction?.status === "rejected"
                  ? "Add a note (required)..."
                  : "Add a note (optional)..."
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          )}

          <div className="flex gap-2 justify-end">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              onClick={() => setConfirmModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                pendingAction?.status === "rejected"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
              disabled={
                !!pendingAction?.documentType &&
                pendingAction?.status === "rejected" &&
                !note.trim()
              }
              onClick={handleConfirm}
            >
              {pendingAction?.status === "rejected" ? "Confirm Rejection" : "Confirm Approval"}
            </button>
          </div>
        </Box>
      </Modal>

      <Dialog open={closeConfirmOpen} onClose={() => setCloseConfirmOpen(false)}>
        <DialogTitle>Unsaved Changes</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes. Are you sure you want to close?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmClose} color="error" autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
