import { z } from "zod"

export const email = z
  .string()
  .email()
  .transform((str) => str.toLowerCase().trim())

export const password = z
  .string()
  .min(10, "Password must be at least 10 characters long.")
  .max(100, "Password must be at most 100 characters long.")
  .refine((str) => /[A-Z]/.test(str), "Password must contain at least one uppercase letter.")
  .refine(
    (str) => /[!@#$%^&*(),.?":{}|<>]/.test(str),
    "Password must contain at least one special symbol."
  )
  .transform((str) => str.trim())

export const Signup = z.object({
  email,
  password,
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  birthDate: z.string(),
  phoneNumber: z.string().optional(),
  street: z.string(),
  city: z.string(),
  region: z.string(),
  country: z.string(),
  zipCode: z.string(),
})

export const UserInfo = z.object({
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
  birthDate: z.string(),
  phoneNumber: z.string().optional(),
  street: z.string(),
  city: z.string(),
  region: z.string(),
  country: z.string(),
  zipCode: z.string(),
})

export const Login = z.object({
  email,
  password: z.string(),
})

export const ForgotPassword = z.object({
  email,
})

export const ResetPassword = z
  .object({
    password: password,
    passwordConfirmation: password,
    token: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"], // set the path of the error
  })

export const ChangePassword = z.object({
  currentPassword: z.string(),
  newPassword: password,
})
