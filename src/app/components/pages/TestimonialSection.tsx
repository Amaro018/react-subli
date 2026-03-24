"use client"

import React, { useRef } from "react"
import { Rating, IconButton } from "@mui/material"
import FormatQuoteIcon from "@mui/icons-material/FormatQuote"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"

const testimonials = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Event Planner",
    content:
      "This platform saved my last-minute event! I found a high-quality PA system and picked it up within hours. Highly recommended!",
    rating: 5,
    initials: "SJ",
  },
  {
    id: 2,
    name: "Mark T.",
    role: "Photographer",
    content:
      "As a freelance photographer, buying gear for every shoot is too expensive. Renting lenses here has been a game changer for my business.",
    rating: 5,
    initials: "MT",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    role: "DIY Enthusiast",
    content:
      "Rented a power washer for a weekend project. The process was super smooth, and the owner was very helpful with instructions.",
    rating: 4,
    initials: "ER",
  },
  {
    id: 4,
    name: "David Chen",
    role: "Musician",
    content:
      "Found the perfect acoustic guitar for a gig when mine broke. The lender was amazing and the price was incredibly reasonable.",
    rating: 5,
    initials: "DC",
  },
  {
    id: 5,
    name: "Jessica Alba",
    role: "Camper",
    content:
      "Rented a huge 6-person tent and camping gear. Everything was clean and in great condition. Can't wait to use this service again!",
    rating: 5,
    initials: "JA",
  },
]

export default function TestimonialSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef
      const scrollAmount = 350 // Distance to scroll per click
      if (direction === "left") {
        current.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        current.scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  return (
    <section className="bg-gray-50 py-12 md:py-16 w-full border-t border-gray-100">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-6 text-center sm:text-left">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1b2a80] sm:text-4xl">
              What Our Community Says
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Join thousands of happy renters and lenders.
            </p>
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
          className="flex overflow-x-auto gap-8 pb-4 scrollbar-seamless [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="flex-none w-[300px] sm:w-[350px] bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative hover:shadow-md transition-shadow"
              style={{ scrollSnapAlign: "start" }}
            >
              <FormatQuoteIcon
                className="absolute top-6 right-8 text-blue-50 rotate-180"
                sx={{ fontSize: 60 }}
              />
              <Rating value={testimonial.rating} readOnly size="small" className="mb-4" />
              <p className="text-gray-700 italic mb-6 relative z-10">
                &quot;{testimonial.content}&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1b2a80] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
