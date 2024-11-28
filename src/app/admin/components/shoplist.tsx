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
  const handleOpen = (shop: any) => {
    setSelectedShop(shop)
    setOpen(true)
  }
  const handleClose = () => setOpen(false)

  const handleUpdateStatus = async (documentType: string, status: string) => {
    try {
      const updatedShop = await updateStatusMutation({
        shopId: selectedShop.id,
        documentType,
        status,
      })
      handleClose()
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
            {shops.map((shop) => (
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
            ))}
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
                    onClick={() => handleUpdateStatus("DTI", "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleUpdateStatus("DTI", "rejected")}
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
                    onClick={() => handleUpdateStatus("PERMIT", "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleUpdateStatus("PERMIT", "rejected")}
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
                    onClick={() => handleUpdateStatus("TAX_CLEARANCE", "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleUpdateStatus("TAX_CLEARANCE", "rejected")}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          </table>
        </Box>
      </Modal>
    </>
  )
}
