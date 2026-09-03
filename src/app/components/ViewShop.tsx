"use client"
import React, { useState } from "react"
import { useQuery } from "@blitzjs/rpc"
import getShopById from "../queries/getShopById"
import ResponsiveImage from "./ResponsiveImage"
import ShopProductsList from "./ShopProductsList"
import { Rating, Tooltip } from "@mui/material"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined"
import CallOutlinedIcon from "@mui/icons-material/CallOutlined"
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined"
import ReportShopModal from "./ReportShopModal"
import { useCurrentUser } from "../users/hooks/useCurrentUser"
import ShopSuspendedPage from "./ShopSuspendedPage"

export default function ViewShop({ shopId }: { shopId: number }) {
  const [shop] = useQuery(getShopById, { id: shopId })
  const currentUser = useCurrentUser()
  const [reportModalOpen, setReportModalOpen] = useState(false)

  if (!shop) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center bg-white rounded-2xl shadow-sm border border-gray-100 px-4 h-full min-h-[400px]">
        <p className="text-gray-500 font-medium">Loading shop details...</p>
      </div>
    )
  }

  if (shop.status === "banned") {
    return <ShopSuspendedPage shopName={shop.shopName} reason={shop.banReason} />
  }

  const allReviews = shop.products?.flatMap((p: any) => p.reviews || []) || []
  const sumRating = allReviews.reduce((acc: number, review: any) => acc + (review.rating || 0), 0)
  const averageRating = allReviews.length > 0 ? sumRating / allReviews.length : 0

  return (
    <>
      {/* Shop Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {/* Shop Background Banner */}
        <div className="relative w-full h-48 sm:h-64 bg-gray-200">
          {shop.imageBg ? (
            <ResponsiveImage
              src={shop.imageBg}
              imageType="shop-bg"
              alt="Shop Background"
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-[#1b2a80] to-blue-500 opacity-80" />
          )}
        </div>

        {/* Shop Details */}
        <div className="px-6 pb-6 sm:px-8 sm:pb-8 relative flex flex-col sm:flex-row gap-6 sm:gap-8">
          <div className="relative -mt-16 w-32 h-32 flex-shrink-0 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 mx-auto sm:mx-0 z-10">
            <ResponsiveImage
              src={shop.imageProfile}
              imageType="shop-profile"
              alt={shop.shopName || "Shop Profile"}
              fill
              sizes="128px"
              className="object-cover"
            />
          </div>
          <div className="text-center sm:text-left flex flex-col flex-grow pt-2 sm:pt-4">
            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2 justify-center sm:justify-start">
                <h1 className="text-3xl font-bold text-gray-900 capitalize">{shop.shopName}</h1>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Rating value={averageRating} precision={0.25} size="small" readOnly />
                  <span className="text-sm font-bold text-gray-700">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({allReviews.length} {allReviews.length === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center sm:justify-start text-gray-500 font-medium text-sm mb-6">
                <LocationOnIcon fontSize="small" className="mr-1 text-[#1b2a80] shrink-0" />
                <span
                  className="truncate max-w-[250px] sm:max-w-none"
                  title={[
                    shop.street,
                    shop.barangay,
                    shop.city,
                    shop.province,
                    shop.country,
                    shop.zipCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                >
                  {[shop.city, shop.province].filter(Boolean).join(", ")}
                </span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {shop.description ? (
                <div className="flex-1">
                  <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line text-center sm:text-left">
                    {shop.description}
                  </p>
                </div>
              ) : (
                <div className="flex-1" />
              )}
              <div className="flex flex-row gap-3 items-center justify-center md:justify-end shrink-0 md:pt-1">
                {(shop.contact || shop.email) && (
                  <a
                    href={shop.contact ? `tel:${shop.contact}` : `mailto:${shop.email}`}
                    className="p-3 bg-white border-2 border-[#1877F2] text-[#1877F2] hover:bg-blue-50 rounded-full transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                    title="Contact Shop"
                  >
                    <CallOutlinedIcon fontSize="small" />
                  </a>
                )}
                {shop.linkFacebook ? (
                  <a
                    href={shop.linkFacebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-white border-2 border-[#1877F2] text-[#1877F2] hover:bg-blue-50 rounded-full transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center"
                    title="Visit Facebook"
                  >
                    <FacebookOutlinedIcon fontSize="small" />
                  </a>
                ) : (
                  <Tooltip title="No Facebook page available" arrow>
                    <span className="p-3 bg-white border-2 border-[#1877F2] text-[#1877F2] rounded-full shadow-sm flex items-center justify-center opacity-50 cursor-not-allowed">
                      <FacebookOutlinedIcon fontSize="small" />
                    </span>
                  </Tooltip>
                )}
                {currentUser && currentUser.id !== shop.userId && (
                  <a
                    onClick={() => setReportModalOpen(true)}
                    className="p-3 bg-white border-2 border-red-500 text-red-500 hover:bg-red-50 rounded-full transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center cursor-pointer"
                    title="Report Shop"
                  >
                    <FlagOutlinedIcon fontSize="small" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Products Section */}
      <ShopProductsList products={shop.products || []} />

      <ReportShopModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        shopId={shop.id}
        shopName={shop.shopName}
      />
    </>
  )
}
