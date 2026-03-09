"use client"
import { useQuery } from "@blitzjs/rpc"
import getShops from "../../queries/getShops"
import React from "react"
import ReportProblemIcon from "@mui/icons-material/ReportProblem"
import { Button, Typography } from "@mui/material"

type ShopType = Awaited<ReturnType<typeof getShops>>[number]

interface ReportedShopProps {
  status?: string
}

export default function ReportedShop({ status }: ReportedShopProps) {
  const [shops] = useQuery(getShops, null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const itemsPerPage = 10

  const filteredShops = status ? shops.filter((shop: ShopType) => shop.status === status) : shops

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage)
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="w-full rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider w-12">
              #
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell">
              Owner
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden lg:table-cell">
              Contact
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedShops.length > 0 ? (
            paginatedShops.map((shop: ShopType, index: number) => (
              <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{shop.shopName}</td>
                <td className="px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                  {shop.user?.personalInfo
                    ? `${shop.user.personalInfo.firstName} ${shop.user.personalInfo.lastName}`
                    : "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                  {shop.contact}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 capitalize items-center gap-1">
                    <ReportProblemIcon fontSize="inherit" />
                    {shop.status}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm">
                No reported shops found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex justify-center my-4 items-center gap-4 p-4">
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
    </div>
  )
}
