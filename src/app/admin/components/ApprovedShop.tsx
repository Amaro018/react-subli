// d:\Users\Jayzel\react repos\react-subli\src\app\admin\components\ApprovedShop.tsx
"use client"
import { useQuery } from "@blitzjs/rpc"
import React from "react"
import { Button, Typography } from "@mui/material"
import Link from "next/link"
import StorefrontIcon from "@mui/icons-material/Storefront"
import getShops from "../../queries/getShops"

interface ApprovedShopProps {
  status?: string
}

export default function ApprovedShop({ status }: ApprovedShopProps) {
  const [shops] = useQuery(getShops, null) as [any[], any]
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
                    <Link
                      href={`/shops/${shop.slug || shop.id}`}
                      className="mt-auto w-full inline-flex justify-center items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-[#1b2a80] bg-white hover:bg-gray-50 transition-colors"
                    >
                      <StorefrontIcon fontSize="small" sx={{ mr: 1 }} /> Visit Shop
                    </Link>
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
    </>
  )
}
