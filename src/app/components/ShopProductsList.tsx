"use client"
import React, { useState, useEffect, useRef } from "react"
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
import CategoryIcon from "@mui/icons-material/Category"

export default function ShopProductsList({ products }: { products: any[] }) {
  const activeProducts = products?.filter((p: any) => p.status?.toLowerCase() === "active") || []

  // State for Search and Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<string>("oldest")

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategories, sortBy])

  // Fetch all available categories from the database
  const availableCategories = Array.from(
    new Set(activeProducts.map((p: any) => p.category?.name).filter(Boolean))
  )

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

    return matchesSearch && matchesCategory
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

  if (activeProducts.length === 0) {
    return (
      <p className="text-gray-500 py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        This shop hasn&apos;t listed any items yet.
      </p>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6" ref={topRef}>
      <h2 className="text-2xl font-bold text-gray-900">Shop Items</h2>

      <div className="flex flex-col md:flex-row gap-8">
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
              {selectedCategories.length > 0 && (
                <button
                  onClick={() => setSelectedCategories([])}
                  className="text-sm font-medium text-[#1b2a80] hover:text-blue-800 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {availableCategories.length > 0 && (
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
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        sx={{
                          color: "#cbd5e1",
                          "&.Mui-checked": { color: "#1b2a80" },
                        }}
                        checked={selectedCategories.length === 0}
                        onChange={() => setSelectedCategories([])}
                      />
                    }
                    label={
                      <Typography variant="body2" className="text-gray-700">
                        All Categories
                      </Typography>
                    }
                    sx={{ margin: 0, ml: -1 }}
                  />
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
            )}
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
              placeholder="Search for items in shop..."
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
                We couldn&apos;t find any products matching your current filters and search query.
                Try adjusting your criteria.
              </Typography>
              {(searchQuery || selectedCategories.length > 0) && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategories([])
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
                        {product.images && product.images.length > 0 ? (
                          <Image
                            src={
                              product.images[0].url.startsWith("http") ||
                              product.images[0].url.startsWith("/")
                                ? product.images[0].url
                                : `/uploads/products/${product.images[0].url}`
                            }
                            alt={product.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Image
                              src="/placeholder.png"
                              alt={product.name}
                              width={64}
                              height={64}
                              className="opacity-20 object-contain"
                            />
                          </div>
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
                          <Rating
                            value={average}
                            precision={0.5}
                            size="small"
                            sx={{ color: "#FBBF24" }}
                            readOnly
                          />
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
    </div>
  )
}
