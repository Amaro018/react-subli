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

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)
  const router = useRouter()
  const next = useSearchParams()?.get("next")

  return (
    <>
      <Form
        id="login-form"
        schema={Login}
        initialValues={{ email: "", password: "" }}
        onSubmit={async (values) => {
          try {
            const user = await loginMutation(values)
            console.log("values", values)
            router.refresh()
            if (user.role === "ADMIN") {
              router.push("/admin")
            } else if (next) {
              router.push(next as Route)
            } else {
              router.push("/")
            }
          } catch (error: any) {
            if (error instanceof AuthenticationError) {
              return { [FORM_ERROR]: "Sorry, those credentials are invalid" }
            } else {
              return {
                [FORM_ERROR]:
                  "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
              }
            }
          }
        }}
        className="flex flex-col gap-4 w-1/4 border p-4 shadow-md rounded-lg"
      >
        <LabeledTextField name="email" label="Email" placeholder="Email" />
        <LabeledTextField name="password" label="Password" placeholder="Password" type="password" />
        <div>
          <Link href={"/forgot-password"}>Forgot your password?</Link>
        </div>

        {/* Submit button inside the Form */}
        <div className="flex flex-row gap-4 w-full">
          <button
            type="submit"
            className="bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full"
          >
            Login
          </button>
          <Link href="/signup" className="w-full">
            <button className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 w-full">
              Sign Up
            </button>
          </Link>
        </div>
      </Form>
    </>
  )
}
