"use client"
import React, { useState, useEffect, useRef } from "react"
import { useSession } from "@blitzjs/auth"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getAllProducts from "../queries/getAllProducts"
import getCategories from "../queries/getCategories"
import getBarangays from "../queries/getBarangays"
import toggleSavedItem from "../mutations/toggleSavedItem" // Adjust path to your mutation
import getSavedItems from "../queries/getSavedItems" // Adjust path to your query
import Link from "next/link"
import Image from "next/image"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  Typography,
  Rating,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  IconButton,
} from "@mui/material"
import SearchOffIcon from "@mui/icons-material/SearchOff"
import PaymentsIcon from "@mui/icons-material/Payments"
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder"
import BookmarkIcon from "@mui/icons-material/Bookmark"
import FilterSidebar from "./FilterSidebar"
import TopSearchBar from "./TopSearchBar"
import { toast } from "@/src/app/utils/toast"

export default function ProductsList() {
  const session = useSession({ suspense: false })

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const initialSort = searchParams.get("sort") || "oldest"
  const initialCategory = searchParams.get("category")
  const initialSearch = searchParams.get("search") || ""

  const [products] = useQuery(getAllProducts, null)
  const [categories] = useQuery(getCategories, null)
  const [barangays] = useQuery(getBarangays, null)

  // Fetch saved items list for current user
  const [savedItems = [], { refetch: refetchSavedItems }] = useQuery(getSavedItems, null, {
    suspense: false,
    enabled: Boolean(session.userId),
  })
  const [toggleSavedMutation] = useMutation(toggleSavedItem)

  const activeProducts = products?.filter((p) => p.status === "active") || []

  // State for Search and Filters
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? initialCategory.split(",") : []
  )
  const [selectedLocation, setSelectedLocation] = useState<string>("All")
  const [minPrice, setMinPrice] = useState<string>("")
  const [maxPrice, setMaxPrice] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>(initialSort)

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const topRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategories, selectedLocation, minPrice, maxPrice, sortBy])

  const availableCategories = categories ? categories.map((c: any) => c.name) : []
  const availableLocations = barangays ? barangays.map((b: any) => b.name) : []

  const handleCategoryToggle = (category: string) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((c) => c !== category)
      : [...selectedCategories, category]

    setSelectedCategories(newCategories)

    const params = new URLSearchParams(searchParams.toString())
    if (newCategories.length > 0) {
      params.set("category", newCategories.join(","))
    } else {
      params.delete("category")
    }
    router.replace(`${pathname}?${params.toString()}` as any, { scroll: false })
  }

  // Handle Bookmark / Save Toggle
  const handleToggleSave = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault()
    e.stopPropagation()

    // 1. Handle Guest User
    if (!session.userId) {
      toast.error("Please log in to save items to your saved list.")

      const currentUrl = `${pathname}?${searchParams.toString()}`
      router.push(`/login?next=${encodeURIComponent(currentUrl)}` as any)
      return
    }

    // 2. Handle Authenticated User
    try {
      const result = await toggleSavedMutation({ productId })

      if (refetchSavedItems) {
        await refetchSavedItems()
      }

      if (result?.saved) {
        toast.success("Item saved to your list!")
      } else {
        toast.info("Item removed from your saved list.")
      }
    } catch (error) {
      toast.error("Failed to update saved item. Please try again.")
    }
  }

  // Helper check to see if product is saved
  const isProductSaved = (productId: number) => {
    return savedItems?.some((item: any) => item.productId === productId || item.id === productId)
  }

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
    if (sortBy === "oldest") return a.id - b.id
    if (sortBy === "newest") return b.id - a.id

    if (sortBy === "relevance" && searchQuery) {
      const aStarts = a.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0
      const bStarts = b.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ? 1 : 0
      if (aStarts !== bStarts) return bStarts - aStarts
    }
    return b.id - a.id
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
      <FilterSidebar
        showClearAll={
          searchQuery !== "" ||
          selectedCategories.length > 0 ||
          selectedLocation !== "All" ||
          minPrice !== "" ||
          maxPrice !== ""
        }
        onClearAll={() => {
          setSearchQuery("")
          setSelectedCategories([])
          setSelectedLocation("All")
          setMinPrice("")
          setMaxPrice("")
          const params = new URLSearchParams(searchParams.toString())
          params.delete("search")
          params.delete("category")
          router.replace(`${pathname}?${params.toString()}` as any, { scroll: false })
        }}
        availableCategories={availableCategories}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
        onClearCategories={() => {
          setSelectedCategories([])
          const params = new URLSearchParams(searchParams.toString())
          params.delete("category")
          router.replace(`${pathname}?${params.toString()}` as any, { scroll: false })
        }}
        availableLocations={availableLocations}
        selectedLocation={selectedLocation}
        onLocationChange={(loc) => setSelectedLocation(loc)}
      >
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
      </FilterSidebar>

      {/* Right Section: Product Grid */}
      <div className="flex-1 flex flex-col gap-6">
        <TopSearchBar
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={[
            { value: "relevance", label: "Relevance" },
            { value: "newest", label: "Newest Arrivals" },
            { value: "oldest", label: "Oldest Arrivals" },
            { value: "price_asc", label: "Price: Low to High" },
            { value: "price_desc", label: "Price: High to Low" },
            { value: "rating_desc", label: "Highest Rated" },
          ]}
          searchQuery={searchQuery}
          onSearchChange={(val) => {
            setSearchQuery(val)
            const params = new URLSearchParams(searchParams.toString())
            if (val) {
              params.set("search", val)
            } else {
              params.delete("search")
            }
            router.replace(`${pathname}?${params.toString()}` as any, { scroll: false })
          }}
          onSearchClear={() => {
            setSearchQuery("")
            const params = new URLSearchParams(searchParams.toString())
            params.delete("search")
            router.replace(`${pathname}?${params.toString()}` as any, { scroll: false })
          }}
          searchPlaceholder="Search for equipment, gear, and more..."
        />

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

                  const params = new URLSearchParams(searchParams.toString())
                  params.delete("search")
                  params.delete("category")
                  router.replace(`${pathname}?${params.toString()}` as any, { scroll: false })
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
                const thumbnail =
                  product.images?.find((img: any) => img.isThumbnail) || product.images?.[0]
                const saved = isProductSaved(product.id)

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col overflow-hidden"
                  >
                    {/* Bookmark / Save Button */}
                    <div className="absolute top-2 right-2 z-10">
                      <IconButton
                        onClick={(e) => handleToggleSave(e, product.id)}
                        sx={{
                          backgroundColor: "rgba(255, 255, 255, 0.85)",
                          backdropFilter: "blur(4px)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 1)",
                          },
                        }}
                        size="small"
                      >
                        {saved ? (
                          <BookmarkIcon sx={{ color: "#1b2a80" }} fontSize="small" />
                        ) : (
                          <BookmarkBorderIcon sx={{ color: "#64748b" }} fontSize="small" />
                        )}
                      </IconButton>
                    </div>

                    <Link
                      href={`/products/${product.slug || product.id}`}
                      className="block relative w-full h-[200px] overflow-hidden rounded-t-xl bg-gray-50"
                    >
                      {thumbnail && (
                        <Image
                          src={`/uploads/products/${thumbnail.url}`}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                    </Link>
                    <div className="p-4 flex flex-col flex-grow">
                      <Link
                        href={`/products/${product.slug || product.id}`}
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
