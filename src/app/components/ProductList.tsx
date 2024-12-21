"use client"
import { useQuery } from "@blitzjs/rpc"
import getAllProducts from "../queries/getAllProducts"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Button, Typography } from "@mui/material"
export default function ProductList() {
  const [products, { isLoading, isError, error }] = useQuery(getAllProducts, null)

  //this is for filtering and sorting data
  const [filterStatus, setFilterStatus] = useState("all") // Filter status
  const [currentPage, setCurrentPage] = useState(1) // Current page
  const itemsPerPage = 50

  // Paginate rents
  const totalPages = Math.ceil(products.length / itemsPerPage)
  const paginatedRents = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error: {error?.message}</div>
  }

  return (
    <div className="w-full mt-24 p-8">
      <div className="w-full  p-4 rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Products</h1>
        <div className="flex flex-wrap gap-4 justify-center">
          {paginatedRents.length > 0 ? (
            paginatedRents.map((product) => (
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
  )
}
