import { forwardRef, PropsWithoutRef } from "react"
import { useField, useFormikContext, ErrorMessage } from "formik"
import { TextField } from "@mui/material"

export interface LabeledTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "password" | "email" | "number" | "tel" | "url" | "search" | "color" | "date"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
}

export const LabeledTextField = forwardRef<HTMLInputElement, LabeledTextFieldProps>(
  ({ name, label, outerProps, type = "text", ...props }, ref) => {
    const [field, meta] = useField(name) // `useField` returns field and meta info
    const { isSubmitting } = useFormikContext()

    return (
      <div {...outerProps}>
        <TextField
          {...field} // Handles `name`, `value`, `onChange`, and `onBlur`
          label={label}
          type={type}
          disabled={isSubmitting}
          error={Boolean(meta.touched && meta.error)} // Highlight field in red if there's an error
          helperText={meta.touched && meta.error ? meta.error : " "} // Display error message below
          fullWidth
          variant="outlined"
          inputRef={ref}
          {...props} // Spread additional props (like `placeholder`)
        />
      </div>
    )
  }
)

LabeledTextField.displayName = "LabeledTextField"

export default LabeledTextField
