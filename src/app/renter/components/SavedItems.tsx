"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getSavedItems from "../../queries/getSavedItems"
import toggleSavedItem from "../../mutations/toggleSavedItem"
import toast from "../../utils/toast"
import { Typography, Rating, IconButton } from "@mui/material"
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove"
import SearchOffIcon from "@mui/icons-material/SearchOff"

export default function SavedItems() {
  const [savedItems = [], { refetch }] = useQuery(getSavedItems, null, {
    suspense: false,
    refetchOnWindowFocus: true,
  })

  const [toggleSavedMutation] = useMutation(toggleSavedItem)

  const handleRemoveSaved = async (e: React.MouseEvent, productId: number) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      await toggleSavedMutation({ productId })
      await refetch()
      toast.info("Item removed from your saved list.")
    } catch (error) {
      console.error("Failed to remove saved item:", error)
      toast.error("Failed to update saved items. Please try again.")
    }
  }

  if (!savedItems.length) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 p-8 shadow-sm min-h-[350px]">
        <div className="bg-slate-50 p-5 rounded-full mb-4">
          <SearchOffIcon sx={{ fontSize: 56, color: "#94a3b8" }} />
        </div>
        <Typography variant="h6" fontWeight="bold" className="text-gray-900 mb-1">
          No saved items yet
        </Typography>
        <Typography variant="body2" className="text-gray-500 max-w-sm mb-6">
          Explore products and click the bookmark icon to save equipment you want to rent later.
        </Typography>
        <Link
          href="/products"
          className="px-6 py-2.5 bg-[#1b2a80] text-white rounded-xl font-medium hover:bg-[#152266] transition-colors shadow-sm text-sm"
        >
          Browse Equipment
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {savedItems.map((item: any) => {
        const product = item.product || item
        const itemMinPrice = product.variants?.length
          ? Math.min(...product.variants.map((v: any) => v.price))
          : 0
        const sum = product.reviews?.reduce((acc: any, review: any) => acc + review.rating, 0) || 0
        const average = product.reviews?.length ? sum / product.reviews.length : 0
        const thumbnail = product.images?.find((img: any) => img.isThumbnail) || product.images?.[0]

        return (
          <div
            key={item.id || product.id}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative flex flex-col overflow-hidden"
          >
            {/* Unsave Button */}
            <div className="absolute top-2 right-2 z-10">
              <IconButton
                onClick={(e) => handleRemoveSaved(e, product.id)}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(4px)",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 1)",
                    color: "#d32f2f",
                  },
                }}
                size="small"
                title="Remove from saved items"
              >
                <BookmarkRemoveIcon sx={{ color: "#1b2a80" }} fontSize="small" />
              </IconButton>
            </div>

            {/* Product Image Link */}
            <Link
              href={`/products/${product.slug || product.id}`}
              className="block relative w-full h-[200px] overflow-hidden rounded-t-xl bg-gray-50"
            >
              {thumbnail ? (
                <Image
                  src={`/uploads/products/${thumbnail.url}`}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                  No Image Available
                </div>
              )}
            </Link>

            {/* Product Details */}
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
                <span className="text-xs text-gray-500">({product.reviews?.length || 0})</span>
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
  )
}
