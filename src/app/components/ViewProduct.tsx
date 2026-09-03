"use client"
import { useQuery } from "@blitzjs/rpc"
import getProductById from "../queries/getProductById"
import ProductCarousel from "./ProductCarousel"
import React from "react"
import Link from "next/link"
import { Rating } from "@mui/material"
import ProductBreadcrumbs from "./ProductBreadcrumbs"
import ProductDescription from "./ProductDescription"
import ProductReviews from "./ProductReviews"
import ProductDamagePolicies from "./ProductDamagePolicies"
import ProductBookingForm from "./ProductBookingForm"
import ReportProductModal from "./ReportProductModal"
import FlagIcon from "@mui/icons-material/Flag"

export default function ViewProduct({
  productId,
  currentUser,
}: {
  productId: string
  currentUser: any
}) {
  const [productData, { refetch }] = useQuery(getProductById, { id: Number(productId) })
  const product: any = productData

  const [selectedVariant, setSelectedVariant] = React.useState<any | null>(null)
  const [selectedColor, setSelectedColor] = React.useState<number | null>(null)
  const [reportModalOpen, setReportModalOpen] = React.useState(false)

  const sum = product.reviews?.reduce((acc: any, review: any) => acc + review.rating, 0)
  const average = sum / product.reviews?.length

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-12 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        {/* Breadcrumbs */}
        <ProductBreadcrumbs categoryName={product?.category?.name} productName={product?.name} />

        {/* Product Top Section */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
          {/* Left: Image Carousel */}
          <div className="w-full lg:w-1/2">
            <div className="lg:sticky top-8 z-10">
              <ProductCarousel
                product={product}
                selectedColor={selectedColor}
                selectedVariant={selectedVariant}
              />
            </div>
          </div>

          {/* Right: Details */}
          <div className="w-full lg:w-1/2 flex flex-col gap-8">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link href={`/shops/${product.shop.id}`}>
                  <h2 className="text-[#1b2a80] hover:text-blue-800 font-semibold uppercase tracking-wider text-sm transition-colors">
                    {product.shop.shopName}
                  </h2>
                </Link>
                <span className="text-gray-300 text-sm">•</span>
                <span className="text-gray-500 font-medium tracking-wider text-sm uppercase">
                  {product.category?.name || "Uncategorized"}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 capitalize">{product.name}</h1>
                  <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#1b2a80] bg-[#1b2a80]/10 rounded-full whitespace-nowrap">
                    {selectedVariant
                      ? selectedVariant.condition
                      : product?.variants?.[0]?.condition || "New"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Rating
                    name="review"
                    value={isNaN(average) || !average ? 0 : average}
                    precision={0.25}
                    readOnly
                    size="small"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    {(isNaN(average) || !average ? 0 : average).toFixed(1)}
                  </span>
                  <a
                    href="#reviews-section"
                    className="text-sm text-gray-500 hover:text-[#1b2a80] underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    ({product.reviews?.length || 0}{" "}
                    {product.reviews?.length === 1 ? "review" : "reviews"})
                  </a>
                  {currentUser && (
                    <>
                      <span className="text-gray-300 text-sm">•</span>
                      <button
                        onClick={() => setReportModalOpen(true)}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 font-semibold transition-colors"
                      >
                        <FlagIcon sx={{ fontSize: 16 }} />
                        Report
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <ProductBookingForm
              product={product}
              currentUser={currentUser}
              refetch={refetch}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              selectedVariant={selectedVariant}
              setSelectedVariant={setSelectedVariant}
            />
          </div>
        </div>
      </div>

      {/* Description Section */}
      <ProductDescription description={product.description} />

      {/* Damage Policies Section */}
      <ProductDamagePolicies policies={product.damagepolicies} />

      {/* Reviews Section */}
      <ProductReviews reviews={product.reviews} />

      <ReportProductModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        productId={product.id}
        productName={product.name}
      />
    </div>
  )
}
