"use client" // Error components must be Client Components

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong!</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        {error.message || "An unexpected error occurred while loading the admin dashboard."}
      </p>
      <button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        className="px-4 py-2 bg-[#1b2a80] text-white rounded-md hover:bg-[#111b52] transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
