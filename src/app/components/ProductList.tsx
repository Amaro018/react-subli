"use client"
import { useQuery } from "@blitzjs/rpc"
import getAllProducts from "../queries/getAllProducts"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button, Typography, TextField, Select, MenuItem, Slider } from "@mui/material"

export default function ProductList() {
  const [products, { isLoading, isError, error }] = useQuery(getAllProducts, null)

  // State for filtering, searching, and pagination
  const [filterCategory, setFilterCategory] = useState("Categories") // Category filter
  const [searchTerm, setSearchTerm] = useState("") // Search input
  const [priceRange, setPriceRange] = useState([0, 10000]) // Price range
  const [filterColor, setFilterColor] = useState("") // Color filter
  const [currentPage, setCurrentPage] = useState(1) // Current page
  const itemsPerPage = 50

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error?.message}</div>
  }

  // Get all unique categories and colors
  const categories = ["Categories", ...new Set(products.map((product) => product.category.name))]
  const colors = Array.from(
    new Set(
      products.flatMap((product) => product.variants.flatMap((variant) => variant.color.name))
    )
  )

  const filteredProducts = products
    .filter((product) => {
      // Check category filter
      const matchesCategory =
        filterCategory === "Categories" || product.category.name === filterCategory

      // Check color filter (ensure we're comparing the color name)
      const matchesColor =
        !filterColor || product.variants.some((variant) => variant.color.name === filterColor)

      // Check price range filter
      const matchesPriceRange = product.variants.some(
        (variant) => variant.price >= priceRange[0] && variant.price <= priceRange[1]
      )

      // Check search term filter
      const matchesSearchTerm = product.name.toLowerCase().includes(searchTerm.toLowerCase())

      // Combine all filters
      return matchesCategory && matchesColor && matchesPriceRange && matchesSearchTerm
    })
    // Implement pagination
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Calculate total pages for pagination
  const totalPages = Math.ceil(
    products.filter((product) => {
      // Apply the same filters used in `filteredProducts` but without pagination
      const matchesCategory =
        filterCategory === "Categories" || product.category.name === filterCategory

      const matchesColor =
        !filterColor || product.variants.some((variant) => variant.color.name === filterColor)

      const matchesPriceRange = product.variants.some(
        (variant) => variant.price >= priceRange[0] && variant.price <= priceRange[1]
      )

      const matchesSearchTerm = product.name.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesCategory && matchesColor && matchesPriceRange && matchesSearchTerm
    }).length / itemsPerPage
  )

  return (
    <div className="w-full mt-24 p-8 flex flex-row gap-4">
      <div className="w-full rounded-lg flex flex-row gap-8">
        <div className="flex flex-col w-64">
          <h1 className="text-2xl font-bold mb-4">Products</h1>
          {/* Filter Section */}
          <div className="flex flex-col gap-4 mb-4">
            <Select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              displayEmpty
              size="small"
            >
              {categories.map((category) => (
                <MenuItem value={category} key={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>

            <Select
              value={filterColor}
              onChange={(e) => setFilterColor(e.target.value)}
              displayEmpty
              size="small"
            >
              <MenuItem value="">All Colors</MenuItem>
              {colors.map((color) => (
                <MenuItem value={color} key={color}>
                  {color}
                </MenuItem>
              ))}
            </Select>

            <div className="flex flex-col items-center gap-4">
              <Typography>Price Range:</Typography>
              <Slider
                value={priceRange}
                onChange={(e, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
              />
              <TextField
                label="Min Range"
                variant="outlined"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                size="small"
                fullWidth
                type="number"
                inputProps={{ min: 0, max: 10000 }}
              />
              <TextField
                label="Max Range"
                variant="outlined"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                size="small"
                fullWidth
                type="number"
                inputProps={{ min: 0, max: 10000 }}
              />
            </div>
          </div>
          {/* Filter Section */}
        </div>

        <div className="flex flex-col w-full">
          <div className="flex justify-end ">
            <TextField
              label="Search"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth
            />
          </div>
          {/* Products List */}
          <div className="flex flex-wrap gap-4">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <Link href={`/product/${product.id}`} key={product.id}>
                  <div className="w-64 h-80 bg-white rounded shadow-lg flex flex-col items-center overflow-hidden py-2">
                    {/* Image Section */}
                    <div className="w-full h-2/3 flex items-center justify-center bg-gray-100">
                      <Image
                        src={`/uploads/products/${product.images[0]?.url}`}
                        alt={product.name}
                        width={200}
                        height={200}
                        className="object-contain h-full"
                      />
                    </div>

                    {/* Text Section */}
                    <div className="w-full h-1/3 px-4 py-2 flex flex-col justify-center items-center">
                      <h2
                        className="font-bold text-xl text-center text-black truncate max-w-[200px]"
                        title={product.name}
                      >
                        {product.name}
                      </h2>
                      <p className="text-gray-600 text-sm text-center mt-1">
                        {product.category.name}
                      </p>

                      {product.variants.length > 0 ? (
                        product.variants.length === 1 ? (
                          // Show a single variant price if there's only one
                          <p className="text-gray-600 text-sm text-center mt-1">
                            ₱{product.variants[0].price}
                          </p>
                        ) : (
                          // Show price range for multiple variants
                          <p className="text-gray-600 text-sm text-center mt-1">
                            ₱{Math.min(...product.variants.map((variant) => variant.price))} - ₱
                            {Math.max(...product.variants.map((variant) => variant.price))}
                          </p>
                        )
                      ) : (
                        // Handle case where no variants exist
                        <p className="text-gray-600 text-sm text-center mt-1">
                          No variants available
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p>No products available</p>
            )}
          </div>
          {/* Products List */}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center my-4 items-center">
            <Button disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
              Previous
            </Button>
            <Typography className="mx-2">
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
    </div>
  )
}
