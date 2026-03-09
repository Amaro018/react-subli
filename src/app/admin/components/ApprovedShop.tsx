// d:\Users\Jayzel\react repos\react-subli\src\app\admin\components\ApprovedShop.tsx
"use client"
import { useQuery } from "@blitzjs/rpc"
import getShops from "../../queries/getShops"
import CloseIcon from "@mui/icons-material/Close"
import StoreIcon from "@mui/icons-material/Store"
import React from "react"
import { Box, Modal, Button, Typography } from "@mui/material"
import Link from "next/link"

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

interface ApprovedShopProps {
  status?: string
}

export default function ApprovedShop({ status }: ApprovedShopProps) {
  const [shops] = useQuery(getShops, null)
  const [open, setOpen] = React.useState(false)
  const [selectedShop, setSelectedShop] = React.useState<any>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const handleOpen = (shop: any) => {
    setSelectedShop(shop)
    setOpen(true)
  }
  const handleClose = () => setOpen(false)

  const filteredShops = shops.filter((shop: any) => {
    return status ? shop.status === status : true
  })

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage)
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
                Name
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden lg:table-cell">
                Date Created
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell">
                Owner
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden xl:table-cell">
                Address
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider hidden lg:table-cell">
                Contact
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedShops.length > 0 ? (
              paginatedShops.map((shop: any, index: number) => (
                <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                    {shop.shopName}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                    {new Date(shop.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                    {shop.user?.personalInfo
                      ? `${shop.user.personalInfo.firstName} ${shop.user.personalInfo.lastName}`
                      : "N/A"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden xl:table-cell">
                    {shop.street}, {shop.barangay}, {shop.city}, {shop.province}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 text-center hidden lg:table-cell whitespace-nowrap">
                    {shop.contact}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                      onClick={() => handleOpen(shop)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-10 text-center text-gray-500 text-sm">
                  No approved shops found.
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
            <h2 className="text-xl font-bold text-gray-800">Shop Details</h2>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="p-4 md:p-6 overflow-y-auto scrollbar-seamless">
            {selectedShop && (
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
                    <div className="md:col-span-2">
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

                {/* Documents */}
                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <h3 className="text-md font-bold text-gray-900 mb-4">Legal Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* DTI */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-gray-700">DTI Registration</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                            selectedShop.dtiStatus === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {selectedShop.dtiStatus}
                        </span>
                      </div>
                      {selectedShop.documentDTI ? (
                        <Link
                          href={`/uploads/dti/${selectedShop.documentDTI}` as any}
                          target="_blank"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                        >
                          View Document
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not uploaded</span>
                      )}
                    </div>

                    {/* Permit */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-gray-700">Business Permit</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                            selectedShop.permitStatus === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {selectedShop.permitStatus}
                        </span>
                      </div>
                      {selectedShop.documentPermit ? (
                        <Link
                          href={`/uploads/permit/${selectedShop.documentPermit}` as any}
                          target="_blank"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                        >
                          View Document
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not uploaded</span>
                      )}
                    </div>

                    {/* Tax */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-gray-700">Tax Clearance</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                            selectedShop.taxStatus === "approved"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {selectedShop.taxStatus}
                        </span>
                      </div>
                      {selectedShop.documentTax ? (
                        <Link
                          href={`/uploads/tax/${selectedShop.documentTax}` as any}
                          target="_blank"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1"
                        >
                          View Document
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Not uploaded</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Box>
      </Modal>
    </>
  )
}
