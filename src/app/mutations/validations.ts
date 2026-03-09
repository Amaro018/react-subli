import { z } from "zod"

export const CreateAddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  isDefault: z.boolean().optional(),
  userId: z.string(),
})

export const UpdateAddressSchema = z.object({
  id: z.string(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  isDefault: z.boolean().optional(),
})

export const DeleteAddressSchema = z.object({
  id: z.string(),
})

export const SetDefaultAddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
})
