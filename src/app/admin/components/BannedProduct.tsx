"use client"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getAllProducts from "../../queries/getAllProducts"
import updateProductStatus from "../../mutations/updateProductStatus"
import React, { useState, useMemo } from "react"
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
import Link from "next/link"
import { toast } from "@/src/app/utils/toast"
import { useCurrentUser } from "src/app/users/hooks/useCurrentUser"

type ProductType = Awaited<ReturnType<typeof getAllProducts>>[number] & { banReason: string | null }

export default function BannedProduct() {
  const [products, { refetch }] = useQuery(getAllProducts, null)
  const [updateStatusMutation] = useMutation(updateProductStatus)

  const [currentPage, setCurrentPage] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [productToUnban, setProductToUnban] = useState<ProductType | null>(null)
  const currentUser = useCurrentUser()

  const itemsPerPage = 10

  const filteredProducts = useMemo(() => {
    return products.filter((product) => product.status === "banned")
  }, [products])

  const handleUnbanClick = (product: ProductType) => {
    setProductToUnban(product)
    setConfirmOpen(true)
  }

  const handleConfirmUnban = async () => {
    if (!productToUnban) return
    if (!currentUser) {
      toast.error("Could not identify the current user.")
      return
    }
    try {
      await updateStatusMutation({
        productId: productToUnban.id,
        status: "active", // Set back to active
        adminId: currentUser.id, // Pass adminId
      })
      toast.success(`Product "${productToUnban.name}" has been un-banned.`)
      refetch()
    } catch (error) {
      toast.error("Failed to un-ban product.")
      console.error(error)
    } finally {
      setConfirmOpen(false)
      setProductToUnban(null)
    }
  }

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
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
                Product Name
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell">
                Shop
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell">
                Reason
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden lg:table-cell">
                Date Banned
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">
                  No banned products found.
                </td>
              </tr>
            )}
            {paginatedProducts.map((product, index) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                  {product.name}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                  {product.shop?.shopName}
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden md:table-cell">
                  <Tooltip title={product.banReason || "No reason provided"}>
                    <span className="truncate block max-w-xs">{product.banReason || "N/A"}</span>
                  </Tooltip>
                </td>
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                  {new Date(product.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap space-x-2">
                  <Link
                    href={`/products/${product.id}`}
                    target="_blank"
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                  >
                    Visit
                  </Link>
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors" // Added un-ban button
                    onClick={() => handleUnbanClick(product)}
                  >
                    Un-ban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center my-4 items-center gap-4">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Previous
          </Button>
          <Typography variant="body2">
            Page {currentPage} of {totalPages}
          </Typography>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        {" "}
        {/* Confirmation Dialog */}
        <DialogTitle>Confirm Un-ban</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to un-ban the product &quot;{productToUnban?.name}&quot;? This
            will make it active again.
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
    </div>
  )
}
