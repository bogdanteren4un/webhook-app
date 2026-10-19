import { zodResolver } from "@hookform/resolvers/zod"
import { CircleAlertIcon } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { applyServerErrors } from "@/lib/forms"

import { useUpdateWebhook } from "../queries"
import { webhookFormSchema, type Webhook, type WebhookFormValues } from "../schemas"

type WebhookEditFormProps = {
  webhook: Webhook
  /** The list URL with the page and search the user came from. */
  backHref: string
}

export function WebhookEditForm({ webhook, backHref }: WebhookEditFormProps) {
  const navigate = useNavigate()
  const updateWebhook = useUpdateWebhook()
  const form = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: { name: webhook.name, url: webhook.url },
  })
  const { errors, isDirty, isSubmitting } = form.formState

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await updateWebhook.mutateAsync({ id: webhook.id, values })
    } catch (error) {
      applyServerErrors(form, error)
      return
    }
    toast.success("Webhook saved")
    void navigate(backHref)
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
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            autoComplete="off"
            aria-invalid={Boolean(errors.name)}
            {...form.register("name")}
          />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={Boolean(errors.url)}>
          <FieldLabel htmlFor="url">URL</FieldLabel>
          <Input
            id="url"
            type="url"
            inputMode="url"
            autoComplete="off"
            placeholder="https://example.com/webhook"
            aria-invalid={Boolean(errors.url)}
            {...form.register("url")}
          />
          <FieldDescription>Events are delivered to this http(s) address.</FieldDescription>
          <FieldError errors={[errors.url]} />
        </Field>
      </FieldGroup>

      <div className="flex gap-3">
        <Button type="submit" disabled={!isDirty || isSubmitting}>
          {isSubmitting && <Spinner />}
          Save changes
        </Button>
        <Link to={backHref} className={buttonVariants({ variant: "outline" })}>
          Cancel
        </Link>
      </div>
    </form>
  )
}
