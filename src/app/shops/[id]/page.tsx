import React from "react"
import { invoke } from "../../blitz-server"
import getShop from "../../queries/getShopById"
import getCurrentUser from "../../users/queries/getCurrentUser"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import { notFound } from "next/navigation"
import { Avatar, Typography, Rating } from "@mui/material"
import StorefrontIcon from "@mui/icons-material/Storefront"
import Image from "next/image"
import Link from "next/link"
import ShopProductsList from "../../components/ShopProductsList"

export default async function ShopPage({ params }: { params: { id: string } }) {
  const shopId = Number(params.id)

  if (isNaN(shopId)) {
    notFound()
  }

  const currentUser = await invoke(getCurrentUser, null)

  let shop: any
  try {
    shop = await invoke(getShop, { id: shopId })
  } catch (error) {
    notFound()
  }

  // Your schema uses shopName natively!
  const shopName = shop?.shopName || shop?.name || "Unknown Shop"
  const rating = (shop as any).rating || 0

  // Safely format the image URL assuming it might just be a filename stored in the DB
  const profileImageSrc = shop?.imageProfile
    ? shop.imageProfile.startsWith("http") || shop.imageProfile.startsWith("/")
      ? shop.imageProfile
      : `/uploads/shop-profile/${shop.imageProfile}`
    : undefined

  // Format the background image URL similarly
  const bgImageSrc = shop?.imageBg
    ? shop.imageBg.startsWith("http") || shop.imageBg.startsWith("/")
      ? shop.imageBg
      : `/uploads/shop-bg/${shop.imageBg}` // Assuming background uploads go here
    : undefined

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-seamless">
      <Navbar currentUser={currentUser} />

      <main className="flex-grow bg-gray-50 py-12 md:py-16">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            {/* Shop Background Section */}
            <div className="w-full h-48 md:h-64 relative bg-gray-200">
              {bgImageSrc ? (
                <Image
                  src={bgImageSrc}
                  alt={`${shopName} background`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#1b2a80] to-blue-400 opacity-80" />
              )}
            </div>

            {/* Shop Profile Logo and Info */}
            <div className="px-8 pb-8 md:px-12 md:pb-12 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-6 md:gap-8 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 flex-1">
                <div className="-mt-16 relative p-1.5 bg-white rounded-full flex-shrink-0">
                  <Avatar
                    src={profileImageSrc}
                    sx={{ width: 120, height: 120, bgcolor: "#1b2a80", shadow: 1 }}
                  >
                    <StorefrontIcon sx={{ fontSize: "4rem" }} />
                  </Avatar>
                </div>

                <div className="mt-2 md:mt-4 flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{shopName}</h1>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 3, maxWidth: "1000px" }}
                  >
                    {shop.description || "This shop has not provided a description yet."}
                  </Typography>
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Rating value={rating} precision={0.1} readOnly />
                    <span className="font-medium text-gray-700">{rating}</span>
                    <span className="text-gray-500 text-sm">(0 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Shop Actions */}
              <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0 mb-2">
                <button className="w-full md:w-auto inline-flex justify-center items-center px-8 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-[#1b2a80] hover:bg-blue-800 shadow-sm transition-colors">
                  Contact Shop
                </button>
              </div>
            </div>
          </div>

          <ShopProductsList products={shop?.products || []} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
