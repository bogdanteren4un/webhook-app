import type { FieldValues, Path, UseFormReturn } from "react-hook-form"

import { getErrorMessage, isValidationError } from "@/lib/api/errors"

/**
 * Maps a failed submit onto a form: 422 messages go next to the matching fields
 * (the first one gets focus); everything else becomes the form-level `root.server` error.
 */
export function applyServerErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: unknown,
): void {
  const formFields = Object.keys(form.getValues())
  const otherMessages: string[] = []
  let hasFieldErrors = false

  if (isValidationError(error)) {
    for (const [field, messages] of Object.entries(error.fieldErrors)) {
      const message = messages.join(" ")
      if (formFields.includes(field)) {
        form.setError(
          field as Path<T>,
          { type: "server", message },
          { shouldFocus: !hasFieldErrors },
        )
        hasFieldErrors = true
      } else {
        otherMessages.push(message)
      }
    }
    if (hasFieldErrors && otherMessages.length === 0) return
  }

  form.setError("root.server", {
    type: "server",
    message: otherMessages.length > 0 ? otherMessages.join(" ") : getErrorMessage(error),
  })
}
