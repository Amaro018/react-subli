"use client"

import RefreshIcon from "@mui/icons-material/Refresh"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import resendVerification from "../../mutations/resendVerification"
import { useMutation } from "@blitzjs/rpc"

export default function ErrorMessage({
  message,
  title,
  currentUser,
}: {
  message: string
  title: string
  currentUser: any
}) {
  const [resendVerificationMutation] = useMutation(resendVerification)
  const router = useRouter()
  const user = currentUser
  const [lastSentTime, setLastSentTime] = useState<number | null>(null)
  const [countdown, setCountdown] = useState<number>(0) // Track the countdown timer
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (lastSentTime) {
      const interval = setInterval(() => {
        const currentTime = new Date().getTime()
        const timeRemaining = Math.max(0, (lastSentTime + 5 * 60 * 1000 - currentTime) / 1000) // Time left in seconds
        setCountdown(Math.floor(timeRemaining))

        if (timeRemaining <= 0) {
          clearInterval(interval) // Stop the countdown when it reaches 0
        }
      }, 1000)

      return () => clearInterval(interval) // Clean up the interval when component unmounts
    }
  }, [lastSentTime])

  const handleResendVerification = async () => {
    if (isResending) return // Prevent multiple submissions during the process

    const currentTime = new Date().getTime()
    if (lastSentTime && currentTime - lastSentTime < 5 * 60 * 1000) {
      // If the last send was within the last 5 minutes, show the countdown
      return
    }

    setIsResending(true)
    try {
      await resendVerificationMutation({ email: user?.email })
      setLastSentTime(currentTime) // Update last sent time to current time
      setCountdown(5 * 60) // Start the countdown from 5 minutes (300 seconds)
    } catch (error) {
      console.error("Error sending verification email:", error)
    } finally {
      setIsResending(false)
    }
  }

  const formatCountdown = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-gray-600 mt-2">{message}</p>

        {user.tokens?.length ? (
          <button
            className="text-blue-500 hover:underline"
            onClick={handleResendVerification}
            disabled={isResending || (lastSentTime && countdown > 0)} // Disable button during resend and while countdown is active
          >
            {isResending
              ? "Resending..."
              : countdown > 0
              ? `Please Wait ${formatCountdown(countdown)} for another verification `
              : "Resend the verification email"}
          </button>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleResendVerification}
            disabled={isResending || (lastSentTime && countdown > 0)} // Disable button during resend and while countdown is active
          >
            {isResending
              ? "Resending..."
              : countdown > 0
              ? `Wait ${formatCountdown(countdown)} to resend`
              : "Resend verification email"}
          </button>
        )}
      </div>
    </div>
  )
}
