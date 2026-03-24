"use client"

import React, { useRef } from "react"
import { useQuery } from "@blitzjs/rpc"
import getCategories from "../../queries/getCategories"
import { categoryIconMap } from "../../utils/categoryIconMap"
import { IconButton } from "@mui/material"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"

const CategorySection: React.FC = () => {
  const [categories] = useQuery(getCategories, null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 md:mb-10 gap-4 text-center sm:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1b2a80] sm:text-3xl">
              Browse Rental Categories
            </h2>
            <p className="mt-2 text-base text-gray-500">Rent anything you need — fast and easy</p>
          </div>
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
          className="flex overflow-x-auto gap-4 sm:gap-6 lg:gap-8 pb-4 scrollbar-seamless [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {categories.map((category) => {
            const Icon = categoryIconMap[category.iconKey] ?? categoryIconMap.default

            return (
              <div
                key={category.id}
                className="group flex-none flex h-32 w-28 cursor-pointer flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-lg sm:h-40 sm:w-36 md:h-44 md:w-40 lg:h-48 lg:w-44"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[#1b2a80] transition-colors group-hover:bg-[#1b2a80] group-hover:text-white sm:h-14 sm:w-14">
                  <Icon sx={{ fontSize: { xs: 24, sm: 28 } }} />
                </div>

                <p className="mt-3 text-center text-xs font-semibold text-gray-700 group-hover:text-[#1b2a80] sm:text-sm">
                  {category.name}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default CategorySection
