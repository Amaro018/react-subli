"use client"
import React, { useState } from "react"
import { LabeledTextField } from "src/app/components/LabeledTextField"
import { Form, FORM_ERROR } from "src/app/components/Form"
import signup from "../mutations/signup"
import { useMutation } from "@blitzjs/rpc"
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
} from "@mui/material"
import { Signup } from "../validations"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const steps = [
    {
      label: "Account Credentials",
      content: (
        <>
          <LabeledTextField name="email" label="Email" placeholder="Email" required />
          <LabeledTextField
            name="password"
            label="Password"
            placeholder="Password"
            type="password"
            required
          />
        </>
      ),
    },
    {
      label: "Personal Information",
      content: (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2 w-full">
              <LabeledTextField
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
                type="text"
              />
              <LabeledTextField name="middleName" label="Middle Name" placeholder="Middle Name" />
              <LabeledTextField
                name="lastName"
                label="Last Name"
                placeholder="Last Name"
                required
              />
            </div>

            <LabeledTextField
              name="phoneNumber"
              label="Contact Number"
              placeholder="Contact Number"
              type="text"
              required
            />
            <LabeledTextField
              label="Date of Birth"
              name="birthDate"
              placeholder="Date of Birth"
              type="date"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <div className="flex gap-2">
              <LabeledTextField
                name="street"
                label="Street"
                placeholder="Street"
                type="text"
                required
              />
              <LabeledTextField name="city" label="City" placeholder="City" type="text" required />
            </div>
            <div className="flex gap-2">
              <LabeledTextField
                name="region"
                label="Region"
                placeholder="Region"
                type="text"
                required
              />
              <LabeledTextField
                name="country"
                label="Country"
                placeholder="Country"
                type="text"
                required
              />
            </div>
            <LabeledTextField
              name="zipCode"
              label="Zipcode"
              placeholder="Zipcode"
              type="text"
              required
            />
          </div>
        </>
      ),
    },

    // {
    //   label: "Create an Ad",
    //   content: (
    //     <Typography>
    //       Try out different ad text to see what brings in the most customers, and learn how to
    //       enhance your ads using features like ad extensions. If you run into any problems with your
    //       ads, find out how to tell if e running and how to resolve approval issues.
    //     </Typography>
    //   ),
    // },
  ]

  const [signupMutation] = useMutation(signup)
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1)
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  const handleSubmit = async (values: any) => {
    console.log(values)
    try {
      // Handle birthDate as a string and convert to Date object
      const birthDate = values.birthDate ? new Date(values.birthDate) : new Date()

      await signupMutation({
        ...values,
        birthDate: birthDate,
      })
      props.onSuccess?.()
      router.push("/")
      alert("Signup successful!")
    } catch (error: any) {
      return { [FORM_ERROR]: error.toString() }
    }
  }

  return (
    <div className="w-1/4">
      <div className="flex items-center justify-center bg-slate-600 p-2 rounded-t-lg">
        REGISTER A NEW ACCOUNT
      </div>
      <Form
        schema={Signup}
        initialValues={{
          email: "",
          password: "",
          firstName: "",
          middleName: "",
          lastName: "",
          birthDate: "",
          phoneNumber: "",
          street: "",
          city: "",
          region: "",
          country: "",
          zipCode: "",
        }}
        onSubmit={handleSubmit}
        className="p-4 border border-gray-300 rounded-b-lg w-full"
      >
        <Box sx={{ maxWidth: 400 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>{step.label}</StepLabel>
                <StepContent>
                  <Box sx={{ mb: 2 }}>{step.content}</Box>
                  <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                    <Button variant="contained" onClick={handleNext} sx={{ mt: 1, mr: 1 }}>
                      {index === steps.length - 1 ? "Finish" : "Continue"}
                    </Button>
                    <Button disabled={index === 0} onClick={handleBack} sx={{ mt: 1, mr: 1 }}>
                      Back
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length && (
            <Paper
              square
              elevation={0}
              sx={{ p: 3, display: "flex", flexDirection: "column", alignContent: "center" }}
            >
              <Typography className="text-center">All steps completed</Typography>
              <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
                Reset
              </Button>
              <Button type="submit" variant="contained" sx={{ mt: 1 }}>
                Register
              </Button>
            </Paper>
          )}
        </Box>
      </Form>
    </div>
  )
}

export default SignupForm
