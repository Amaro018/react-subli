import React, { memo } from "react"
import {
  Paper,
  Typography,
  TextField,
  InputAdornment,
  MenuItem,
  Stack,
  Box,
  Tooltip,
} from "@mui/material"

interface PurchaseHistorySectionProps {
  originalPurchaseDate: string
  condition: string
  onChange: (field: string, value: any) => void
  disabledHistory?: boolean
  children?: React.ReactNode
  sx?: any
}

const PurchaseHistorySection = memo(function PurchaseHistorySection({
  originalPurchaseDate,
  condition,
  onChange,
  disabledHistory,
  children,
  sx,
}: PurchaseHistorySectionProps) {
  // Prevent selecting future dates
  const today = new Date().toISOString().split("T")[0]

  const conditionOptions = [
    { value: "New", label: "New", desc: "Brand new, never used, original packaging." },
    { value: "Like New", label: "Like New", desc: "Used once or twice, no visible wear." },
    { value: "Good", label: "Good", desc: "Minor cosmetic wear, fully functional." },
    { value: "Fair", label: "Fair", desc: "Visible scratches/dents, works as intended." },
  ]

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, ...sx }}>
      <Stack spacing={4}>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          History & Condition
        </Typography>

        <Stack spacing={3}>
          {/* PURCHASE DATE */}
          <Tooltip
            title={
              disabledHistory ? "Cannot be changed because this product has rental history." : ""
            }
            placement="top-start"
            arrow
          >
            <div style={{ width: "100%" }}>
              <TextField
                fullWidth
                type="date"
                label="Date of Purchase"
                InputLabelProps={{ shrink: true }}
                value={originalPurchaseDate || ""}
                onChange={(e) => onChange("originalPurchaseDate", e.target.value)}
                disabled={disabledHistory}
                inputProps={{ max: today }} // Restrict to past/present dates
                helperText={
                  disabledHistory
                    ? "Cannot be changed because this product has rental history."
                    : "Used to calculate item depreciation."
                }
              />
            </div>
          </Tooltip>

          {/* CONDITION SELECT */}
          <TextField
            select
            fullWidth
            label="Current Condition"
            value={condition || "New"}
            onChange={(e) => onChange("condition", e.target.value)}
            helperText="Accurate condition reporting prevents rental disputes."
            SelectProps={{
              renderValue: (selected) => {
                const selectedOption = conditionOptions.find((opt) => opt.value === selected)
                return selectedOption ? selectedOption.label : (selected as React.ReactNode)
              },
            }}
          >
            {conditionOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ display: "block", py: 1 }}>
                <Typography variant="body1">{opt.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {opt.desc}
                </Typography>
              </MenuItem>
            ))}
          </TextField>

          {children}
        </Stack>
      </Stack>
    </Paper>
  )
})

export default PurchaseHistorySection
