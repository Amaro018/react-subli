"use client"
import { LabeledTextField } from "src/app/components/LabeledTextField"
import { Form, FORM_ERROR } from "src/app/components/Form"
import { ForgotPassword } from "../validations"
import forgotPassword from "../mutations/forgotPassword"
import checkEmail from "src/app/mutations/checkEmail" // Import the checkEmail mutation
import { useMutation } from "@blitzjs/rpc"
import { Button } from "@mui/material"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword)
  const [checkEmailMutation] = useMutation(checkEmail) // Initialize the mutation

  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-lg bg-white shadow-xl">
      {/* Compact Header Section matching Login */}
      <div className="flex w-full flex-col items-center justify-center gap-1 bg-[#1b2a80] p-3 text-white">
        <h1 className="text-lg font-bold">Forgot Password?</h1>
        <p className="text-xs text-gray-200">Enter your email to reset your password</p>
      </div>

      <div className="w-full p-8">
        {isSuccess ? (
          <div className="flex flex-col gap-4 text-center">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
              <h2 className="mb-1 text-sm font-bold">Reset Email Sent</h2>
              <p className="text-xs">
                We sent password reset instructions to the email address you provided. Check your
                inbox (and spam) and follow the link to reset your password. If you don’t receive an
                email within a few minutes, contact support or try again.
              </p>
            </div>
            <Link href="/login" className="w-full">
              <Button
                variant="outlined"
                fullWidth
                size="small"
                sx={{
                  color: "#1b2a80",
                  borderColor: "#1b2a80",
                  "&:hover": {
                    borderColor: "#152266",
                    backgroundColor: "rgba(27, 42, 128, 0.04)",
                  },
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                Back to Login
              </Button>
            </Link>
          </div>
        ) : (
          <Form
            schema={ForgotPassword}
            initialValues={{ email: "" }}
            onSubmit={async (values) => {
              try {
                // 1. Check if the email exists in the system
                const { success } = await checkEmailMutation(values)

                // 2. checkEmail returns success: true if the email is AVAILABLE (i.e. User NOT found)
                // For forgot password, we want the user to EXIST.
                if (success) {
                  return { [FORM_ERROR]: "Sorry, this email is not registered in our system." }
                }

                // 3. If email exists (success: false), proceed to send reset email
                await forgotPasswordMutation(values)
              } catch (error: any) {
                return {
                  [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
                }
              }
            }}
            className="flex flex-col gap-3"
          >
            <LabeledTextField name="email" label="Email" placeholder="Email" size="small" />

            <div className="mt-2 flex flex-col gap-2">
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="small"
                sx={{
                  backgroundColor: "#1b2a80",
                  "&:hover": { backgroundColor: "#152266" },
                  fontWeight: "bold",
                  textTransform: "none",
                }}
              >
                Request Reset
              </Button>

              <Link href="/login" className="w-full">
                <Button
                  variant="text"
                  fullWidth
                  size="small"
                  sx={{
                    color: "#6b7280",
                    "&:hover": { backgroundColor: "#f3f4f6" },
                    textTransform: "none",
                    fontSize: "0.75rem",
                  }}
                >
                  Back to Login
                </Button>
              </Link>
            </div>
          </Form>
        )}
      </div>
    </div>
  )
}
