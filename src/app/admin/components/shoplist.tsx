"use client"
import { useQuery } from "@blitzjs/rpc"
import getShops from "../../queries/getShops"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import PendingIcon from "@mui/icons-material/Pending"
import React from "react"
import { Box, Modal } from "@mui/material"

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
  const [shops, { refetch }] = useQuery(getShops, null)
  const [open, setOpen] = React.useState(false)
  const [selectedShop, setSelectedShop] = React.useState(null)
  const handleOpen = (shop: any) => {
    setSelectedShop(shop)
    setOpen(true)
  }
  const handleClose = () => setOpen(false)

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
            </tr>
            <tr>
              <td>{selectedShop?.shopName}</td>
              <td>
                {" "}
                <div>
                  {selectedShop?.documentDTI ? (
                    <a
                      href={`/uploads/dti/${selectedShop.documentDTI}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      View or Download DTI Document
                    </a>
                  ) : (
                    <p>No document passed.</p>
                  )}
                </div>
              </td>
              <td>{selectedShop?.dtiStatus}</td>
            </tr>
            <tr>
              <td>{selectedShop?.shopName}</td>
              <td>{selectedShop?.documentPermit}</td>
              <td>{selectedShop?.permitStatus}</td>
            </tr>
            <tr>
              <td>{selectedShop?.shopName}</td>
              <td>{selectedShop?.documentTax}</td>
              <td>{selectedShop?.taxStatus}</td>
            </tr>
          </table>

          {/* <div className="flex flex-col gap-4">
            <div>
                <h3 className="text-lg font-semibold">DTI</h3>
                {selectedShop?.documentDTI ? (
                <a
                    href={`/uploads/dti/${selectedShop.documentDTI}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                >
                    View or Download DTI Document
                </a>
                ) : (
                <p>No document available.</p>
                )}
            </div>
        </div> */}
        </Box>
      </Modal>
    </>
  )
}
