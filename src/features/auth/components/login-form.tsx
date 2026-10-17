"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlertIcon } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router"
import { useForm } from "react-hook-form"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { applyServerErrors } from "@/lib/forms"
import { safeRedirectPath } from "@/lib/routes"

import { useClearSessionData, useSignIn } from "../queries"
import { loginFormSchema, type LoginFormValues } from "../schemas"

export function LoginForm() {
  // Arriving here after sign-out, an expired session or a direct visit:
  // no data of a previous session may survive in the cache.
  useClearSessionData()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const signIn = useSignIn()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  })
  const { errors, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async (credentials) => {
    try {
      await signIn.mutateAsync(credentials)
    } catch (error) {
      applyServerErrors(form, error)
      return
    }
    // The page stays mounted (hidden) after navigation, so drop the typed password.
    form.reset()
    void navigate(safeRedirectPath(searchParams.get("next")), { replace: true })
  })

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {errors.root?.server && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertDescription>{errors.root.server.message}</AlertDescription>
        </Alert>
      )}

      <FieldGroup>
        <Field data-invalid={Boolean(errors.email)}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="username"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={Boolean(errors.password)}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.password)}
            {...form.register("password")}
          />
          <FieldError errors={[errors.password]} />
        </Field>
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Spinner />}
        Sign in
      </Button>
    </form>
  )
}
