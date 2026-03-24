"use client"
import React, { useState } from "react"
import { LabeledTextField } from "src/app/components/LabeledTextField"
import { Form, FORM_ERROR } from "src/app/components/Form"
import signup from "../mutations/signup"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  Paper,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material"
import { Signup } from "../validations"
import checkEmail from "../../mutations/checkEmail"
import { toast } from "sonner"
import Link from "next/link"
import { useFormikContext } from "formik"
import { z } from "zod"
import getBarangay from "../../queries/getBarangays"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [signupMutation] = useMutation(signup)
  const router = useRouter()

  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="flex w-full flex-col items-center justify-center gap-1 bg-[#1b2a80] p-3 text-white">
        <h1 className="text-lg font-bold">Create Account</h1>
        <p className="text-xs text-gray-200">Join Subli today</p>
      </div>

      <div className="w-full p-6">
        <Form
          schema={Signup}
          initialValues={{
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            middleName: "",
            phoneNumber: "",
            birthDate: "",
            street: "",
            barangay: "",
            city: "Legazpi City",
            zipCode: "4500",
            province: "Albay",
            country: "Philippines",
          }}
          onSubmit={async (values) => {
            try {
              // Ensure birthDate is a Date object if it comes as a string
              const birthDate = new Date(values.birthDate)
              await signupMutation({ ...values, birthDate })
              toast.success("Account created successfully!")
              props.onSuccess?.()
              router.push("/")
            } catch (error: any) {
              if (error.code === "P2002" && error.meta?.target?.includes("email")) {
                return { email: "This email is already being used" }
              } else {
                return { [FORM_ERROR]: error.message || "An unexpected error occurred" }
              }
            }
          }}
          className="w-full"
        >
          <SignupFormContent />
        </Form>

        <div className="mt-4 flex justify-center border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#1b2a80] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const SignupFormContent = () => {
  const [activeStep, setActiveStep] = useState(0)
  const { values, errors, touched, setFieldTouched, validateForm, setFieldError, setFieldValue } =
    useFormikContext<any>()
  const [checkEmailMutation] = useMutation(checkEmail)
  const [emailSuccessMsg, setEmailSuccessMsg] = useState("")
  const [barangays] = useQuery(getBarangay, null)

  const handleNext = async () => {
    if (activeStep === 0) {
      // Mark fields as touched to trigger validation display
      setFieldTouched("email", true, true)
      setFieldTouched("password", true, true)

      // Wait for validation to sync and check for errors
      const formErrors = await validateForm()

      if (formErrors.email || formErrors.password) {
        toast.error("Please fix the errors before proceeding")
        return
      }

      // Check email availability
      try {
        const response = await checkEmailMutation({ email: values.email })
        if (!response.success) {
          setFieldError("email", response.message)
          toast.error(response.message)
          return
        }
        setEmailSuccessMsg(response.message)
      } catch (error) {
        console.error("Email check failed", error)
        return
      }

      setActiveStep(1)
    } else if (activeStep === 1) {
      const step1Fields = [
        "firstName",
        "lastName",
        "phoneNumber",
        "birthDate",
        "street",
        "barangay",
        "city",
        "zipCode",
      ]

      // Touch all fields in this step
      step1Fields.forEach((field) => setFieldTouched(field, true, true))

      const formErrors = await validateForm()
      // Check if any of the required fields in step 1 have errors
      const hasError = step1Fields.some((field) => (formErrors as Record<string, any>)[field])

      if (hasError) {
        toast.error("Please fill in all required fields correctly")
        return
      }

      setActiveStep(2)
    }
  }

  const steps = [
    {
      label: "Account Credentials",
      content: (
        <div className="flex flex-col gap-2">
          <LabeledTextField
            name="email"
            label="Email"
            placeholder="email@example.com"
            size="small"
            required
            helperText={
              touched.email && errors.email
                ? (errors.email as string)
                : emailSuccessMsg && <span className="text-green-600">{emailSuccessMsg}</span>
            }
          />
          <LabeledTextField
            name="password"
            label="Password"
            type="password"
            size="small"
            required
          />
        </div>
      ),
    },
    {
      label: "Personal Information",
      content: (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <LabeledTextField
              name="firstName"
              label="First Name"
              placeholder="First Name"
              required
              outerProps={{ className: "flex-1" }}
            />
            <LabeledTextField
              name="middleName"
              label="Middle"
              placeholder="Middle Name"
              outerProps={{ className: "flex-1" }}
            />
            <LabeledTextField
              name="lastName"
              label="Last Name"
              placeholder="Last Name"
              required
              outerProps={{ className: "flex-1" }}
            />
          </div>

          <div className="flex gap-2">
            <LabeledTextField
              name="phoneNumber"
              label="Contact No."
              placeholder="09123456789"
              required
              outerProps={{ className: "flex-1" }}
            />
            <LabeledTextField
              name="birthDate"
              label="Birth Date"
              type="date"
              required
              InputLabelProps={{ shrink: true }}
              outerProps={{ className: "flex-1" }}
            />
          </div>

          <div className="flex gap-2">
            <LabeledTextField
              name="street"
              label="Street/House No."
              placeholder="Street"
              required
              outerProps={{ className: "flex-1" }}
            />
            <FormControl fullWidth sx={{ flex: 1 }}>
              <InputLabel id="barangay-label">Barangay</InputLabel>
              <Select
                labelId="barangay-label"
                name="barangay"
                label="Barangay"
                value={values.barangay}
                onChange={(e) => setFieldValue("barangay", e.target.value)}
              >
                {barangays.map((bg: any) => (
                  <MenuItem key={bg.id} value={bg.name}>
                    {bg.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className="flex gap-2">
            <LabeledTextField
              name="city"
              label="City"
              disabled
              outerProps={{ className: "flex-1" }}
            />
            <LabeledTextField
              name="zipCode"
              label="Zipcode"
              disabled
              outerProps={{ className: "flex-1" }}
            />
          </div>

          <div className="flex gap-2">
            <LabeledTextField
              name="province"
              label="Province"
              disabled
              outerProps={{ className: "flex-1" }}
            />
            <LabeledTextField
              name="country"
              label="Country"
              disabled
              outerProps={{ className: "flex-1" }}
            />
          </div>
        </div>
      ),
    },
  ]

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Box sx={{ mb: 2 }}>{step.content}</Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button
                  disabled={index === 0}
                  onClick={() => setActiveStep(index - 1)}
                  size="small"
                  sx={{ textTransform: "none", color: "#6b7280" }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  size="small"
                  sx={{
                    backgroundColor: "#1b2a80",
                    "&:hover": { backgroundColor: "#152266" },
                    textTransform: "none",
                    fontWeight: "bold",
                  }}
                >
                  Continue
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === 2 && (
        <Paper
          square
          elevation={0}
          sx={{ p: 3, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}
        >
          <Typography className="text-center font-semibold text-gray-700">
            Ready to join!
          </Typography>
          <div className="flex w-full gap-2">
            <Button
              onClick={() => setActiveStep(0)}
              fullWidth
              variant="outlined"
              size="small"
              sx={{ color: "#1b2a80", borderColor: "#1b2a80", textTransform: "none" }}
            >
              Edit
            </Button>
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
              Register
            </Button>
          </div>
        </Paper>
      )}
    </Box>
  )
}

export default SignupForm
