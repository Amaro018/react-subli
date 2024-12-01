import Image from "next/image"
import { useState, useEffect } from "react"

const ProductCarousel = ({ product }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
    }, 3000)

    return () => clearInterval(intervalId)
  }, [product.images.length])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative  mx-auto">
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {product.images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0 flex justify-center items-center">
              <Image
                src={`/uploads/products/${image.url}`}
                alt={image.name}
                width={400}
                height={400}
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrev}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-600"
      >
        &larr;
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white p-3 rounded-full hover:bg-gray-600"
      >
        &rarr;
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {product.images.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full ${
              currentIndex === index ? "bg-gray-800" : "bg-gray-400"
            }`}
            onClick={() => setCurrentIndex(index)}
          ></button>
        ))}
      </div>
    </div>
  )
}

export default ProductCarousel
