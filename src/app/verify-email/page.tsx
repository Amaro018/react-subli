"use client"
import { useMutation } from "@blitzjs/rpc"
import { useState, useEffect } from "react"
import verifyEmail from "./../mutations/verifyEmail"
import { useSearchParams } from "next/navigation"

const VerifyEmailPage = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const searchParams = useSearchParams() // Use useSearchParams to get query parameters
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
        await verifyEmailMutation(token)
        setStatus("success")
      } catch (error) {
        setStatus("error")
      }
    }

    verify()
  }, [searchParams]) // Trigger the effect when search parameters change

  // Render different messages based on the verification status
  if (status === "loading") {
    return <p>Verifying your email...</p>
  }

  if (status === "success") {
    return <h1>Email successfully verified!</h1>
  }

  return <h1>Failed to verify email. Please check the link.</h1>
}

export default VerifyEmailPage
