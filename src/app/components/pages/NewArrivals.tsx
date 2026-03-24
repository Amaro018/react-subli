"use client"
import React, { useRef } from "react"
import { useQuery } from "@blitzjs/rpc"
import getAllProducts from "../../queries/getAllProducts"
import Link from "next/link"
import Image from "next/image"
import { IconButton, Typography, Rating } from "@mui/material"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"

export default function NewArrivals() {
  const [products] = useQuery(getAllProducts, null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Filter active products and reverse them to show the newest items first
  const newProducts =
    products
      ?.filter((p) => p.status === "active")
      .slice(-8)
      .reverse() || []

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = 300 // Distance to scroll per click
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  if (!newProducts.length) return null

  return (
    <section className="py-12 md:py-16 bg-gray-50 w-full border-t border-gray-100">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Typography variant="h4" component="h2" fontWeight="bold" color="text.primary">
            New Arrivals
          </Typography>
          <div className="hidden sm:flex gap-2">
            <IconButton
              onClick={() => scroll("left")}
              sx={{
                bgcolor: "white",
                border: "1px solid #e5e7eb",
                "&:hover": { bgcolor: "grey.50" },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={() => scroll("right")}
              sx={{
                bgcolor: "white",
                border: "1px solid #e5e7eb",
                "&:hover": { bgcolor: "grey.50" },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-4 scrollbar-seamless [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {newProducts.map((product: any) => {
            // Calculate starting price
            const minPrice = product.variants?.length
              ? Math.min(...product.variants.map((v: any) => v.price))
              : 0

            // Calculate average rating
            const sum =
              product.reviews?.reduce((acc: any, review: any) => acc + review.rating, 0) || 0
            const average = product.reviews?.length ? sum / product.reviews.length : 0

            return (
              <div
                key={product.id}
                className="flex-none w-[280px] bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col"
                style={{ scrollSnapAlign: "start" }}
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
                    <span className="text-xs text-gray-500">({product.reviews?.length || 0})</span>
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Starting from
                      </Typography>
                      <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                        ₱{minPrice?.toLocaleString()}/day
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
