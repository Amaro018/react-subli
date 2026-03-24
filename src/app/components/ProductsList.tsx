"use client"
import React, { useState, useEffect, useRef } from "react"
import { useQuery } from "@blitzjs/rpc"
import getAllProducts from "../queries/getAllProducts"
import getCategories from "../queries/getCategories"
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
  Divider,
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
import LocationOnIcon from "@mui/icons-material/LocationOn"
import CategoryIcon from "@mui/icons-material/Category"
import PaymentsIcon from "@mui/icons-material/Payments"

export default function ProductsList() {
  const [products] = useQuery(getAllProducts, null)
  const [categories] = useQuery(getCategories, null)
  const [barangays] = useQuery(getBarangays, null)

  const activeProducts = products?.filter((p) => p.status === "active") || []

  // State for Search and Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>("All")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("oldest")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategories, selectedLocation, minPrice, maxPrice, sortBy])

  // Fetch all available categories from the database
  const availableCategories = categories ? categories.map((c: any) => c.name) : []

  // Fetch all available locations (barangays) from the database
  const availableLocations = barangays ? barangays.map((b: any) => b.name) : []

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
  }

  // Apply Search and Category Filters
  const filteredProducts = activeProducts.filter((p: any) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const categoryName = p.category?.name || "Uncategorized"
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(categoryName)

    const productMinPrice = p.variants?.length
      ? Math.min(...p.variants.map((v: any) => v.price))
      : 0
    const minP = minPrice === "" ? 0 : Number(minPrice)
    const maxP = maxPrice === "" ? Infinity : Number(maxPrice)
    const matchesPrice = productMinPrice >= minP && productMinPrice <= maxP

    const locationName = p.shop?.barangay || "Unknown"
    const matchesLocation = selectedLocation === "All" || locationName === selectedLocation

    return matchesSearch && matchesCategory && matchesPrice && matchesLocation
  })

  // Apply Sorting
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    const aMinPrice = a.variants?.length ? Math.min(...a.variants.map((v: any) => v.price)) : 0
    const bMinPrice = b.variants?.length ? Math.min(...b.variants.map((v: any) => v.price)) : 0

    const aRating = a.reviews?.length
      ? a.reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0) / a.reviews.length
      : 0
    const bRating = b.reviews?.length
      ? b.reviews.reduce((acc: any, rev: any) => acc + rev.rating, 0) / b.reviews.length
      : 0

    if (sortBy === "price_asc") return aMinPrice - bMinPrice
    if (sortBy === "price_desc") return bMinPrice - aMinPrice
    if (sortBy === "rating_desc") return bRating - aRating
    if (sortBy === "oldest") return a.id - b.id // oldest
    if (sortBy === "newest") return b.id - a.id // newest

    // Relevance
    if (sortBy === "relevance" && searchQuery) {
      const aStarts = a.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0
      const bStarts = b.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0
      if (aStarts !== bStarts) return bStarts - aStarts
    }
    return b.id - a.id // Fallback to newest
  })

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = sortedProducts.slice(
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
            {(selectedCategories.length > 0 ||
              selectedLocation !== "All" ||
              minPrice !== "" ||
              maxPrice !== "") && (
              <button
                onClick={() => {
                  setSelectedCategories([])
                  setSelectedLocation("All")
                  setMinPrice("")
                  setMaxPrice("")
                }}
                className="text-sm font-medium text-[#1b2a80] hover:text-blue-800 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <CategoryIcon sx={{ fontSize: 16, color: "#1b2a80" }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                className="text-gray-900 uppercase tracking-wider text-xs"
              >
                Categories
              </Typography>
            </div>
            <FormGroup sx={{ gap: 1 }}>
              {availableCategories.map((cat) => (
                <FormControlLabel
                  key={cat as string}
                  control={
                    <Checkbox
                      size="small"
                      sx={{
                        color: "#cbd5e1",
                        "&.Mui-checked": { color: "#1b2a80" },
                      }}
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

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <LocationOnIcon sx={{ fontSize: 16, color: "#1b2a80" }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                className="text-gray-900 uppercase tracking-wider text-xs"
              >
                Location
              </Typography>
            </div>
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

          <div className="p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <PaymentsIcon sx={{ fontSize: 16, color: "#1b2a80" }} />
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                className="text-gray-900 uppercase tracking-wider text-xs"
              >
                Price Range (₱)
              </Typography>
            </div>
            <div className="flex gap-3 items-center">
              <TextField
                size="small"
                placeholder="Min"
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#f8fafc",
                    borderRadius: "10px",
                    "& fieldset": { borderColor: "#e2e8f0" },
                    "&:hover fieldset": { borderColor: "#cbd5e1" },
                    "&.Mui-focused fieldset": { borderColor: "#1b2a80" },
                  },
                  "& input": { fontSize: "0.875rem", padding: "8px 12px" },
                }}
              />
              <span className="text-gray-400 font-medium">-</span>
              <TextField
                size="small"
                placeholder="Max"
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#f8fafc",
                    borderRadius: "10px",
                    "& fieldset": { borderColor: "#e2e8f0" },
                    "&:hover fieldset": { borderColor: "#cbd5e1" },
                    "&.Mui-focused fieldset": { borderColor: "#1b2a80" },
                  },
                  "& input": { fontSize: "0.875rem", padding: "8px 12px" },
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Section: Product Grid */}
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
                Newest Arrivals
              </MenuItem>
              <MenuItem value="oldest" sx={{ fontSize: "0.875rem" }}>
                Oldest Arrivals
              </MenuItem>
              <MenuItem value="price_asc" sx={{ fontSize: "0.875rem" }}>
                Price: Low to High
              </MenuItem>
              <MenuItem value="price_desc" sx={{ fontSize: "0.875rem" }}>
                Price: High to Low
              </MenuItem>
              <MenuItem value="rating_desc" sx={{ fontSize: "0.875rem" }}>
                Highest Rated
              </MenuItem>
            </Select>
          </FormControl>

          <TextField
            className="w-full sm:w-96"
            placeholder="Search for equipment, gear, and more..."
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
                  <IconButton
                    aria-label="clear search"
                    onClick={() => setSearchQuery("")}
                    edge="end"
                    size="small"
                  >
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

        {!sortedProducts.length ? (
          <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-sm border border-gray-100 px-4 h-full min-h-[400px]">
            <div className="bg-slate-50 p-6 rounded-full mb-4">
              <SearchOffIcon sx={{ fontSize: 64, color: "#94a3b8" }} />
            </div>
            <Typography variant="h6" fontWeight="bold" className="text-gray-900 mb-2">
              No products found
            </Typography>
            <Typography variant="body2" className="text-gray-500 max-w-sm mb-6">
              We couldn&apos;t find any products matching your current filters and search query. Try
              adjusting your criteria.
            </Typography>
            {(searchQuery ||
              selectedCategories.length > 0 ||
              selectedLocation !== "All" ||
              minPrice ||
              maxPrice) && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategories([])
                  setSelectedLocation("All")
                  setMinPrice("")
                  setMaxPrice("")
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
              {paginatedProducts.map((product: any) => {
                const itemMinPrice = product.variants?.length
                  ? Math.min(...product.variants.map((v: any) => v.price))
                  : 0
                const sum =
                  product.reviews?.reduce((acc: any, review: any) => acc + review.rating, 0) || 0
                const average = product.reviews?.length ? sum / product.reviews.length : 0

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col"
                  >
                    <Link
                      href={`/product/${product.id}`}
                      className="block relative w-full h-[200px] overflow-hidden rounded-t-xl bg-gray-50"
                    >
                      {product.images && product.images.length > 0 && (
                        <Image
                          src={`/uploads/products/${product.images[0].url}`}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </Link>
                    <div className="p-4 flex flex-col flex-grow">
                      <Link
                        href={`/product/${product.id}`}
                        className="hover:text-blue-600 transition-colors mb-1"
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {product.name}
                        </Typography>
                      </Link>
                      <div className="flex items-center gap-1 mb-4">
                        <Rating value={average} precision={0.5} size="small" readOnly />
                        <span className="text-xs text-gray-500">
                          ({product.reviews?.length || 0})
                        </span>
                      </div>
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Starting from
                          </Typography>
                          <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                            ₱{itemMinPrice?.toLocaleString()}/day
                          </Typography>
                        </div>
                      </div>
                    </div>
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
