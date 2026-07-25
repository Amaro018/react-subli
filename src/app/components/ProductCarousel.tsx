import Image from "next/image"
import { useState, useEffect, useMemo, useRef } from "react"

interface ProductImage {
  id: number
  url: string
  isThumbnail?: boolean
  attributeValueId?: number | null
}

interface ProductCarouselProps {
  product: {
    images: ProductImage[]
  }
  selectedColor?: number | null
  selectedVariant?: any | null
}

const ProductCarousel = ({ product, selectedColor, selectedVariant }: ProductCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const thumbnailContainerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({ isDown: false, startX: 0, scrollLeft: 0, isDragging: false })

  // Filter images based on selected variant/color, then ensure thumbnail is first
  const displayImages = useMemo(() => {
    let filtered = [...product.images]

    if (selectedVariant?.attributes) {
      const attrIds = selectedVariant.attributes.map(
        (a: any) => a.attributeValueId || a.attributeValue?.id
      )
      const variantImages = filtered.filter(
        (img) => img.attributeValueId && attrIds.includes(img.attributeValueId)
      )
      if (variantImages.length > 0) {
        filtered = filtered.filter(
          (img) => !img.attributeValueId || attrIds.includes(img.attributeValueId)
        )
      }
    } else if (selectedColor) {
      const colorImages = filtered.filter((img) => img.attributeValueId === selectedColor)
      if (colorImages.length > 0) {
        filtered = filtered.filter(
          (img) => !img.attributeValueId || img.attributeValueId === selectedColor
        )
      }
    }

    return filtered.sort((a, b) => {
      if (a.isThumbnail && !b.isThumbnail) return -1
      if (!a.isThumbnail && b.isThumbnail) return 1
      return 0
    })
  }, [product.images, selectedVariant, selectedColor])

  useEffect(() => {
    setCurrentIndex(0)
  }, [displayImages])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1))
  }

  // Prevent out of bounds index during render before useEffect fires
  const safeIndex = Math.max(0, Math.min(currentIndex, displayImages.length - 1))

  // Auto-scroll thumbnail into view when the current index changes
  useEffect(() => {
    if (thumbnailContainerRef.current) {
      const activeThumb = thumbnailContainerRef.current.children[safeIndex] as HTMLElement
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        })
      }
    }
  }, [safeIndex])

  // Enable vertical mouse wheel horizontal scrolling
  useEffect(() => {
    const container = thumbnailContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault()
        container.scrollLeft += e.deltaY
      }
    }

    container.addEventListener("wheel", handleWheel, { passive: false })
    return () => container.removeEventListener("wheel", handleWheel)
  }, [displayImages.length])

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = thumbnailContainerRef.current
    if (!container) return
    dragState.current.isDown = true
    dragState.current.isDragging = false
    dragState.current.startX = e.pageX - container.offsetLeft
    dragState.current.scrollLeft = container.scrollLeft
  }

  const handleMouseLeave = () => {
    dragState.current.isDown = false
  }

  const handleMouseUp = () => {
    dragState.current.isDown = false
    setTimeout(() => {
      dragState.current.isDragging = false
    }, 50)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragState.current.isDown) return
    e.preventDefault()
    dragState.current.isDragging = true
    const container = thumbnailContainerRef.current
    if (!container) return
    const x = e.pageX - container.offsetLeft
    const walk = (x - dragState.current.startX) * 1.5
    container.scrollLeft = dragState.current.scrollLeft - walk
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-[600px] mx-auto">
      {/* Main Image */}
      <div className="relative w-full aspect-[4/3] group bg-gray-50 overflow-hidden rounded-2xl border border-gray-100">
        <div className="relative w-full h-full">
          {displayImages.map((image: ProductImage, index: number) => (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full flex justify-center items-center transition-opacity duration-500 ease-in-out ${
                safeIndex === index ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={`/uploads/products/${image.url}`}
                alt={`Product Image ${image.id || index}`}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-contain group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          ))}
        </div>

        {/* Navigation Buttons - Show on Hover */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 backdrop-blur-md text-[#1b2a80] p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 z-10"
              aria-label="Previous Image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 backdrop-blur-md text-[#1b2a80] p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 z-10"
              aria-label="Next Image"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Carousel */}
      {displayImages.length > 1 && (
        <div
          ref={thumbnailContainerRef}
          className="flex gap-3 overflow-x-auto py-2 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] w-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {displayImages.map((image: ProductImage, index: number) => (
            <button
              key={index}
              onClick={(e) => {
                if (dragState.current.isDragging) {
                  e.preventDefault()
                  e.stopPropagation()
                  return
                }
                setCurrentIndex(index)
              }}
              className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-200 select-none ${
                safeIndex === index
                  ? "border-[#1b2a80] opacity-100 shadow-md scale-105"
                  : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"
              }`}
              aria-label={`View Image ${index + 1}`}
            >
              <Image
                src={`/uploads/products/${image.url}`}
                alt={`Thumbnail ${image.id || index}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductCarousel
