"use client"
import React, { useState, useEffect, useRef } from "react"
import { useQuery } from "@blitzjs/rpc"
import getShops from "../queries/getShops"
import getBarangays from "../queries/getBarangays"
import Link from "next/link"
import Image from "next/image"
import {
  Typography,
  Rating,
  TextField,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  FormGroup,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Pagination,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import FilterListIcon from "@mui/icons-material/FilterList"
import ClearIcon from "@mui/icons-material/Clear"
import SearchOffIcon from "@mui/icons-material/SearchOff"
import StorefrontIcon from "@mui/icons-material/Storefront"

export default function ShopsList() {
  const [shops] = useQuery(getShops, null)
  const [barangays] = useQuery(getBarangays, null)

  const activeShops = shops || []

  // State for Search and Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("All")
  const [sortBy, setSortBy] = useState<string>("oldest")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategories, selectedLocation, sortBy])

  // Fetch all available categories from the shops' products or shop's category field
  const availableCategories = Array.from(
    new Set(
      activeShops
        .flatMap((s: any) => {
          if (s.category?.name) return [s.category.name]
          if (typeof s.category === "string") return [s.category]
          if (s.products) return s.products.map((p: any) => p.category?.name)
          return []
        })
        .filter(Boolean)
    )
  )

  // Fetch all available locations (barangays)
  const availableLocations = barangays ? barangays.map((b: any) => b.name) : []

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  // Apply Search and Category Filters
  const filteredShops = activeShops.filter((s: any) => {
    const shopName = s.shopName || s.name || ""
    const matchesSearch = shopName.toLowerCase().includes(searchQuery.toLowerCase())

    const shopCategories = s.category?.name
      ? [s.category.name]
      : typeof s.category === "string"
      ? [s.category]
      : s.products
      ? Array.from(new Set(s.products.map((p: any) => p.category?.name).filter(Boolean)))
      : []

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.some((cat) => shopCategories.includes(cat))

    const locationName = s.barangay || "Unknown"
    const matchesLocation = selectedLocation === "All" || locationName === selectedLocation

    return matchesSearch && matchesCategory && matchesLocation
  })

  // Apply Sorting
  const sortedShops = [...filteredShops].sort((a: any, b: any) => {
    const aRating = a.rating || 0
    const bRating = b.rating || 0

    if (sortBy === "rating_desc") return bRating - aRating
    if (sortBy === "oldest") return a.id - b.id // oldest
    if (sortBy === "newest") return b.id - a.id // newest

    // Relevance
    if (sortBy === "relevance" && searchQuery) {
      const aName = a.shopName || a.name || ""
      const bName = b.shopName || b.name || ""
      const aStarts = aName.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0
      const bStarts = bName.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0
      if (aStarts !== bStarts) return bStarts - aStarts
    }
    return b.id - a.id // Fallback to newest
  })

  const totalPages = Math.ceil(sortedShops.length / itemsPerPage)
  const paginatedShops = sortedShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 md:flex-row"
      ref={topRef}
    >
      {/* Left Section: Filter Sidebar */}
      <div className="w-full md:w-[280px] flex-shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 sticky top-6 flex flex-col divide-y divide-gray-100">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FilterListIcon className="text-[#1b2a80]" />
              <Typography variant="h6" fontWeight="bold" className="text-gray-900">
                Filters
              </Typography>
            </div>
            {(selectedCategories.length > 0 || selectedLocation !== "All") && (
              <button
                onClick={() => {
                  setSelectedCategories([])
                  setSelectedLocation("All")
                }}
                className="text-sm font-medium text-[#1b2a80] hover:text-blue-800 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {availableCategories.length > 0 && (
            <div className="p-6 flex flex-col gap-4">
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                className="text-gray-900 uppercase tracking-wider text-xs"
              >
                Categories
              </Typography>
              <FormGroup sx={{ gap: 1 }}>
                {availableCategories.map((cat) => (
                  <FormControlLabel
                    key={cat as string}
                    control={
                      <Checkbox
                        size="small"
                        sx={{ color: "#cbd5e1", "&.Mui-checked": { color: "#1b2a80" } }}
                        checked={selectedCategories.includes(cat as string)}
                        onChange={() => handleCategoryToggle(cat as string)}
                      />
                    }
                    label={
                      <Typography variant="body2" className="text-gray-700">
                        {cat as string}
                      </Typography>
                    }
                    sx={{ margin: 0, ml: -1 }}
                  />
                ))}
              </FormGroup>
            </div>
          )}

          <div className="p-6 flex flex-col gap-4">
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              className="text-gray-900 uppercase tracking-wider text-xs"
            >
              Location
            </Typography>
            <FormControl fullWidth size="small">
              <Select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                displayEmpty
                sx={{
                  bgcolor: "#f8fafc",
                  borderRadius: "10px",
                  "& fieldset": { borderColor: "#e2e8f0" },
                  "&:hover fieldset": { borderColor: "#cbd5e1" },
                  "&.Mui-focused fieldset": { borderColor: "#1b2a80" },
                  fontSize: "0.875rem",
                }}
              >
                <MenuItem value="All" sx={{ fontSize: "0.875rem" }}>
                  All Barangays
                </MenuItem>
                {availableLocations.map((loc: string) => (
                  <MenuItem key={loc} value={loc} sx={{ fontSize: "0.875rem" }}>
                    {loc}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      </div>

      {/* Right Section: Shops Grid */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Top Section: Sort and Search Bar */}
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4">
          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              bgcolor: "white",
              borderRadius: "12px",
              "& fieldset": { borderColor: "#e5e7eb" },
            }}
          >
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              displayEmpty
              sx={{ borderRadius: "12px", fontSize: "0.875rem" }}
            >
              <MenuItem value="relevance" sx={{ fontSize: "0.875rem" }}>
                Relevance
              </MenuItem>
              <MenuItem value="newest" sx={{ fontSize: "0.875rem" }}>
                Newest Shops
              </MenuItem>
              <MenuItem value="oldest" sx={{ fontSize: "0.875rem" }}>
                Oldest Shops
              </MenuItem>
              <MenuItem value="rating_desc" sx={{ fontSize: "0.875rem" }}>
                Highest Rated
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            className="w-full sm:w-96"
            placeholder="Search for a shop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-gray-400" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchQuery("")} edge="end" size="small">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: {
                bgcolor: "white",
                borderRadius: "12px",
                "& fieldset": { borderColor: "#e5e7eb" },
              },
            }}
          />
        </div>

        {!sortedShops.length ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-sm border border-gray-100 px-4 h-full min-h-[400px]">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <SearchOffIcon sx={{ fontSize: 64, color: "#94a3b8" }} />
            </div>
            <Typography variant="h6" fontWeight="bold" className="text-gray-900 mb-2">
              No shops found
            </Typography>
            <Typography variant="body2" className="text-gray-500 max-w-sm mb-6">
              We couldn&apos;t find any shops matching your current filters and search query.
            </Typography>
            {(searchQuery || selectedCategories.length > 0 || selectedLocation !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategories([])
                  setSelectedLocation("All")
                }}
                className="px-6 py-2.5 bg-[#1b2a80] text-white rounded-xl font-medium hover:bg-[#152266] transition-colors shadow-sm text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedShops.map((shop: any) => {
                const shopName = shop.shopName || shop.name || "Shop"
                const shopCategories = shop.category?.name
                  ? [shop.category.name]
                  : typeof shop.category === "string"
                  ? [shop.category]
                  : shop.products
                  ? Array.from(
                      new Set(shop.products.map((p: any) => p.category?.name).filter(Boolean))
                    )
                  : []
                const categoryText =
                  shopCategories.length > 0 ? shopCategories.join(", ") : "General"

                return (
                  <div
                    key={shop.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col p-6 items-center text-center"
                  >
                    <Link
                      href={`/shops/${shop.slug || shop.id}`}
                      className="relative w-full h-[140px] mb-4 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center"
                    >
                      {shop.imageProfile ? (
                        <Image
                          src={
                            shop.imageProfile.startsWith("http") ||
                            shop.imageProfile.startsWith("/")
                              ? shop.imageProfile
                              : `/uploads/shop-profile/${shop.imageProfile}`
                          }
                          alt={shopName}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <StorefrontIcon sx={{ fontSize: "3rem", color: "#9ca3af" }} />
                      )}
                    </Link>
                    <Link
                      href={`/shops/${shop.slug || shop.id}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {shopName}
                      </Typography>
                    </Link>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {categoryText}
                    </Typography>
                    <div className="flex items-center gap-1 mb-6">
                      <Rating value={shop.rating || 0} precision={0.1} size="small" readOnly />
                      <span className="text-sm font-medium text-gray-700">{shop.rating || 0}</span>
                      <span className="text-xs text-gray-500">(0)</span>
                    </div>
                    <Link
                      href={`/shops/${shop.slug || shop.id}`}
                      className="mt-auto w-full inline-flex justify-center items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-[#1b2a80] bg-white hover:bg-gray-50 transition-colors"
                    >
                      <StorefrontIcon fontSize="small" sx={{ mr: 1 }} /> Visit Shop
                    </Link>
                  </div>
                )
              })}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 mb-8">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, value) => {
                    setCurrentPage(value)
                    topRef.current?.scrollIntoView({ behavior: "smooth" })
                  }}
                  color="primary"
                  shape="rounded"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
