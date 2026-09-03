import React, { useState } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material"
import { useMutation } from "@blitzjs/rpc"
import createReport from "../mutations/createReport"
import { toast } from "@/src/app/utils/toast"

interface ReportProductModalProps {
  open: boolean
  onClose: () => void
  productId: number
  productName: string
}

const REPORT_REASONS = [
  "Inappropriate content",
  "Misleading information",
  "Prohibited item",
  "Scam or fraud",
  "Intellectual property violation",
  "Other",
]

export default function ReportProductModal({
  open,
  onClose,
  productId,
  productName,
}: ReportProductModalProps) {
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [createReportMutation, { isLoading }] = useMutation(createReport)

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason for the report.")
      return
    }
    try {
      await createReportMutation({ productId, reason, description })
      toast.success("Product reported successfully. We will review it shortly.")
      onClose()
      setReason("")
      setDescription("")
    } catch (error) {
      toast.error((error as Error).message || "Failed to submit report.")
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Report Product
        <Typography variant="body2" color="text.secondary">
          {productName}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box
          component="form"
          noValidate
          autoComplete="off"
          sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}
        >
          <TextField
            select
            required
            label="Reason for reporting"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            fullWidth
          >
            {REPORT_REASONS.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Additional details (optional)"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="error" disabled={isLoading}>
          {isLoading ? <CircularProgress size={24} color="inherit" /> : "Submit Report"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
