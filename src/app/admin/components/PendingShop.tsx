"use client"
import { useQuery } from "@blitzjs/rpc"
import getShops from "../../queries/getShops"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import PendingIcon from "@mui/icons-material/Pending"
import CloseIcon from "@mui/icons-material/Close"
import StoreIcon from "@mui/icons-material/Store"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore"
import React, { useState, useMemo, useEffect, useRef } from "react"
import { Box, Modal, Tooltip, Button, Typography } from "@mui/material"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import updateShopStatus from "../../mutations/updateShopStatus"
import { useMutation } from "@blitzjs/rpc"
import { toast } from "sonner"
import DocumentViewer from "./DocumentViewer"

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

// eslint-disable-next-line react-hooks/rules-of-hooks

type ShopType = Awaited<ReturnType<typeof getShops>>[number]

interface PendingShopProps {
  status?: string
}

export default function PendingShop({ status }: PendingShopProps) {
  const [updateStatusMutation] = useMutation(updateShopStatus)
  const searchParams = useSearchParams()
  const [shops, { refetch }] = useQuery(getShops, null)
  const [open, setOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState<ShopType | null>(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dti")
  const [pendingAction, setPendingAction] = useState<{
    documentType: any
    status: any
  } | null>(null)
  const [note, setNote] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ShopType | "owner"
    direction: "asc" | "desc"
  } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const handleOpen = (shop: ShopType, tab: string = "dti") => {
    setSelectedShop(shop)
    setActiveTab(tab)
    setOpen(true)
  }
  const handleClose = () => setOpen(false)

  const openConfirmModal = (
    documentType: string | null,
    status: string,
    shop: ShopType | null = null
  ) => {
    if (shop) {
      setSelectedShop(shop)
    }
    setPendingAction({ documentType, status })
    setNote("")
    setConfirmModalOpen(true)
  }

  const handleConfirm = async () => {
    if (!pendingAction) return
    const wasDocumentAction = !!pendingAction.documentType

    let finalNote = note

    if (!pendingAction.documentType && pendingAction.status === "rejected" && selectedShop) {
      const rejectedDocs: string[] = []
      if (selectedShop.dtiStatus === "rejected") rejectedDocs.push("DTI")
      if (selectedShop.permitStatus === "rejected") rejectedDocs.push("Business Permit")
      if (selectedShop.taxStatus === "rejected") rejectedDocs.push("Tax Clearance")

      if (rejectedDocs.length > 0) {
        finalNote = `Shop application rejected due to the following rejected documents: ${rejectedDocs.join(
          ", "
        )}.`
      }
    }

    await handleUpdateStatus(pendingAction.documentType, pendingAction.status, finalNote)
    setConfirmModalOpen(false)
    setPendingAction(null)
    setNote("")
    if (wasDocumentAction) {
      handleClose()
    }
  }

  const handleUpdateStatus = async (documentType: any, status: any, note?: string) => {
    if (!selectedShop) {
      toast.error("No shop selected. Please try again.")
      return
    }

    try {
      const updatedShop = await updateStatusMutation({
        shopId: selectedShop.id,
        documentType: documentType || undefined,
        status,
        shopUserId: selectedShop.userId,
        note, // Pass note to mutation if needed
      })

      if (status === "rejected") {
        toast.error(`${documentType ? "Document" : "Shop"} has been rejected`)
      } else {
        toast.success(`${documentType ? "Document" : "Shop"} has been approved`)
      }

      await refetch()
      setSelectedShop(updatedShop)
    } catch (error) {
      console.error("Failed to update status:", error)
      toast.error("Failed to update status. Please try again.")
    }
  }

  const sortedShops = useMemo(() => {
    let sortableItems = [...shops]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any
        let bValue: any

        if (sortConfig.key === "owner") {
          aValue = `${a.user?.personalInfo?.firstName || ""} ${
            a.user?.personalInfo?.lastName || ""
          }`.trim()
          bValue = `${b.user?.personalInfo?.firstName || ""} ${
            b.user?.personalInfo?.lastName || ""
          }`.trim()
        } else {
          aValue = a[sortConfig.key as keyof ShopType]
          bValue = b[sortConfig.key as keyof ShopType]
        }

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

  const filteredShops = status
    ? sortedShops.filter((shop: ShopType) => shop.status === status)
    : sortedShops

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage)
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const highlightShopId = Number(searchParams.get("shopId"))
  const lastProcessedShopId = useRef<number | null>(null)

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

  const requestSort = (key: keyof ShopType | "owner") => {
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

  const renderDocumentBadge = (name: string, status: string, type: string, shop: ShopType) => {
    let colorClass = ""
    let Icon = PendingIcon

    switch (status) {
      case "approved":
        colorClass = "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
        Icon = CheckCircleIcon
        break
      case "rejected":
        colorClass = "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
        Icon = CancelIcon
        break
      default:
        colorClass = "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200"
        Icon = PendingIcon
        break
    }

    return (
      <Tooltip title={`View ${name} (${status})`}>
        <button
          onClick={() => handleOpen(shop, type)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-sm hover:shadow ${colorClass}`}
        >
          <Icon style={{ fontSize: 16 }} />
          {name}{" "}
          <span className="capitalize font-normal opacity-75">
            ({status === "resubmit" ? "resubmitted" : status})
          </span>
        </button>
      </Tooltip>
    )
  }

  return (
    <>
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
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell whitespace-nowrap">
                <button
                  onClick={() => requestSort("createdAt")}
                  className="flex items-center gap-1 group hover:text-gray-700"
                >
                  Date Created {getSortIcon("createdAt")}
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell">
                <button
                  onClick={() => requestSort("owner")}
                  className="flex items-center gap-1 group hover:text-gray-700"
                >
                  Owner {getSortIcon("owner")}
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider hidden lg:table-cell">
                Contact
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider hidden lg:table-cell">
                Documents
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedShops.length > 0 ? (
              paginatedShops.map((shop: ShopType, index: number) => {
                const allDocumentsApproved =
                  shop.dtiStatus === "approved" &&
                  shop.permitStatus === "approved" &&
                  shop.taxStatus === "approved"
                const anyDocumentRejected =
                  shop.dtiStatus === "rejected" ||
                  shop.permitStatus === "rejected" ||
                  shop.taxStatus === "rejected"

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
                      <div>{shop.shopName}</div>
                      <div className="flex lg:hidden gap-1 mt-1.5 flex-wrap">
                        {renderDocumentBadge("DTI", shop.dtiStatus, "dti", shop)}
                        {renderDocumentBadge("Permit", shop.permitStatus, "permit", shop)}
                        {renderDocumentBadge("Tax", shop.taxStatus, "tax", shop)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell whitespace-nowrap">
                      {new Date(shop.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell whitespace-nowrap">
                      {shop.user?.personalInfo
                        ? `${shop.user.personalInfo.firstName} ${shop.user.personalInfo.lastName}`
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center hidden lg:table-cell whitespace-nowrap">
                      {shop.contact}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex gap-2 justify-center flex-wrap">
                        {renderDocumentBadge("DTI", shop.dtiStatus, "dti", shop)}
                        {renderDocumentBadge("Permit", shop.permitStatus, "permit", shop)}
                        {renderDocumentBadge("Tax", shop.taxStatus, "tax", shop)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors lg:hidden"
                          onClick={() => handleOpen(shop, "all")}
                        >
                          View Documents
                        </button>
                        <Tooltip
                          title={
                            !allDocumentsApproved
                              ? "All documents must be approved to approve the shop"
                              : ""
                          }
                        >
                          <span>
                            <button
                              className={`text-white text-xs font-medium py-2 px-3 rounded transition-colors ${
                                allDocumentsApproved
                                  ? "bg-green-500 hover:bg-green-600"
                                  : "bg-gray-400 cursor-not-allowed"
                              }`}
                              disabled={!allDocumentsApproved}
                              onClick={() => openConfirmModal(null, "approved", shop)}
                            >
                              Approve
                            </button>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            !anyDocumentRejected
                              ? "At least one document must be rejected to reject the shop"
                              : ""
                          }
                        >
                          <span>
                            <button
                              className={`text-white text-xs font-medium py-2 px-3 rounded transition-colors whitespace-nowrap ${
                                anyDocumentRejected
                                  ? "bg-red-500 hover:bg-red-600"
                                  : "bg-gray-400 cursor-not-allowed"
                              }`}
                              disabled={!anyDocumentRejected}
                              onClick={() => openConfirmModal(null, "rejected", shop)}
                            >
                              Reject
                            </button>
                          </span>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 sm:px-6 py-10 text-center text-gray-500 text-sm">
                  No shops found matching the criteria.
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
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-800">
                {activeTab === "all"
                  ? "Review Documents"
                  : activeTab === "dti"
                  ? "DTI Document"
                  : activeTab === "permit"
                  ? "Permit Document"
                  : "Tax Clearance Document"}
              </h2>
              {selectedShop && activeTab !== "all" && (
                <span
                  className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${
                    (activeTab === "dti"
                      ? selectedShop.dtiStatus
                      : activeTab === "permit"
                      ? selectedShop.permitStatus
                      : selectedShop.taxStatus) === "approved"
                      ? "bg-green-100 text-green-800"
                      : (activeTab === "dti"
                          ? selectedShop.dtiStatus
                          : activeTab === "permit"
                          ? selectedShop.permitStatus
                          : selectedShop.taxStatus) === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {activeTab === "dti"
                    ? selectedShop.dtiStatus
                    : activeTab === "permit"
                    ? selectedShop.permitStatus
                    : selectedShop.taxStatus}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {activeTab !== "all" && (
                <div className="flex gap-2">
                  <button
                    className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center gap-2"
                    onClick={() =>
                      openConfirmModal(
                        activeTab === "tax"
                          ? "TAX_CLEARANCE"
                          : activeTab === "permit"
                          ? "PERMIT"
                          : "DTI",
                        "approved"
                      )
                    }
                  >
                    <CheckCircleIcon fontSize="small" />
                    Approve
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center gap-2"
                    onClick={() =>
                      openConfirmModal(
                        activeTab === "tax"
                          ? "TAX_CLEARANCE"
                          : activeTab === "permit"
                          ? "PERMIT"
                          : "DTI",
                        "rejected"
                      )
                    }
                  >
                    <CancelIcon fontSize="small" />
                    Reject
                  </button>
                </div>
              )}
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <CloseIcon />
              </button>
            </div>
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
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Address
                      </p>
                      <p className="text-base font-medium text-gray-900">
                        {selectedShop.street}, {selectedShop.barangay}, {selectedShop.city},{" "}
                        {selectedShop.province}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full lg:w-2/3 p-4 md:p-6 bg-gray-50 lg:h-full lg:overflow-y-auto scrollbar-seamless flex flex-col gap-6">
              {selectedShop && (activeTab === "dti" || activeTab === "all") && (
                <DocumentViewer
                  title="DTI Document"
                  documentUrl={
                    selectedShop.documentDTI ? `/uploads/dti/${selectedShop.documentDTI}` : null
                  }
                  status={selectedShop.dtiStatus as any}
                  onApprove={() => openConfirmModal("DTI", "approved")}
                  onReject={() => openConfirmModal("DTI", "rejected")}
                  showActions={activeTab === "all"}
                />
              )}

              {selectedShop && (activeTab === "permit" || activeTab === "all") && (
                <DocumentViewer
                  title="Permit Document"
                  documentUrl={
                    selectedShop.documentPermit
                      ? `/uploads/permit/${selectedShop.documentPermit}`
                      : null
                  }
                  status={selectedShop.permitStatus as any}
                  onApprove={() => openConfirmModal("PERMIT", "approved")}
                  onReject={() => openConfirmModal("PERMIT", "rejected")}
                  showActions={activeTab === "all"}
                />
              )}

              {selectedShop && (activeTab === "tax" || activeTab === "all") && (
                <DocumentViewer
                  title="Tax Clearance Document"
                  documentUrl={
                    selectedShop.documentTax ? `/uploads/tax/${selectedShop.documentTax}` : null
                  }
                  status={selectedShop.taxStatus as any}
                  onApprove={() => openConfirmModal("TAX_CLEARANCE", "approved")}
                  onReject={() => openConfirmModal("TAX_CLEARANCE", "rejected")}
                  showActions={activeTab === "all"}
                />
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
    </>
  )
}
