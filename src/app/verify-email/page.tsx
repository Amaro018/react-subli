"use client"
import { useMutation } from "@blitzjs/rpc"
import { useState, useEffect } from "react"
import verifyEmail from "./../mutations/verifyEmail"
import { useSearchParams, useRouter } from "next/navigation"
import { Box, CircularProgress } from "@mui/material"

const VerifyEmailPage = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [countdown, setCountdown] = useState(5)
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verifyEmailMutation] = useMutation(verifyEmail)

  useEffect(() => {
    const verify = async () => {
      // Get the `token` from the query parameters
      const token = searchParams.get("token")

      if (!token) {
        setStatus("error")
        return
      }

      try {
        // Call the mutation to verify the email with the token
        await verifyEmailMutation(token as string)
        setStatus("success")
      } catch (error) {
        setStatus("error")
      }
    }

    verify()
  }, [searchParams]) // Trigger the effect when search parameters change

  useEffect(() => {
    let interval: NodeJS.Timeout

    // Start countdown if the status is "success"
    if (status === "success") {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval) // Clear interval when countdown ends
            router.push("/") // Redirect to homepage
            return 0
          }
          return prev - 1 // Decrease countdown by 1
        })
      }, 1000) // Update every second
    }

    return () => clearInterval(interval) // Cleanup on component unmount
  }, [status, router])

  // Render different messages based on the verification status
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
        <h1>🎉 Email Verified Successfully!</h1>
        <p>
          Thank you for verifying your email. Redirecting to the homepage in {countdown} seconds...
        </p>
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
    </div>
  )
}

export default VerifyEmailPage
