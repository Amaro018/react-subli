"use client"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getAllProducts from "../../queries/getAllProducts"
import updateProductStatus from "../../mutations/updateProductStatus"
import React, { useState, useMemo, useEffect } from "react"
import {
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  IconButton,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import BlockIcon from "@mui/icons-material/Block"
import ReportProblemIcon from "@mui/icons-material/ReportProblem"
import VisibilityIcon from "@mui/icons-material/Visibility"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore"
import { toast } from "@/src/app/utils/toast"
import Link from "next/link"

type ProductType = Awaited<ReturnType<typeof getAllProducts>>[number]

export default function AllProducts() {
  const [products, { refetch }] = useQuery(getAllProducts, null)
  const [updateStatusMutation] = useMutation(updateProductStatus)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ProductType | "shopName"
    direction: "asc" | "desc"
  } | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [productToBan, setProductToBan] = useState<ProductType | null>(null)
  const [banReason, setBanReason] = useState("")
  const currentUser = useCurrentUser()

  const itemsPerPage = 10

  const handleBanClick = (product: ProductType) => {
    setProductToBan(product)
    setConfirmOpen(true)
  }

  const handleConfirmBan = async () => {
    if (!productToBan) return
    if (!banReason.trim()) {
      toast.error("A reason for banning the product is required.")
      return
    }
    if (!currentUser) {
      toast.error("Could not identify the current user.")
      return
    }
    try {
      await updateStatusMutation({
        productId: productToBan.id,
        status: "banned",
        banReason: banReason,
        adminId: currentUser.id,
      })
      toast.success(`Product "${productToBan.name}" has been banned.`)
      refetch()
    } catch (error) {
      toast.error("Failed to ban product.")
      console.error(error)
    } finally {
      setConfirmOpen(false)
      setProductToBan(null)
      setBanReason("")
    }
  }

  const sortedProducts = useMemo(() => {
    let sortableItems = [...(products || [])]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any, bValue: any
        if (sortConfig.key === "shopName") {
          aValue = a.shop?.shopName || ""
          bValue = b.shop?.shopName || ""
        } else {
          aValue = a[sortConfig.key as keyof ProductType]
          bValue = b[sortConfig.key as keyof ProductType]
        }

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
        return 0
      })
    }
    return sortableItems
  }, [products, sortConfig])

  const requestSort = (key: keyof ProductType | "shopName") => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const filteredProducts = sortedProducts.filter((product: ProductType) => {
    const matchesStatus = statusFilter === "all" ? true : product.status === statusFilter
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.shop?.shopName || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon fontSize="inherit" />
      case "banned":
        return <BlockIcon fontSize="inherit" />
      case "reported":
        return <ReportProblemIcon fontSize="inherit" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "banned":
        return "bg-red-100 text-red-800"
      case "reported":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <UnfoldMoreIcon fontSize="inherit" className="opacity-40" />
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUpwardIcon fontSize="inherit" />
    ) : (
      <ArrowDownwardIcon fontSize="inherit" />
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col sm:flex-row gap-4 sm:items-center">
        <TextField
          placeholder="Search products or shops..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon className="text-gray-400" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" className="w-full sm:w-[200px]">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="reported">Reported</MenuItem>
            <MenuItem value="banned">Banned</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="w-full rounded-lg border border-gray-200 shadow-sm overflow-x-auto scrollbar-hide">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider w-12">
                #
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider">
                <button
                  onClick={() => requestSort("name")}
                  className="flex items-center gap-1 group hover:text-gray-700"
                >
                  Name {getSortIcon("name")}
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell">
                <button
                  onClick={() => requestSort("shopName")}
                  className="flex items-center gap-1 group hover:text-gray-700"
                >
                  Shop {getSortIcon("shopName")}
                </button>
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden lg:table-cell">
                <button
                  onClick={() => requestSort("createdAt")}
                  className="flex items-center gap-1 group hover:text-gray-700"
                >
                  Date Created {getSortIcon("createdAt")}
                </button>
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
            {paginatedProducts.map((product: ProductType, index) => (
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
                <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                  {new Date(product.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize items-center gap-1 ${getStatusColor(
                      product.status
                    )}`}
                  >
                    {getStatusIcon(product.status)} {product.status}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 text-center whitespace-nowrap space-x-2">
                  <Link
                    href={`/products/${product.id}`}
                    target="_blank"
                    className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                  >
                    Visit
                  </Link>
                  {product.status !== "banned" && (
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium py-2 px-3 rounded transition-colors"
                      onClick={() => handleBanClick(product)}
                    >
                      Ban
                    </button>
                  )}
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
        <DialogTitle>Confirm Ban</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are about to ban the product &quot;{productToBan?.name}&quot;. Please provide a
            reason below. This will be visible to other administrators.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason for Banning"
            type="text"
            fullWidth
            variant="standard"
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmBan} color="error">
            Confirm Ban
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

import { useCurrentUser } from "src/app/users/hooks/useCurrentUser"
