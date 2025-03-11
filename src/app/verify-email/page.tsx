"use client"
import { useMutation } from "@blitzjs/rpc"
import { useState, useEffect } from "react"
import verifyEmail from "./../mutations/verifyEmail"
import { useSearchParams, useRouter } from "next/navigation"
import { Box, CircularProgress } from "@mui/material"
import Link from "next/link"
import resendVerification from "../mutations/resendVerification"
import Confetti from "react-confetti"

const VerifyEmailPage = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [countdown, setCountdown] = useState(30)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifyEmailMutation] = useMutation(verifyEmail)
  const [resendVerificationMutation] = useMutation(resendVerification)

  const handleResendVerification = async () => {
    console.log("resend")
    try {
      await resendVerificationMutation()
    } catch (error) {
      console.error("Error resending verification email:", error)
    }
  }

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get("token")

      if (!token) {
        setStatus("error")
        return
      }

      try {
        await verifyEmailMutation(token as string)
        setStatus("success")
      } catch (error) {
        setStatus("error")
      }
    }

    verify()
  }, [searchParams, verifyEmailMutation]) // Now `verifyEmailMutation` is properly included

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (status === "success") {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            router.push("/")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [status, router])

  if (status === "loading") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={100} />
      </Box>
    )
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <Confetti />
        <h1>🎉 Email Verified Successfully!</h1>
        <p>
          Thank you for verifying your email. Redirecting to the homepage in {countdown} seconds...
        </p>
        <Link href="/">or click here to go to the homepage</Link>
      </div>
    )
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>⚠️ Email Verification Failed</h1>
      <p>
        The verification link is invalid or has expired. Please try signing up again or contact
        support.
      </p>
      <button onClick={handleResendVerification}>Resend</button>
    </div>
  )
}

export default VerifyEmailPage
