import React, { memo } from "react"
import {
  TextField,
  MenuItem,
  InputAdornment,
  Paper,
  Typography,
  IconButton,
  Button,
} from "@mui/material"
import { DeleteForever as DeleteForeverIcon, ExpandMore, ExpandLess } from "@mui/icons-material"
import PurchaseHistorySection from "./PurchaseHistorySection"

interface EditProductVariantItemProps {
  variant: any
  index: number
  attributes: any[]
  isOpen: boolean
  toggleRow: (id: any) => void
  handleVariantChange: (index: number, field: string, value: string | number) => void
  handleVariantAttributeChange: (index: number, attributeId: number, valueId: number) => void
  handleRepairCost: (index: number, key: string, severity: string, value: number) => void
  removeVariant: (index: number) => void
  minorMax: number
  modMax: number
  majMax: number
}

const EditProductVariantItem = memo(function EditProductVariantItem({
  variant,
  index,
  attributes,
  isOpen,
  toggleRow,
  handleVariantChange,
  handleVariantAttributeChange,
  handleRepairCost,
  removeVariant,
  minorMax,
  modMax,
  majMax,
}: EditProductVariantItemProps) {
  const minorPolicyIndex = variant.damagePolicies?.findIndex(
    (p: any) => p.damageSeverity === "minor"
  )
  const minorPolicy = variant.damagePolicies?.[minorPolicyIndex]

  const moderatePolicyIndex = variant.damagePolicies?.findIndex(
    (p: any) => p.damageSeverity === "moderate"
  )
  const moderatePolicy = variant.damagePolicies?.[moderatePolicyIndex]

  const majorPolicyIndex = variant.damagePolicies?.findIndex(
    (p: any) => p.damageSeverity === "major"
  )
  const majorPolicy = variant.damagePolicies?.[majorPolicyIndex]

  const totalLossPolicyIndex = variant.damagePolicies?.findIndex(
    (p: any) => p.damageSeverity === "total_loss"
  )
  const totalLossPolicy = variant.damagePolicies?.[totalLossPolicyIndex]

  const replacementCost = variant.replacementCost

  const minorMin = 1
  const modMin = minorPolicy?.damageSeverityPercent ? minorPolicy.damageSeverityPercent + 1 : 2
  const majMin = moderatePolicy?.damageSeverityPercent
    ? moderatePolicy.damageSeverityPercent + 1
    : 3
  const totalMin = majorPolicy?.damageSeverityPercent ? majorPolicy.damageSeverityPercent + 1 : 61
  const totalMax = 100

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => toggleRow(variant.id)}
      >
        <div className="flex items-center gap-3">
          <Typography variant="subtitle1" className="font-bold text-slate-700 uppercase">
            Variant
          </Typography>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded border border-blue-100">
            ID: {variant.id}
          </span>
        </div>
        <IconButton size="small">{isOpen ? <ExpandLess /> : <ExpandMore />}</IconButton>
      </div>

      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-8">
          <div>
            <Typography variant="subtitle2" className="font-bold text-slate-700 mb-4">
              General Info
            </Typography>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-center">
              <TextField name="id" label="Variant ID" fullWidth value={variant.id} disabled />
              {attributes.map((attr) => (
                <TextField
                  key={`variant-${index}-attr-${attr.id}`}
                  select
                  label={attr.name}
                  fullWidth
                  value={variant.attributeValueIds[attr.id] || ""}
                  onChange={(e) =>
                    handleVariantAttributeChange(index, attr.id, Number(e.target.value))
                  }
                >
                  {attr.values.map((val: any) => (
                    <MenuItem key={val.id} value={val.id}>
                      {attr.name === "Color" && val.hexCode ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: val.hexCode }}
                          ></div>
                          {val.value}
                        </div>
                      ) : (
                        val.value
                      )}
                    </MenuItem>
                  ))}
                </TextField>
              ))}
              <TextField
                name="price"
                label="Rent Price"
                sx={{
                  "& .MuiInputLabel-root": { color: "blue" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "blue" },
                }}
                type="number"
                fullWidth
                value={variant.price}
                onChange={(e) => handleVariantChange(index, "price", Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
              />
              <TextField
                name="quantity"
                label="Quantity"
                sx={{
                  "& .MuiInputLabel-root": { color: "blue" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "blue" },
                }}
                type="number"
                fullWidth
                value={variant.quantity}
                onChange={(e) => handleVariantChange(index, "quantity", Number(e.target.value))}
              />

              {index > 0 && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => removeVariant(index)}
                  sx={{ minWidth: "120px", height: "56px" }}
                >
                  <DeleteForeverIcon className="mr-1" /> Remove
                </Button>
              )}
            </div>
          </div>

          <PurchaseHistorySection
            originalMSRP={variant.originalMSRP}
            originalPurchaseDate={
              variant.originalPurchaseDate
                ? new Date(variant.originalPurchaseDate).toISOString().split("T")[0]
                : ""
            }
            condition={variant.condition}
            onChange={(field, value) => handleVariantChange(index, field, value)}
          />

          <div>
            <Typography variant="subtitle2" className="font-bold text-slate-700 mb-4">
              Repair & Replacement Setup
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <TextField
                name="replacementCost"
                label="Replacement Cost"
                type="number"
                fullWidth
                value={replacementCost === 0 ? "" : replacementCost}
                error={variant.originalMSRP > 0 && replacementCost > variant.originalMSRP}
                helperText={
                  variant.originalMSRP > 0 && replacementCost > variant.originalMSRP
                    ? `Cannot exceed original MSRP (₱${variant.originalMSRP})`
                    : ""
                }
                onChange={(e) =>
                  handleVariantChange(index, "replacementCost", Number(e.target.value))
                }
                sx={{
                  "& .MuiInputLabel-root": { color: "blue" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "blue" },
                }}
                InputProps={{
                  inputProps: { max: variant.originalMSRP > 0 ? variant.originalMSRP : undefined },
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
              />

              <TextField
                name="manualRepairCost"
                label="Manual Repair Cost"
                type="number"
                fullWidth
                value={variant.manualRepairCost === 0 ? "" : variant.manualRepairCost}
                onChange={(e) =>
                  handleVariantChange(index, "manualRepairCost", Number(e.target.value))
                }
                sx={{
                  "& .MuiInputLabel-root": { color: "blue" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "blue" },
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Minor Repair */}
              <TextField
                name="minorRepairCost"
                label="Minor Repair Cost"
                type="number"
                fullWidth
                value={
                  minorPolicy?.damageSeverityPercent
                    ? minorPolicy?.damageSeverityPercent * (replacementCost / 100)
                    : 0
                }
                InputProps={{
                  readOnly: true,
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
              />
              <TextField
                name="minorRepairPercent"
                label="Minor Repair %"
                type="number"
                placeholder={`${minorMin} - ${minorMax}`}
                fullWidth
                value={
                  minorPolicy?.damageSeverityPercent === 0 ? "" : minorPolicy?.damageSeverityPercent
                }
                error={
                  minorPolicy?.damageSeverityPercent < minorMin ||
                  minorPolicy?.damageSeverityPercent > minorMax
                }
                helperText={
                  minorPolicy?.damageSeverityPercent < minorMin ||
                  minorPolicy?.damageSeverityPercent > minorMax
                    ? `Value must be between ${minorMin} and ${minorMax}`
                    : ""
                }
                onChange={(e) => {
                  const clamped = Number(e.target.value)
                  handleRepairCost(index, "damageSeverityPercent", "minor", clamped)
                }}
                sx={{
                  "& .MuiInputLabel-root": { color: "blue" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "blue" },
                }}
                InputProps={{
                  inputProps: { min: minorMin, max: minorMax },
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
              {/* Moderate Repair */}
              <TextField
                name="moderateRepairCost"
                label="Moderate Repair Cost"
                type="number"
                fullWidth
                value={
                  moderatePolicy?.damageSeverityPercent
                    ? moderatePolicy?.damageSeverityPercent * (replacementCost / 100)
                    : 0
                }
                InputProps={{
                  readOnly: true,
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
              />
              <TextField
                name="moderateRepairPercent"
                label="Moderate Repair %"
                type="number"
                placeholder={`${modMin} - ${modMax}`}
                fullWidth
                value={
                  moderatePolicy?.damageSeverityPercent === 0
                    ? ""
                    : moderatePolicy?.damageSeverityPercent
                }
                error={
                  moderatePolicy?.damageSeverityPercent < modMin ||
                  moderatePolicy?.damageSeverityPercent > modMax
                }
                helperText={
                  moderatePolicy?.damageSeverityPercent < modMin ||
                  moderatePolicy?.damageSeverityPercent > modMax
                    ? `Value must be between ${modMin} and ${modMax}`
                    : ""
                }
                onChange={(e) =>
                  handleRepairCost(
                    index,
                    "damageSeverityPercent",
                    "moderate",
                    Number(e.target.value)
                  )
                }
                sx={{
                  "& .MuiInputLabel-root": { color: "blue" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "blue" },
                }}
                InputProps={{
                  inputProps: { min: modMin, max: modMax },
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
              {/* Major Repair */}
              <TextField
                name="majorRepairCost"
                label="Major Repair Cost"
                type="number"
                fullWidth
                value={
                  majorPolicy?.damageSeverityPercent
                    ? majorPolicy?.damageSeverityPercent * (replacementCost / 100)
                    : 0
                }
                InputProps={{
                  readOnly: true,
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
              />
              <TextField
                name="majorRepairPercent"
                label="Major Repair %"
                type="number"
                placeholder={`${majMin} - ${majMax}`}
                fullWidth
                value={
                  majorPolicy?.damageSeverityPercent === 0 ? "" : majorPolicy?.damageSeverityPercent
                }
                error={
                  majorPolicy?.damageSeverityPercent < majMin ||
                  majorPolicy?.damageSeverityPercent > majMax
                }
                helperText={
                  majorPolicy?.damageSeverityPercent < majMin ||
                  majorPolicy?.damageSeverityPercent > majMax
                    ? `Value must be between ${majMin} and ${majMax}`
                    : ""
                }
                onChange={(e) =>
                  handleRepairCost(index, "damageSeverityPercent", "major", Number(e.target.value))
                }
                sx={{
                  "& .MuiInputLabel-root": { color: "blue" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "blue" },
                }}
                InputProps={{
                  inputProps: { min: majMin, max: majMax },
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
              {/* Total Loss */}
              <TextField
                name="totalLossRepairCost"
                label="Total Loss Cost"
                type="number"
                fullWidth
                value={
                  totalLossPolicy?.damageSeverityPercent
                    ? totalLossPolicy?.damageSeverityPercent * (replacementCost / 100)
                    : 0
                }
                InputProps={{
                  readOnly: true,
                  startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                }}
              />
              <TextField
                name="totalLossPercent"
                label="Total Loss %"
                type="number"
                placeholder={`${totalMin} - ${totalMax}`}
                fullWidth
                value={
                  totalLossPolicy?.damageSeverityPercent === 0
                    ? ""
                    : totalLossPolicy?.damageSeverityPercent
                }
                error={
                  totalLossPolicy?.damageSeverityPercent < totalMin ||
                  totalLossPolicy?.damageSeverityPercent > totalMax
                }
                helperText={
                  totalLossPolicy?.damageSeverityPercent < totalMin ||
                  totalLossPolicy?.damageSeverityPercent > totalMax
                    ? `Value must be between ${totalMin} and ${totalMax}`
                    : ""
                }
                onChange={(e) =>
                  handleRepairCost(
                    index,
                    "damageSeverityPercent",
                    "total_loss",
                    Number(e.target.value)
                  )
                }
                sx={{
                  "& .MuiInputLabel-root": { color: "blue" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "blue" },
                }}
                InputProps={{
                  inputProps: { min: totalMin, max: totalMax },
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </Paper>
  )
})

export default EditProductVariantItem
