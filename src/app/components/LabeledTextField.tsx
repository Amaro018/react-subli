import { forwardRef, PropsWithoutRef, useState } from "react"
import { useField, useFormikContext } from "formik"
import { TextField, InputAdornment, IconButton } from "@mui/material"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"

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
    const [field, meta] = useField(name)
    const { isSubmitting } = useFormikContext()
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === "password"
    const inputType = isPassword ? (showPassword ? "text" : "password") : type

    const passwordAdornment = isPassword ? (
      <InputAdornment position="end">
        <IconButton
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((s) => !s)}
          edge="end"
          size="large"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ) : null

    return (
      <div {...outerProps}>
        <TextField
          {...field}
          label={label}
          type={inputType}
          disabled={isSubmitting}
          error={Boolean(meta.touched && meta.error)}
          helperText={meta.touched && meta.error ? meta.error : " "}
          fullWidth
          variant="outlined"
          inputRef={ref}
          InputProps={{
            endAdornment: passwordAdornment,
          }}
          {...(props as any)}
        />
      </div>
    )
  }
)

LabeledTextField.displayName = "LabeledTextField"

export default LabeledTextField
