"use client"
import { useQuery } from "@blitzjs/rpc"
import getShops from "../../queries/getShops"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import PendingIcon from "@mui/icons-material/Pending"
import React from "react"
import { Box, Modal } from "@mui/material"
import Link from "next/link"
import updateShopStatus from "../../mutations/updateShopStatus"
import { useMutation } from "@blitzjs/rpc"

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1000,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
}

// eslint-disable-next-line react-hooks/rules-of-hooks

export default function ShopList() {
  const [updateStatusMutation] = useMutation(updateShopStatus)
  const [shops, { refetch }] = useQuery(getShops, null)
  const [open, setOpen] = React.useState(false)
  const [selectedShop, setSelectedShop] = React.useState(null)
  const [confirmModalOpen, setConfirmModalOpen] = React.useState(false)
  const [pendingAction, setPendingAction] = React.useState<{
    documentType: string
    status: string
  } | null>(null)
  const [note, setNote] = React.useState("")
  const handleOpen = (shop: any) => {
    setSelectedShop(shop)
    setOpen(true)
  }
  const handleClose = () => setOpen(false)

  const openConfirmModal = (documentType: string, status: string) => {
    setPendingAction({ documentType, status })
    setNote("")
    setConfirmModalOpen(true)
  }

  const handleConfirm = async () => {
    if (!pendingAction) return
    await handleUpdateStatus(pendingAction.documentType, pendingAction.status, note)
    setConfirmModalOpen(false)
    setPendingAction(null)
    setNote("")
    console.log("Confirmed:", pendingAction.documentType, pendingAction.status, note)
  }

  const handleUpdateStatus = async (documentType: string, status: string, note?: string) => {
    try {
      const updatedShop = await updateStatusMutation({
        shopId: selectedShop?.id,
        documentType,
        status,
        shopUserId: selectedShop?.userId,
        note, // Pass note to mutation if needed
      })
      refetch()
      setSelectedShop(updatedShop)
      alert(`Successfully updated to ${status}`)
      console.log(updatedShop)
    } catch (error) {
      console.error("Failed to update status:", error)
      alert("Error updating status")
    }
  }

  return (
    <>
      <div className="w-full">
        <table className="table-auto w-full border-collapse border border-slate-400 rounded-lg">
          <thead className="bg-slate-600 text-white">
            <tr>
              <th className="border border-slate-300 p-2">Name</th>

              <th className="border border-slate-300 p-2">Address</th>
              <th className="border border-slate-300 p-2">Contact</th>
              <th className="border border-slate-300 p-2">DTI</th>
              <th className="border border-slate-300 p-2">PERMIT</th>
              <th className="border border-slate-300 p-2">TAX CLEARANCE</th>
              <th className="border border-slate-300 p-2">STATUS</th>
              <th className="border border-slate-300 p-2">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {shops.length > 0 ? (
              shops.map((shop) => (
                <tr key={shop.id} className="">
                  <td className="border border-slate-300 p-2 text-center">{shop.shopName}</td>
                  <td className="border border-slate-300 p-2 text-center">
                    {shop.street}, {shop.city}, {shop.region}, {shop.country}
                  </td>
                  <td className="border border-slate-300 p-2 text-center">{shop.contact}</td>

                  <td className="border border-slate-300 p-2 text-center">
                    {(() => {
                      switch (shop.dtiStatus) {
                        case "pending":
                          return <PendingIcon className="text-yellow-500" />
                        case "approved":
                          return <CheckCircleIcon className="text-green-500" />
                        case "rejected":
                          return <CancelIcon className="text-red-500" />
                      }
                    })()}
                  </td>
                  <td className="border border-slate-300 p-2 text-center">
                    {(() => {
                      switch (shop.permitStatus) {
                        case "pending":
                          return <PendingIcon className="text-yellow-500" />
                        case "approved":
                          return <CheckCircleIcon className="text-green-500" />
                        case "rejected":
                          return <CancelIcon className="text-red-500" />
                      }
                    })()}
                  </td>
                  <td className="border border-slate-300 p-2 text-center">
                    {(() => {
                      switch (shop.taxStatus) {
                        case "pending":
                          return <PendingIcon className="text-yellow-500" />
                        case "approved":
                          return <CheckCircleIcon className="text-green-500" />
                        case "rejected":
                          return <CancelIcon className="text-red-500" />
                      }
                    })()}
                  </td>
                  <td className="border border-slate-300 p-2 text-center">
                    {(() => {
                      switch (shop.status) {
                        case "pending":
                          return <PendingIcon className="text-yellow-500" />
                        case "approved":
                          return <CheckCircleIcon className="text-green-500" />
                        case "rejected":
                          return <CancelIcon className="text-red-500" />
                      }
                    })()}
                  </td>
                  <td className="border border-slate-300 p-2 text-center">
                    <div className="flex flex-row gap-2 justify-center">
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={() => handleOpen(shop)}
                      >
                        View Documents
                      </button>
                      <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        Ban
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center text-2xl font-bold p-4">
                  NO DATA
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <table className="table-auto w-full">
            <tr className="bg-slate-600 text-white">
              <th>Shop Name</th>
              <th>File</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
            <tr>
              <td className="text-center font-bold p-2">DTI</td>
              <td className="text-center font-bold p-2">
                <div>
                  {selectedShop?.documentDTI ? (
                    <Link
                      href={`/uploads/dti/${selectedShop.documentDTI}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View or Download Document
                    </Link>
                  ) : (
                    <p>No document passed.</p>
                  )}
                </div>
              </td>
              <td className="text-center font-bold p-2">{selectedShop?.dtiStatus}</td>
              <td className="text-center font-bold p-2">
                <div className="flex flex-row gap-2 justify-center">
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => openConfirmModal("DTI", "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => openConfirmModal("DTI", "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>

            <tr>
              <td className="text-center font-bold p-2">PERMIT</td>
              <td className="text-center font-bold p-2">
                <div>
                  {selectedShop?.documentPermit ? (
                    <Link
                      href={`/uploads/permit/${selectedShop.documentPermit}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View or Download Document
                    </Link>
                  ) : (
                    <p>No document passed.</p>
                  )}
                </div>
              </td>
              <td className="text-center font-bold p-2">{selectedShop?.permitStatus}</td>
              <td className="text-center font-bold p-2">
                <div className="flex flex-row gap-2 justify-center">
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => openConfirmModal("PERMIT", "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => openConfirmModal("PERMIT", "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>

            <tr>
              <td className="text-center font-bold p-2">TAX CLEARANCE</td>
              <td className="text-center font-bold p-2">
                <div>
                  {selectedShop?.documentTax ? (
                    <Link
                      href={`/uploads/tax/${selectedShop.documentTax}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View or Download Document
                    </Link>
                  ) : (
                    <p>No document passed.</p>
                  )}
                </div>
              </td>
              <td className="text-center font-bold p-2">{selectedShop?.taxStatus}</td>
              <td className="text-center font-bold p-2">
                <div className="flex flex-row gap-2 justify-center">
                  <button
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => openConfirmModal("TAX_CLEARANCE", "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => openConfirmModal("TAX_CLEARANCE", "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          </table>
        </Box>
      </Modal>

      <Modal open={confirmModalOpen} onClose={() => setConfirmModalOpen(false)}>
        <Box sx={{ ...style, width: 400 }}>
          <h2 className="text-xl font-bold mb-2">
            {pendingAction?.status === "approved" ? "Approve" : "Reject"} Document
          </h2>
          <textarea
            className="w-full border rounded p-2 mb-4"
            rows={4}
            placeholder="Enter a note (required)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button
              className="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              onClick={() => setConfirmModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!note.trim()}
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        </Box>
      </Modal>
    </>
  )
}
