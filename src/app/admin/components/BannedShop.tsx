"use client"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getShops from "../../queries/getShops"
import unbanShop from "src/app/mutations/unbanShop"
import React, { useState, useMemo } from "react"
import BlockIcon from "@mui/icons-material/Block"
import {
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@mui/material"
import { toast } from "@/src/app/utils/toast"
import ShopDetailsModal from "./ShopDetailsModal"

type ShopType = Awaited<ReturnType<typeof getShops>>[number]

interface BannedShopProps {
  status?: string
}

export default function BannedShop({ status }: BannedShopProps) {
  const [shops, { refetch }] = useQuery(getShops, null) as [ShopType[], { refetch: () => void }]
  const [unbanShopMutation] = useMutation(unbanShop)
  const [currentPage, setCurrentPage] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [shopToUnban, setShopToUnban] = useState<ShopType | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [detailsShop, setDetailsShop] = useState<ShopType | null>(null)
  const [showAppealsOnly, setShowAppealsOnly] = useState(false)
  const itemsPerPage = 10

  const allBannedShops = useMemo(() => {
    const currentStatus = status || "banned"
    return shops.filter((shop: ShopType) => shop.status === currentStatus)
  }, [shops, status])

  const filteredShops = useMemo(() => {
    if (showAppealsOnly) {
      return allBannedShops.filter((shop) => (shop.appeals?.length ?? 0) > 0)
    }
    return allBannedShops
  }, [allBannedShops, showAppealsOnly])

  const handleUnbanClick = (shop: ShopType) => {
    setShopToUnban(shop)
    setConfirmOpen(true)
  }

  const handleConfirmUnban = async () => {
    if (!shopToUnban) return

    try {
      await unbanShopMutation({ shopId: shopToUnban.id })
      toast.success(`Shop "${shopToUnban.shopName}" has been un-banned.`)
      await refetch()
    } catch (error) {
      toast.error("Failed to un-ban shop.")
      console.error(error)
    } finally {
      setConfirmOpen(false)
      setShopToUnban(null)
    }
  }

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage)
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-end mb-4">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600 hover:text-gray-900">
          <input
            type="checkbox"
            checked={showAppealsOnly}
            onChange={(e) => {
              setShowAppealsOnly(e.target.checked)
              setCurrentPage(1)
            }}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
          Show with Appeals Only
        </label>
      </div>

      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider w-12">
              #
            </th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider">
              Name
            </th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell">
              Owner
            </th>
            <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell">
              Reason
            </th>
            <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
              Appeal
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
            paginatedShops.map((shop: ShopType, index: number) => (
              <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                  {shop.shopName}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                  {shop.user?.personalInfo
                    ? `${shop.user.personalInfo.firstName} ${shop.user.personalInfo.lastName}`
                    : "N/A"}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                  <Tooltip title={shop.banReason || "No reason provided"}>
                    <span className="truncate block max-w-xs">
                      {shop.banReason || "No reason provided"}
                    </span>
                  </Tooltip>
                </td>
                <td className="px-4 sm:px-6 py-4 text-center">
                  {shop.appeals?.length ? (
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {shop.appeals[0]?.status === "pending" ? "Pending" : "Reviewed"}
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      None
                    </span>
                  )}
                </td>
                <td className="px-4 sm:px-6 py-4 text-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 capitalize items-center gap-1">
                    <BlockIcon fontSize="inherit" />
                    {shop.status}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap">
                  <div className="flex justify-center gap-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                      onClick={() => {
                        setDetailsShop(shop)
                        setDetailsOpen(true)
                      }}
                    >
                      View Details
                    </button>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                      onClick={() => handleUnbanClick(shop)}
                    >
                      Un-ban
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">
                No banned shops found.
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

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Un-ban</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to un-ban the shop &quot;{shopToUnban?.shopName}&quot;? This will
            set its status to &apos;approved&apos;.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmUnban} color="success" autoFocus>
            Confirm Un-ban
          </Button>
        </DialogActions>
      </Dialog>

      <ShopDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        shop={detailsShop}
      />
    </div>
  )
}
