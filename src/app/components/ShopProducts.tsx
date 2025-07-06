// app/products/components/ShopProducts.tsx

import { useQuery } from "@blitzjs/rpc"
import getProductByShopId from "../queries/getProductByShopId"
import Image from "next/image"
import Link from "next/link"

export default function ShopProducts({ shop }: { shop: { id: number } }) {
  const [products, { isLoading, error }] = useQuery(getProductByShopId, {
    shopId: shop.id,
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error ka pri</div>

  return (
    <div>
      <div className="flex flex-wrap">
        {products.map((product) => (
          <Link href={`/product/${product.id}`} key={product.id}>
            <div className="w-64 h-80 bg-white rounded shadow-lg flex flex-col items-center overflow-hidden py-2">
              {/* Image Section */}
              <div className="w-full h-2/3 flex items-center justify-center bg-gray-100">
                <Image
                  src={`/uploads/products/${product.images[0]?.url}`}
                  alt={product.name}
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>

              {/* Text Section */}
              <div className="w-full h-1/3 px-4 py-2 flex flex-col justify-center items-center">
                <h2
                  className="font-bold text-xl text-center text-black truncate max-w-[200px]"
                  title={product.name}
                >
                  {product.name}
                </h2>
                <p className="text-gray-600 text-sm text-center mt-1">{product.category.name}</p>

                {product.variants.length > 0 ? (
                  product.variants.length === 1 ? (
                    // Show a single variant price if there's only one
                    <p className="text-gray-600 text-sm text-center mt-1">
                      ₱{product.variants[0].price}
                    </p>
                  ) : (
                    // Show price range for multiple variants
                    <p className="text-gray-600 text-sm text-center mt-1">
                      ₱{Math.min(...product.variants.map((variant) => variant.price))} - ₱
                      {Math.max(...product.variants.map((variant) => variant.price))}
                    </p>
                  )
                ) : (
                  // Handle case where no variants exist
                  <p className="text-gray-600 text-sm text-center mt-1">No variants available</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
