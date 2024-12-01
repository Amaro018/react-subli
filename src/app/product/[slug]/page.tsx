"use client"
import { invoke, useQuery } from "@blitzjs/rpc"
import getProductById from "../../queries/getProductById" // You'll need a query to fetch product details
import ProductCarousel from "../../components/ProductCarousel"
import Navbar from "../../components/Navbar"
import getCurrentUser from "../../users/queries/getCurrentUser"
import GetTheNavBar from "../../components/GetTheNavBar"
import React from "react"

const ProductPage = ({ params }: any) => {
  const { slug } = params
  //   const  id  = params.params.slug;
  const id = slug

  const [product] = useQuery(getProductById, { id: Number(id) })

  const [selectedVariant, setSelectedVariant] = React.useState<number | null>(null)

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

          {/* Render unique colors */}
          <div className="flex gap-2 mt-4">
            {uniqueColors.map((color) => (
              <div key={color.id}>
                <button
                  type="button"
                  onClick={() => setSelectedVariant(color.id)}
                  className={`w-10 h-10 rounded-full border-2 ${
                    selectedVariant === color.id ? "border-blue-500" : "border-transparent"
                  } hover:scale-110`}
                  style={{ backgroundColor: color.hexCode }}
                ></button>
              </div>
            ))}
          </div>
          <div>
            {uniqueSizes.map((size) => (
              <div key={size}>
                <button
                  type="button"
                  onClick={() => setSelectedVariant(size)}
                  className={`border-2 ${
                    selectedVariant === size ? "border-blue-500" : "border-transparent"
                  } hover:scale-110`}
                >
                  {size}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
export default ProductPage
