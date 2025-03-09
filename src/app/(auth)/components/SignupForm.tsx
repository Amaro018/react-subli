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
  InputAdornment,
} from "@mui/material"
import { Signup } from "../validations"

import checkEmail from "../../mutations/checkEmail"

import { set, ZodError } from "zod"
import { IconButton } from "@mui/material"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { toast } from "sonner"

type SignupFormProps = {
  onSuccess?: () => void
}

export const SignupForm = (props: SignupFormProps) => {
  const [checkEmailMutation] = useMutation(checkEmail)
  const [errors, setErrors] = useState({ email: "", password: "", success: "" })
  const [successMessage, setSuccessMessage] = useState("")
  const [errorEmail, setErrorEmail] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    middleName: "",
    birthDate: "",
    street: "",
    city: "",
    region: "",
    country: "",
    zipCode: "",
  })

  const handleEmailChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const email = event.target.value

    // Update form values
    setFormValues({
      ...formValues,
      [event.target.name]: email,
    })

    if (!email) {
      setSuccessMessage("")
      setErrors((prev) => ({
        ...prev,
        email: "Email is required.",
      }))
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setSuccessMessage("")
      setErrors((prev) => ({
        ...prev,
        email: "Invalid email.",
      }))
      return
    }

    try {
      // Call the email-checking mutation
      const response = await checkEmailMutation({ email })

      if (response.success) {
        console.log(response, "ok no problem")
        setErrors({ ...errors, email: "" })
        setSuccessMessage(response.message)
        setErrorEmail(false)
      } else {
        console.log(response, "error")
        setSuccessMessage("")
        setErrors({ ...errors, email: response.message })
      }
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {}

        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message
        })

        setErrors((prev) => ({
          ...prev,
          ...newErrors,
        }))
      }
    }

    // try {
    //   // Call the email-checking mutation
    //   const response = await checkEmailMutation({ email })

    //   if (response.success) {
    //     console.log(response, "ok no problem")
    //     setErrors({ ...errors, email: "" })
    //     setSuccessMessage(response.message)
    //     setErrorEmail(false)
    //   } else {
    //     console.log(response, "error")
    //     setSuccessMessage("")
    //     setErrors({ ...errors, email: response.message })
    //   }
    // } catch (error) {
    //   console.error("Error checking email:", error)
    //   setSuccessMessage("")
    // }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    })

    if (event.target.name === "password") {
      const password = event.target.value

      if (!password) {
        setErrors((prev) => ({
          ...prev,
          password: "Password is required.",
        }))
        return
      }

      if (password.length < 10) {
        setErrors((prev) => ({
          ...prev,
          password: "Password must be at least 10 characters.",
        }))
        return
      }

      try {
        // Validate the password using your zod schema
        Signup.parse({ password })

        // Clear any previous password error if validation passes
        setErrors((prev) => ({
          ...prev,
          password: "password is valid",
        }))
        console.log("password is valid")
        return
      } catch (error) {
        if (error instanceof ZodError) {
          // Extract and display the first password validation error
          const passwordError = error.errors.find((err) => err.path.includes("password"))
          if (passwordError) {
            setErrors((prev) => ({
              ...prev,
              password: passwordError.message,
            }))
          } else {
            setErrors((prev) => ({
              ...prev,
              password: "",
            }))
          }
          console.log(passwordError)
        } else {
          // Handle unexpected errors
          console.error("Unexpected error during password validation:", error)
          setErrors((prev) => ({
            ...prev,
            password: "An unexpected error occurred.",
          }))
        }
      }
    }
    console.log(formValues, "form values")
  }

  const steps = [
    {
      label: "Account Credentials",
      content: (
        <>
          <TextField
            name="email"
            label="Email"
            placeholder="Email"
            value={formValues.email}
            onChange={handleEmailChange}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            required
          />
          {errorEmail && <p className="text-red-500 text-xs italic my-2">{errors.email}</p>}
          {successMessage && <p className="text-green-500 text-xs italic my-2">{successMessage}</p>}

          <LabeledTextField
            name="password"
            label="Password"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={formValues.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            required
            className="mt-4"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
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
                onChange={handleChange}
                value={formValues.firstName}
              />
              <LabeledTextField
                name="middleName"
                label="Middle Name"
                placeholder="Middle Name"
                onChange={handleChange}
                value={formValues.middleName}
              />
              <LabeledTextField
                name="lastName"
                label="Last Name"
                placeholder="Last Name"
                required
                onChange={handleChange}
                value={formValues.lastName}
              />
            </div>

            <LabeledTextField
              name="phoneNumber"
              label="Contact Number"
              placeholder="Contact Number"
              type="text"
              required
              onChange={handleChange}
              value={formValues.phoneNumber}
            />
            <LabeledTextField
              label="Date of Birth"
              name="birthDate"
              placeholder="Date of Birth"
              type="date"
              required
              onChange={handleChange}
              value={formValues.birthDate}
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
                onChange={handleChange}
                value={formValues.street}
                required
              />
              <LabeledTextField
                name="city"
                label="City"
                placeholder="City"
                type="text"
                required
                onChange={handleChange}
                value={formValues.city}
              />
            </div>
            <div className="flex gap-2">
              <LabeledTextField
                name="region"
                label="Region"
                placeholder="Region"
                type="text"
                required
                onChange={handleChange}
                value={formValues.region}
              />
              <LabeledTextField
                name="country"
                label="Country"
                placeholder="Country"
                type="text"
                required
                onChange={handleChange}
                value={formValues.country}
              />
            </div>
            <LabeledTextField
              name="zipCode"
              label="Zipcode"
              placeholder="Zipcode"
              type="text"
              required
              onChange={handleChange}
              value={formValues.zipCode}
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

  // const handleNext = async () => {
  //   if (activeStep === 0) {
  //     console.log(formValues.email, "you are here")
  //     await checkEmailMutation({ email: formValues.email })
  //     if (successMessage === "The email is available" && errors.password === "") {
  //       setActiveStep((prevActiveStep) => prevActiveStep + 1)
  //     } else if (errors.password !== "") {
  //       alert("Please enter a valid password")
  //     } else {
  //       alert("Please enter a valid email")
  //     }
  //   }
  // }

  const handleNext = async () => {
    if (activeStep === 0) {
      if (formValues.password === "") {
        toast.error("Please enter a valid password")
      } else if (
        successMessage === "The email is available" &&
        errors.password === "" &&
        formValues.email !== "" &&
        formValues.password !== ""
      ) {
        console.log("PASOK KANA ALRIGTH")
        console.log(successMessage)
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
      } else if (errors.password !== "") {
        console.log(errors.password)
        toast.error("Please enter a valid password")
      } else {
        console.log(successMessage)
        console.log(errors.email)
        toast.error("Please enter a valid email")
      }
    } else {
      if (
        formValues.firstName === "" ||
        formValues.middleName === "" ||
        formValues.lastName === "" ||
        formValues.birthDate === "" ||
        formValues.phoneNumber === "" ||
        formValues.street === "" ||
        formValues.city === "" ||
        formValues.region === "" ||
        formValues.country === "" ||
        formValues.zipCode === ""
      ) {
        toast.error("Please fill out all required fields")
      } else {
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
      }
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleReset = () => {
    setActiveStep(0)
  }

  const handleSubmit = async () => {
    try {
      const birthDate = formValues.birthDate ? new Date(formValues.birthDate) : new Date()
      // Call the signup mutation with formValues directly
      await signupMutation({ ...formValues, birthDate: birthDate })

      // Trigger success callback and navigate
      props.onSuccess?.()
      router.push("/")
      toast.success("Account created successfully!")
    } catch (error: any) {
      console.error("Signup error:", error)

      // Handle the error and display it appropriately
      alert(error.message || "An unexpected error occurred.")
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
              <Button type="submit" onClick={handleSubmit} variant="contained" sx={{ mt: 1 }}>
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
