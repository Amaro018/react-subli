"use client"
import { useQuery } from "@blitzjs/rpc"
import getShops from "../../queries/getShops"
import React, { useState, useMemo } from "react"
import {
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Typography,
  Modal,
  Box,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import PendingIcon from "@mui/icons-material/Pending"
import BlockIcon from "@mui/icons-material/Block"
import ReportProblemIcon from "@mui/icons-material/ReportProblem"
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore"
import CloseIcon from "@mui/icons-material/Close"
import StoreIcon from "@mui/icons-material/Store"
import Link from "next/link"

type ShopType = Awaited<ReturnType<typeof getShops>>[number]

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

export default function AllShops() {
  const [shops] = useQuery(getShops, null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ShopType | "owner"
    direction: "asc" | "desc"
  } | null>(null)
  const [open, setOpen] = useState(false)
  const [selectedShop, setSelectedShop] = useState<ShopType | null>(null)
  const itemsPerPage = 10

  const handleOpen = (shop: ShopType) => {
    setSelectedShop(shop)
    setOpen(true)
  }
  const handleClose = () => setOpen(false)

  const sortedShops = useMemo(() => {
    let sortableItems = [...shops]
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any, bValue: any
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

  const requestSort = (key: keyof ShopType | "owner") => {
    let direction: "asc" | "desc" = "asc"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  const filteredShops = sortedShops.filter((shop: ShopType) => {
    const matchesStatus = statusFilter === "all" ? true : shop.status === statusFilter
    const matchesSearch =
      shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.user?.personalInfo?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.user?.personalInfo?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalPages = Math.ceil(filteredShops.length / itemsPerPage)
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircleIcon fontSize="inherit" />
      case "pending":
        return <PendingIcon fontSize="inherit" />
      case "rejected":
        return <CancelIcon fontSize="inherit" />
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
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
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
    if (sortConfig.direction === "asc") {
      return <ArrowUpwardIcon fontSize="inherit" />
    }
    return <ArrowDownwardIcon fontSize="inherit" />
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-col sm:flex-row gap-4 sm:items-center">
        <div className="flex-1">
          <TextField
            placeholder="Search all shops..."
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
        </div>
        <FormControl size="small" className="w-full sm:w-[200px]">
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="reported">Reported</MenuItem>
            <MenuItem value="banned">Banned</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div className="w-full rounded-lg border border-gray-200 shadow-sm overflow-x-auto scrollbar-hide">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider w-12">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider">
                <button
                  onClick={() => requestSort("shopName")}
                  className="flex items-center gap-1 group hover:text-gray-700"
                >
                  Name {getSortIcon("shopName")}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden lg:table-cell">
                <button
                  onClick={() => requestSort("createdAt")}
                  className="flex items-center gap-1 group hover:text-gray-700"
                >
                  Date Created {getSortIcon("createdAt")}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden md:table-cell">
                <button
                  onClick={() => requestSort("owner")}
                  className="flex items-center gap-1 group hover:text-gray-700"
                >
                  Owner {getSortIcon("owner")}
                </button>
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 tracking-wider hidden lg:table-cell">
                Contact
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 tracking-wider">
                <button
                  onClick={() => requestSort("status")}
                  className="flex items-center gap-1 mx-auto group hover:text-gray-700"
                >
                  Status {getSortIcon("status")}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedShops.length > 0 ? (
              paginatedShops.map((shop: ShopType, index) => (
                <tr
                  key={shop.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleOpen(shop)}
                >
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{shop.shopName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
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
                  <td className="px-6 py-4 text-sm text-gray-500 hidden lg:table-cell whitespace-nowrap">
                    {shop.contact}
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize items-center gap-1 ${getStatusColor(
                        shop.status
                      )}`}
                    >
                      {getStatusIcon(shop.status)}
                      {shop.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">
                  No shops found.
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
                    <div className="md:col-span-2">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Status
                      </p>
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize items-center gap-1 ${getStatusColor(
                          selectedShop.status
                        )}`}
                      >
                        {getStatusIcon(selectedShop.status)}
                        {selectedShop.status}
                      </span>
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
    </div>
  )
}
