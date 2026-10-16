import { z } from "zod"

export const meSchema = z.object({
  id: z.number(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  name: z.string(),
})

export type Me = z.infer<typeof meSchema>

export const loginResponseSchema = z.object({
  device_session_token: z.string().min(1),
})

export const loginFormSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
