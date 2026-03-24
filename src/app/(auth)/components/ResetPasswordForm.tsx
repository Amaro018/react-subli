"use client"
import { LabeledTextField } from "src/app/components/LabeledTextField"
import { Form, FORM_ERROR } from "src/app/components/Form"
import { ResetPassword } from "../validations"
import resetPassword from "../mutations/resetPassword"
import { useMutation } from "@blitzjs/rpc"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@mui/material"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")?.toString()
  const [resetPasswordMutation, { isSuccess }] = useMutation(resetPassword)

  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Header Section */}
      <div className="flex w-full flex-col items-center justify-center gap-1 bg-[#1b2a80] p-3 text-white">
        <h1 className="text-lg font-bold">Set a New Password</h1>
        <p className="text-xs text-gray-200">Enter your new password below</p>
      </div>

      <div className="w-full p-8">
        {isSuccess ? (
          <div className="flex flex-col gap-4 text-center">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
              <h2 className="mb-1 text-sm font-bold">Password Reset Successfully</h2>
              <p className="text-xs">
                Your password has been updated. You can now log in with your new credentials.
              </p>
            </div>
            <Link href="/login" className="w-full">
              <Button
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
                Go to Login
              </Button>
            </Link>
          </div>
        ) : (
          <Form
            schema={ResetPassword}
            initialValues={{
              password: "",
              passwordConfirmation: "",
              token,
            }}
            onSubmit={async (values) => {
              try {
                await resetPasswordMutation({ ...values, token })
              } catch (error: any) {
                if (error.name === "ResetPasswordError") {
                  return {
                    [FORM_ERROR]: error.message,
                  }
                } else {
                  return {
                    [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
                  }
                }
              }
            }}
            className="flex flex-col gap-3"
          >
            <LabeledTextField
              name="password"
              label="New Password"
              type="password"
              placeholder="New Password"
              size="small"
            />
            <LabeledTextField
              name="passwordConfirmation"
              label="Confirm New Password"
              type="password"
              placeholder="Confirm Password"
              size="small"
            />

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
                Reset Password
              </Button>
            </div>
          </Form>
        )}
      </div>
    </div>
  )
}
