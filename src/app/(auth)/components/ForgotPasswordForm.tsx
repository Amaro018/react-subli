"use client"
import { LabeledTextField } from "src/app/components/LabeledTextField"
import { Form, FORM_ERROR } from "src/app/components/Form"
import { ForgotPassword } from "../validations"
import forgotPassword from "../mutations/forgotPassword"
import { useMutation } from "@blitzjs/rpc"
import Navbar from "../../components/Navbar"

export function ForgotPasswordForm() {
  const [forgotPasswordMutation, { isSuccess }] = useMutation(forgotPassword)

  return (
    <>
      <Navbar currentUser={null} />
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col gap-4 w-1/4 border p-4 shadow-md rounded-lg">
          <h1>Forgot your password?</h1>
          <>
            {isSuccess ? (
              <div>
                <h2>Request Submitted</h2>
                <p>
                  If your email is in our system, you will receive instructions to reset your
                  password shortly.
                </p>
              </div>
            ) : (
              <Form
                schema={ForgotPassword}
                initialValues={{ email: "" }}
                onSubmit={async (values) => {
                  try {
                    await forgotPasswordMutation(values)
                  } catch (error: any) {
                    return {
                      [FORM_ERROR]: "Sorry, we had an unexpected error. Please try again.",
                    }
                  }
                }}
              >
                <LabeledTextField name="email" label="Email" placeholder="Email" />
                <button
                  type="submit"
                  className="bg-slate-500 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded"
                >
                  Request Reset
                </button>
              </Form>
            )}
          </>
        </div>
      </div>
    </>
  )
}
