import React, { memo } from "react"
import {
  Paper,
  Typography,
  Tooltip,
  FormControlLabel,
  Switch,
  TextField,
  InputAdornment,
  Box,
  Stack,
} from "@mui/material"
import { HelpOutline, InfoOutlined } from "@mui/icons-material"

interface DamagePoliciesSectionProps {
  useDefaultDamageRates: boolean
  setUseDefaultDamageRates: (val: boolean) => void
  // NEW: Pass the current category's template descriptions
  categoryTemplate?: {
    MINOR: string
    MODERATE: string
    MAJOR: string
  }
  minorPercent: number
  minorMin: number
  minorMax: number
  onMinorChange: (val: number) => void
  moderatePercent: number
  modMin: number
  modMax: number
  onModerateChange: (val: number) => void
  majorPercent: number
  majMin: number
  majMax: number
  onMajorChange: (val: number) => void
  disabledPolicies?: boolean
  sx?: any
}

const DamagePoliciesSection = memo(function DamagePoliciesSection({
  useDefaultDamageRates,
  setUseDefaultDamageRates,
  categoryTemplate,
  minorPercent,
  minorMin,
  minorMax,
  onMinorChange,
  moderatePercent,
  modMin,
  modMax,
  onModerateChange,
  majorPercent,
  majMin,
  majMax,
  onMajorChange,
  disabledPolicies,
  sx,
}: DamagePoliciesSectionProps) {
  // Helper to render a Policy Row
  const PolicyInfo = ({
    label,
    percent,
    description,
    color,
  }: {
    label: string
    percent: number
    description?: string
    color: string
  }) => (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
        <Typography variant="body2" fontWeight="bold" color="text.secondary">
          {label} ({percent}%)
        </Typography>
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: color }} />
      </Box>
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ fontStyle: "italic", display: "block", lineHeight: 1.4 }}
      >
        {description || "No description provided."}
      </Typography>
    </Box>
  )

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2, ...sx }}>
      <Stack spacing={4}>
        <div className="flex items-center justify-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Damage Protection
            </Typography>
            <Tooltip
              title="Define how much a renter is charged if they damage the item based on its current depreciated value."
              arrow
            >
              <HelpOutline sx={{ color: "text.disabled", fontSize: 20, cursor: "help" }} />
            </Tooltip>
          </Stack>
          <Tooltip
            title={
              disabledPolicies ? "Cannot be changed because this product has rental history." : ""
            }
            placement="top-start"
            arrow
          >
            <span>
              <FormControlLabel
                control={
                  <Switch
                    color="primary"
                    checked={useDefaultDamageRates}
                    disabled={disabledPolicies}
                    onChange={(e) => setUseDefaultDamageRates(e.target.checked)}
                  />
                }
                label={
                  <Typography variant="body2" fontWeight="medium">
                    Use Default Rates
                  </Typography>
                }
                sx={{ opacity: disabledPolicies ? 0.6 : 1, m: 0 }}
              />
            </span>
          </Tooltip>
        </div>

        <Stack spacing={3}>
          <PolicyInfo
            label="Minor"
            percent={minorPercent}
            description={categoryTemplate?.MINOR}
            color="#4caf50"
          />
          <PolicyInfo
            label="Moderate"
            percent={moderatePercent}
            description={categoryTemplate?.MODERATE}
            color="#ff9800"
          />
          <PolicyInfo
            label="Major"
            percent={majorPercent}
            description={categoryTemplate?.MAJOR}
            color="#f44336"
          />
          <PolicyInfo
            label="Total Loss"
            percent={100}
            description="Item is lost, stolen, or irreparable. Renter pays 100% of current fair market value."
            color="#212121"
          />
        </Stack>

        {!useDefaultDamageRates && (
          <Box
            sx={{
              p: 3,
              bgcolor: "white",
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <Stack spacing={3}>
              <Box
                className="flex items-center gap-1.5 mb-1"
                sx={{ opacity: disabledPolicies ? 0.5 : 1 }}
              >
                <InfoOutlined sx={{ fontSize: 18, color: "#4338ca" }} />
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  sx={{ color: "#4338ca", letterSpacing: 0.5 }}
                >
                  CUSTOM RATE EDITOR
                </Typography>
              </Box>

              <Stack spacing={2.5}>
                <Tooltip
                  title={
                    disabledPolicies
                      ? "Cannot be changed because this product has rental history."
                      : ""
                  }
                  placement="top-start"
                  arrow
                >
                  <div style={{ width: "100%" }}>
                    <TextField
                      label="Minor (%)"
                      type="number"
                      size="small"
                      fullWidth
                      disabled={disabledPolicies}
                      value={minorPercent || ""}
                      error={minorPercent < minorMin || minorPercent > minorMax}
                      helperText={
                        disabledPolicies
                          ? ""
                          : minorPercent < minorMin || minorPercent > minorMax
                          ? `Must be between ${minorMin} and ${minorMax}`
                          : ""
                      }
                      onChange={(e) => onMinorChange(Number(e.target.value))}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </div>
                </Tooltip>
                <Tooltip
                  title={
                    disabledPolicies
                      ? "Cannot be changed because this product has rental history."
                      : ""
                  }
                  placement="top-start"
                  arrow
                >
                  <div style={{ width: "100%" }}>
                    <TextField
                      label="Moderate (%)"
                      type="number"
                      size="small"
                      fullWidth
                      disabled={disabledPolicies}
                      value={moderatePercent || ""}
                      error={moderatePercent < modMin || moderatePercent > modMax}
                      helperText={
                        disabledPolicies
                          ? ""
                          : moderatePercent < modMin || moderatePercent > modMax
                          ? `Must be between ${modMin} and ${modMax}`
                          : ""
                      }
                      onChange={(e) => onModerateChange(Number(e.target.value))}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </div>
                </Tooltip>
                <Tooltip
                  title={
                    disabledPolicies
                      ? "Cannot be changed because this product has rental history."
                      : ""
                  }
                  placement="top-start"
                  arrow
                >
                  <div style={{ width: "100%" }}>
                    <TextField
                      label="Major (%)"
                      type="number"
                      size="small"
                      fullWidth
                      disabled={disabledPolicies}
                      value={majorPercent || ""}
                      error={majorPercent < majMin || majorPercent > majMax}
                      helperText={
                        disabledPolicies
                          ? ""
                          : majorPercent < majMin || majorPercent > majMax
                          ? `Must be between ${majMin} and ${majMax}`
                          : ""
                      }
                      onChange={(e) => onMajorChange(Number(e.target.value))}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </div>
                </Tooltip>
              </Stack>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mt: 1 }}
              >
                Note: Percentages are applied to the item&apos;s depreciated value at the time of
                damage.
              </Typography>
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  )
})

export default DamagePoliciesSection
