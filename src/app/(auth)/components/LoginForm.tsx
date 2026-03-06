"use client"
import { AuthenticationError, PromiseReturnType } from "blitz"
import Link from "next/link"
import { LabeledTextField } from "src/app/components/LabeledTextField"
import { Form, FORM_ERROR } from "src/app/components/Form"
import login from "../mutations/login"
import { Login } from "../validations"
import { useMutation } from "@blitzjs/rpc"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import type { Route } from "next"
import { Button } from "@mui/material"

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  const router = useRouter()
  const next = useSearchParams()?.get("next")

  return (
    // Changed max-w-sm to max-w-md for better width, kept vertical compactness
    <div className="flex w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-lg bg-white shadow-xl">
      {/* Compact Header Section */}
      <div className="flex w-full flex-col items-center justify-center gap-1 bg-[#1b2a80] p-3 text-white">
        <h1 className="text-lg font-bold">Welcome Back</h1>
        <p className="text-xs text-gray-200">Sign in to continue to Subli</p>
      </div>

      <div className="w-full p-8">
        <Form
          id="login-form"
          schema={Login}
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values) => {
            try {
              const user = await loginMutation(values)
              router.refresh()
              if (user.role === "ADMIN") {
                router.push("/admin")
              } else if (next) {
                router.push(next as Route)
              } else {
                router.push("/")
              }
            } catch (error: any) {
              // Provide more specific, user-friendly messages depending on server error
              if (error instanceof AuthenticationError) {
                const msg = (error.message || "").toLowerCase()

                if (
                  msg.includes("email_not_found") ||
                  msg.includes("email") ||
                  msg.includes("not found")
                ) {
                  return {
                    [FORM_ERROR]:
                      "No account found for that email address. Please check the email or create an account.",
                  }
                } else if (msg.includes("invalid_password") || msg.includes("password")) {
                  return {
                    [FORM_ERROR]:
                      'Incorrect password. If you forgot it, use the "Forgot password?" link to reset it.',
                  }
                }

                // Fallback for authentication errors where the server couldn't be specific
                return { [FORM_ERROR]: "Invalid email or password." }
              } else {
                return {
                  [FORM_ERROR]:
                    "Sorry, we had an unexpected error. Please try again. - " + error?.toString?.(),
                }
              }
            }
          }}
          className="flex flex-col gap-3"
        >
          {/* size="small" keeps the inputs short in height */}
          <LabeledTextField name="email" label="Email" placeholder="Email" size="small" />
          <LabeledTextField
            name="password"
            label="Password"
            placeholder="Password"
            type="password"
            size="small"
          />

          <div className="-mt-1 flex justify-end">
            <Link
              href={"/forgot-password"}
              className="text-xs font-semibold text-[#1b2a80] hover:text-blue-800"
            >
              Forgot password?
            </Link>
          </div>

          <div className="mt-1 flex flex-col gap-2">
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="small" // MUI small button
              sx={{
                backgroundColor: "#1b2a80",
                "&:hover": { backgroundColor: "#152266" },
                fontWeight: "bold",
                textTransform: "none",
              }}
            >
              Login
            </Button>

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-3 flex-shrink-0 text-xs text-gray-400">Or</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <Link href="/signup" className="w-full">
              <Button
                variant="outlined"
                fullWidth
                size="small" // MUI small button
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
                Create Account
              </Button>
            </Link>
          </div>
        </Form>
      </div>
    </div>
  )
}
