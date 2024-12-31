"use client"

import RefreshIcon from "@mui/icons-material/Refresh"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function ErrorMessage({ message, title }: { message: string; title: string }) {
  const rourter = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      rourter.push("/")
    }, 3000)

    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-gray-600 mt-2">{message}</p>
        <p className="text-gray-600 mt-2">
          Redirecting to Home page... <RefreshIcon fontSize="medium" className="animate-spin" />
        </p>
      </div>
    </div>
  )
}
