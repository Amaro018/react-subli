"use client"
import React, { useRef, useState, useEffect } from "react"
import { useQuery } from "@blitzjs/rpc"
import getShops from "../../queries/getShops"
import Link from "next/link"
import Image from "next/image"
import { IconButton, Typography, Rating, Avatar } from "@mui/material"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import StorefrontIcon from "@mui/icons-material/Storefront"

export default function TopShops() {
  const [shops] = useQuery(getShops, null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)

  // Sort shops by highest rating first and take the top 20
  const topShops = [...(shops || [])]
    .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 20)

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
    if (!isAutoScrolling || !topShops.length) return

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
  }, [isAutoScrolling, topShops.length])

  if (!topShops.length) return null

  return (
    <section className="py-12 md:py-16 bg-white w-full border-t border-gray-100">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 md:mb-10 gap-4 text-center sm:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1b2a80] sm:text-3xl">
              Top Shops
            </h2>
            <p className="mt-2 text-base text-gray-500">
              The most trusted and highly rated lenders
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/shops?sort=rating_desc"
              className="text-sm font-bold text-[#1b2a80] hover:text-blue-800 hover:underline transition-colors"
            >
              View All
            </Link>
            <div className="hidden sm:flex gap-2">
              <IconButton
                onClick={() => scroll("left")}
                sx={{ bgcolor: "grey.100", "&:hover": { bgcolor: "grey.200" } }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                onClick={() => scroll("right")}
                sx={{ bgcolor: "grey.100", "&:hover": { bgcolor: "grey.200" } }}
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
          {topShops.map((shop: any) => {
            const shopName = shop.shopName || shop.name || "Shop"
            return (
              <div
                key={shop.id}
                className="flex-none w-[260px] bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col items-center text-center"
                style={{ scrollSnapAlign: "start" }}
              >
                <Link
                  href={`/shops/${shop.id}`}
                  className="relative w-full h-[140px] mb-4 overflow-hidden rounded-xl bg-gray-50 flex items-center justify-center"
                >
                  {shop.imageProfile ? (
                    <Image
                      src={`/uploads/shop-profile/${shop.imageProfile}`}
                      alt={shopName}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <StorefrontIcon sx={{ fontSize: "3rem", color: "#9ca3af" }} />
                  )}
                </Link>
                <Link href={`/shops/${shop.id}`} className="hover:text-blue-600 transition-colors">
                  <Typography variant="h6" fontWeight="bold">
                    {shopName}
                  </Typography>
                </Link>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {shop.category || "General"}
                </Typography>
                <div className="flex items-center gap-1 mb-6">
                  <Rating value={shop.rating || 0} precision={0.1} size="small" readOnly />
                  <span className="text-sm font-medium text-gray-700">{shop.rating || 0}</span>
                  <span className="text-xs text-gray-500">(0)</span>
                </div>
                <Link
                  href={`/shops/${shop.id}`}
                  className="mt-auto w-full inline-flex justify-center items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-[#1b2a80] bg-white hover:bg-gray-50 transition-colors"
                >
                  <StorefrontIcon fontSize="small" sx={{ mr: 1 }} /> Visit Shop
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
