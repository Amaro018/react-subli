"use client"
import { useState, ChangeEvent } from "react"
import { AuthenticationError } from "blitz"
import { useMutation } from "@blitzjs/rpc"
import { TextField, Button, Link, InputAdornment, IconButton } from "@mui/material"
import { toast } from "sonner"
import changePassword from "../../(auth)/mutations/changePassword"
import { password as passwordValidation } from "../../(auth)/validations"
import { ForgotPasswordForm } from "../../(auth)/components/ForgotPasswordForm"
import Visibility from "@mui/icons-material/Visibility"
import VisibilityOff from "@mui/icons-material/VisibilityOff"

export default function ChangePassword() {
  const [changePasswordMutation] = useMutation(changePassword)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPass = e.target.value
    setNewPassword(newPass)
    if (newPass === "") {
      setPasswordError(null)
      return
    }
    const result = passwordValidation.safeParse(newPass)
    if (!result.success) {
      setPasswordError(result.error.errors[0]?.message ?? null)
    } else {
      setPasswordError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordError) {
      toast.error(passwordError)
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (currentPassword === newPassword) {
      toast.error("New password cannot be the same as the current password")
      setNewPassword("")
      setConfirmPassword("")
      return
    }

    try {
      await changePasswordMutation({ currentPassword, newPassword })
      toast.success("Password changed successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      if (error instanceof AuthenticationError) {
        toast.error("The current password you entered is incorrect")
      } else {
        toast.error(error.message || "Failed to change password")
      }
    }
  }

  if (showForgotPassword) {
    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <ForgotPasswordForm />
        <Button onClick={() => setShowForgotPassword(false)} variant="text">
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col">
      {/* Input Fields Section */}
      <div className="flex flex-col gap-4 py-4 max-w-md mx-auto w-full">
        <TextField
          type={showCurrentPassword ? "text" : "password"}
          label="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          fullWidth
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  edge="end"
                >
                  {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          type={showNewPassword ? "text" : "password"}
          label="New Password"
          value={newPassword}
          onChange={handleNewPasswordChange}
          required
          fullWidth
          variant="outlined"
          error={!!passwordError}
          helperText={passwordError}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  edge="end"
                >
                  {showNewPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          type={showConfirmPassword ? "text" : "password"}
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          variant="outlined"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  edge="end"
                >
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <div className="flex justify-end">
          <Link
            component="button"
            variant="body2"
            underline="hover"
            onClick={() => setShowForgotPassword(true)}
            type="button"
          >
            Forgot Password?
          </Link>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="mt-4 flex justify-end gap-2 border-t pt-4">
        <Button variant="contained" color="primary" type="submit">
          Update Password
        </Button>
      </div>
    </form>
  )
}
