"use client"
import React, { useState, useEffect } from "react"
import Image, { ImageProps } from "next/image"

interface ResponsiveImageProps extends Omit<ImageProps, "src"> {
  src?: string | null
  imageType?: "product" | "shop-profile" | "shop-bg" | "renter-profile" | "default"
  fallbackSrc?: string
}

export default function ResponsiveImage({
  src,
  imageType = "default",
  fallbackSrc,
  alt,
  ...props
}: ResponsiveImageProps) {
  const [imgError, setImgError] = useState(false)

  // Reset error state if the src prop changes dynamically
  useEffect(() => {
    setImgError(false)
  }, [src])

  // Determine prefix and default fallback based on type
  let prefix = ""
  let defaultFallback = "/placeholder.png"

  switch (imageType) {
    case "product":
      prefix = "/uploads/products/"
      break
    case "shop-profile":
      prefix = "/uploads/shop-profile/"
      break
    case "shop-bg":
      prefix = "/uploads/shop-bg/"
      break
    case "renter-profile":
      prefix = "/uploads/renter-profile/"
      defaultFallback = "/uploads/renter-profile/default.png"
      break
  }

  const finalFallback = fallbackSrc || defaultFallback

  // Compute the final URL to display safely
  let finalSrc = encodeURI(finalFallback)
  if (!imgError && src) {
    const normalized = src.replace(/\\/g, "/")
    const isAbsoluteOrRoot = normalized.startsWith("http") || normalized.startsWith("/")
    const combinedUrl = isAbsoluteOrRoot ? normalized : `${prefix}${normalized}`
    finalSrc = encodeURI(combinedUrl)
  }

  return (
    <Image
      src={finalSrc}
      alt={alt || "Image"}
      unoptimized={true}
      onError={() => {
        if (!imgError) setImgError(true)
      }}
      {...props}
    />
  )
}
