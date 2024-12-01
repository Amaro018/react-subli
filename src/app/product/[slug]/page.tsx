"use client"
import { invoke, useQuery } from "@blitzjs/rpc"
import getProductById from "../../queries/getProductById" // You'll need a query to fetch product details
import ProductCarousel from "../../components/ProductCarousel"

import GetTheNavBar from "../../components/GetTheNavBar"
import React from "react"

const ProductPage = ({ params }: any) => {
  const { slug } = params
  //   const  id  = params.params.slug;
  const id = slug

  const [product] = useQuery(getProductById, { id: Number(id) })

  const [selectedVariant, setSelectedVariant] = React.useState<number | null>(null)

  const [selectedColor, setSelectedColor] = React.useState<number | null>(null)
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null)

  // Memoize unique colors to prevent unnecessary recalculation
  const uniqueColors = React.useMemo(() => {
    return Array.from(
      new Map(product.variants.map((variant) => [variant.color.id, variant.color])).values()
    )
  }, [product])

  const uniqueSizes = React.useMemo(() => {
    return Array.from(new Set(product.variants.map((variant) => variant.size)))
  }, [product])

  return (
    <>
      <GetTheNavBar />
      <div className="w-full flex flex-row p-24">
        <div className="w-1/2">
          <ProductCarousel product={product} />
        </div>
        <div className="w-1/2 bg-gray-50 p-12">
          <h1 className="text-2xl font-bold capitalize">{product.name}</h1>
          <p>{product.description}</p>
          <div className="flex gap-2 mt-4">
            <div className="flex flex-col">
              <p>Available Colors : </p>
              <div className="flex flex-row gap-2">
                {/* Render unique colors */}
                {uniqueColors.map((color) => (
                  <div key={color.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedColor(color.id)} // Update selected color
                      className={`w-10 h-10 rounded-full border-2 ${
                        selectedColor === color.id ? "border-blue-500" : "border-transparent"
                      } hover:scale-110`}
                      style={{ backgroundColor: color.hexCode }}
                    ></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-2 mt-4">
            {/* Render unique sizes */}
            {uniqueSizes.map((size) => {
              // Check if the size is valid for the selected color
              const isDisabled =
                selectedColor &&
                !product.variants.some(
                  (variant) => variant.colorId === selectedColor && variant.size === size
                )

              return (
                <div key={size}>
                  <button
                    type="button"
                    onClick={() => setSelectedSize(size)} // Update selected size
                    className={`border-2 ${
                      selectedSize === size ? "border-blue-500" : "border-transparent"
                    } hover:scale-110 w-10 h-10 bg-slate-400 rounded-full text-white ${
                      isDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isDisabled} // Disable button if size is not valid for the selected color
                  >
                    {size}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
export default ProductPage
