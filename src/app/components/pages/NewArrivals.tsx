"use client"
import React, { useRef, useState, useEffect } from "react"
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
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)

  // Filter active products, sort from newest to oldest, and slice top 20
  const newProducts =
    products
      ?.filter((p) => p.status === "active")
      .sort((a, b) => b.id - a.id)
      .slice(0, 20) || []

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

  useEffect(() => {
    if (!isAutoScrolling || !newProducts.length) return

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { current } = scrollContainerRef
        const isAtEnd = current.scrollLeft + current.clientWidth >= current.scrollWidth - 10

        if (isAtEnd) {
          current.scrollTo({ left: 0, behavior: "smooth" })
        } else {
          current.scrollBy({ left: 300, behavior: "smooth" })
        }
      }
    }, 3500) // Auto-scroll every 3.5 seconds

    return () => clearInterval(interval)
  }, [isAutoScrolling, newProducts.length])

  if (!newProducts.length) return null

  return (
    <section className="py-12 md:py-16 bg-gray-50 w-full border-t border-gray-100">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 md:mb-10 gap-4 text-center sm:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1b2a80] sm:text-3xl">
              New Arrivals
            </h2>
            <p className="mt-2 text-base text-gray-500">Fresh items just added to our catalog</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/products?sort=newest"
              className="text-sm font-bold text-[#1b2a80] hover:text-blue-800 hover:underline transition-colors"
            >
              View All
            </Link>
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
        </div>

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-6 pb-4 scrollbar-seamless [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ scrollSnapType: "x mandatory" }}
          onMouseEnter={() => setIsAutoScrolling(false)}
          onMouseLeave={() => setIsAutoScrolling(true)}
          onTouchStart={() => setIsAutoScrolling(false)}
          onTouchEnd={() => setIsAutoScrolling(true)}
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
            const thumbnail =
              product.images?.find((img: any) => img.isThumbnail) || product.images?.[0]

            return (
              <div
                key={product.id}
                className="flex-none w-[280px] bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col"
                style={{ scrollSnapAlign: "start" }}
              >
                <Link
                  href={`/products/${product.id}`}
                  className="block relative w-full h-[200px] overflow-hidden rounded-t-xl bg-gray-50"
                >
                  {thumbnail && (
                    <Image
                      src={`/uploads/products/${thumbnail.url}`}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                </Link>

                <div className="p-4 flex flex-col flex-grow">
                  <Link
                    href={`/products/${product.id}`}
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
