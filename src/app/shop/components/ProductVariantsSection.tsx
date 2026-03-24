import React, { useState, memo } from "react"
import {
  Paper,
  Typography,
  FormControlLabel,
  Checkbox,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  MenuItem,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Stack,
  Tooltip,
  Divider,
  ListSubheader,
  Chip,
  ListItemText,
  Grid,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material"
import { DeleteOutline, HelpOutline, Search } from "@mui/icons-material"

export type AttributeValue = {
  id: number
  value: string
  hexCode: string | null
}

export type Attribute = {
  id: number
  name: string
  values: AttributeValue[]
}

export type ProductOption = {
  id: string
  attributeId: number | ""
  values: number[]
}

export type Variant = {
  id: any
  attributeValueIds: Record<number, number>
  price: number
  quantity: number
  originalMSRP: number
  active: boolean
}

interface ProductVariantsSectionProps {
  hasVariants: boolean
  setHasVariants: (val: boolean) => void
  options: ProductOption[]
  handleAddOption: () => void
  handleRemoveOption: (index: number) => void
  handleOptionAttributeChange: (index: number, attributeId: number) => void
  handleOptionValuesChange: (index: number, values: number[]) => void
  attributes: Attribute[] | undefined
  variants: Variant[]
  handleVariantChange: (index: number, field: keyof Variant, value: any) => void
  onCreateAttribute?: (name: string) => Promise<number | undefined>
  onCreateAttributeValue?: (attributeId: number, value: string) => Promise<number | undefined>
  disabledHistory?: boolean
}

const ProductVariantsSection = memo(function ProductVariantsSection({
  hasVariants,
  setHasVariants,
  options,
  handleAddOption,
  handleRemoveOption,
  handleOptionAttributeChange,
  handleOptionValuesChange,
  attributes,
  variants,
  handleVariantChange,
  onCreateAttribute,
  onCreateAttributeValue,
  disabledHistory,
}: ProductVariantsSectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [bulkPrice, setBulkPrice] = useState<number | "">("")
  const [bulkQuantity, setBulkQuantity] = useState<number | "">("")
  const [bulkMSRP, setBulkMSRP] = useState<number | "">("")
  const [bulkFilter, setBulkFilter] = useState<number | "ALL">("ALL")

  const selectedFilterName = React.useMemo(() => {
    if (bulkFilter === "ALL") return "All"
    for (const opt of options) {
      if (opt.values.includes(bulkFilter)) {
        const attr = attributes?.find((a) => a.id === opt.attributeId)
        const val = attr?.values.find((v) => v.id === bulkFilter)
        if (val) return val.value
      }
    }
    return "Selected"
  }, [bulkFilter, options, attributes])

  const applyBulkPrice = () => {
    if (bulkPrice === "") return
    variants.forEach((v, idx) => {
      if (!v.active) return
      if (bulkFilter !== "ALL" && !Object.values(v.attributeValueIds).includes(bulkFilter)) return
      handleVariantChange(idx, "price", Number(bulkPrice))
    })
    setBulkPrice("")
  }

  const applyBulkMSRP = () => {
    if (bulkMSRP === "") return
    variants.forEach((v, idx) => {
      if (!v.active) return
      if (bulkFilter !== "ALL" && !Object.values(v.attributeValueIds).includes(bulkFilter)) return
      const isLocked = disabledHistory && typeof v.id === "number"
      if (!isLocked) handleVariantChange(idx, "originalMSRP", Number(bulkMSRP))
    })
    setBulkMSRP("")
  }

  const applyBulkQuantity = () => {
    if (bulkQuantity === "") return
    variants.forEach((v, idx) => {
      if (!v.active) return
      if (bulkFilter !== "ALL" && !Object.values(v.attributeValueIds).includes(bulkFilter)) return
      handleVariantChange(idx, "quantity", Number(bulkQuantity))
    })
    setBulkQuantity("")
  }

  const [attributeDialogOpen, setAttributeDialogOpen] = useState(false)
  const [newAttributeName, setNewAttributeName] = useState("")
  const [valueDialogOpen, setValueDialogOpen] = useState(false)
  const [newValueName, setNewValueName] = useState("")
  const [activeOptionIndex, setActiveOptionIndex] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Stack spacing={4}>
        <div className="flex items-center justify-between">
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Variants & Options
            </Typography>
            <Tooltip
              title="Enable if this product has different versions, like sizes, colors, or materials."
              arrow
            >
              <HelpOutline sx={{ color: "text.disabled", fontSize: 20, cursor: "help" }} />
            </Tooltip>
          </Stack>
          <FormControlLabel
            control={
              <Switch
                checked={hasVariants}
                onChange={(e) => setHasVariants(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2" fontWeight="medium">
                Enable Variants
              </Typography>
            }
          />
        </div>

        {variants.length > 0 && (
          <Box sx={{ p: 2.5, bgcolor: "#f8fafc", borderRadius: 2, border: "1px solid #e2e8f0" }}>
            <Box
              sx={{
                mb: 2.5,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                {hasVariants ? "Bulk Apply Values to Variants" : "Pricing & Inventory"}
              </Typography>
              {hasVariants && options.some((o) => o.attributeId && o.values.length > 0) && (
                <TextField
                  select
                  size="small"
                  label="Apply To"
                  value={bulkFilter}
                  onChange={(e) =>
                    setBulkFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))
                  }
                  sx={{ minWidth: 200, bgcolor: "white" }}
                >
                  <MenuItem value="ALL" sx={{ fontWeight: "bold" }}>
                    All Active Variants
                  </MenuItem>
                  {options
                    .filter((o) => o.attributeId && o.values.length > 0)
                    .map((opt) => {
                      const attr = attributes?.find((a) => a.id === opt.attributeId)
                      if (!attr) return null
                      return [
                        <ListSubheader
                          key={`header-${attr.id}`}
                          sx={{
                            lineHeight: "32px",
                            bgcolor: "grey.50",
                            fontWeight: "bold",
                            color: "primary.main",
                          }}
                        >
                          {attr.name}
                        </ListSubheader>,
                        ...opt.values.map((valId) => {
                          const val = attr.values.find((v) => v.id === valId)
                          return (
                            <MenuItem key={valId} value={valId} sx={{ pl: 4 }}>
                              {val?.value}
                            </MenuItem>
                          )
                        }),
                      ]
                    })}
                </TextField>
              )}
            </Box>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={hasVariants ? 3 : 4}>
                <TextField
                  size={hasVariants ? "small" : "medium"}
                  fullWidth
                  label={hasVariants ? "Retail Price to apply" : "Retail Price (New)"}
                  type="number"
                  required={!hasVariants}
                  disabled={!hasVariants && disabledHistory && typeof variants[0]?.id === "number"}
                  value={
                    hasVariants
                      ? bulkMSRP
                      : variants[0]?.originalMSRP === 0
                      ? ""
                      : variants[0]?.originalMSRP
                  }
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val >= 0) {
                      if (hasVariants) setBulkMSRP(e.target.value ? val : "")
                      else handleVariantChange(0, "originalMSRP", val)
                    }
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                  inputProps={{ min: 1 }}
                  sx={{ bgcolor: "white" }}
                />
              </Grid>
              <Grid item xs={12} sm={hasVariants ? 3 : 4}>
                <TextField
                  size={hasVariants ? "small" : "medium"}
                  fullWidth
                  label={hasVariants ? "Rent Price to apply" : "Rent Price"}
                  type="number"
                  required={!hasVariants}
                  value={
                    hasVariants ? bulkPrice : variants[0]?.price === 0 ? "" : variants[0]?.price
                  }
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val >= 0) {
                      if (hasVariants) setBulkPrice(e.target.value ? val : "")
                      else handleVariantChange(0, "price", val)
                    }
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                  inputProps={{ min: 1 }}
                  sx={{ bgcolor: "white" }}
                />
              </Grid>
              <Grid item xs={12} sm={hasVariants ? 3 : 4}>
                <TextField
                  size={hasVariants ? "small" : "medium"}
                  fullWidth
                  label={hasVariants ? "Quantity to apply" : "Total Quantity"}
                  type="number"
                  required={!hasVariants}
                  value={
                    hasVariants
                      ? bulkQuantity
                      : variants[0]?.quantity === 0
                      ? ""
                      : variants[0]?.quantity
                  }
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    if (val >= 0) {
                      if (hasVariants) setBulkQuantity(e.target.value ? val : "")
                      else handleVariantChange(0, "quantity", val)
                    }
                  }}
                  inputProps={{ min: 1 }}
                  sx={{ bgcolor: "white" }}
                />
              </Grid>
              {hasVariants && (
                <Grid item xs={12} sm={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={bulkPrice === "" && bulkQuantity === "" && bulkMSRP === ""}
                    onClick={() => {
                      applyBulkPrice()
                      applyBulkQuantity()
                      applyBulkMSRP()
                    }}
                    sx={{
                      textTransform: "none",
                      boxShadow: "none",
                      height: 40,
                      fontWeight: "bold",
                    }}
                  >
                    Apply to {selectedFilterName}
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>
        )}

        {hasVariants && (
          <Stack spacing={3}>
            {options.map((option, index) => (
              <Box
                key={option.id}
                sx={{ p: 2.5, border: "1px solid #e2e8f0", borderRadius: 2, bgcolor: "#fafafa" }}
              >
                <Grid container spacing={2} alignItems="flex-start">
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      label="Option (e.g., Color)"
                      required
                      value={option.attributeId}
                      onChange={(e) => {
                        if (e.target.value === "NEW_ATTRIBUTE") {
                          setActiveOptionIndex(index)
                          setNewAttributeName(searchTerm)
                          setAttributeDialogOpen(true)
                          setSearchTerm("")
                        } else {
                          handleOptionAttributeChange(index, Number(e.target.value))
                        }
                      }}
                      SelectProps={{
                        onClose: () => setSearchTerm(""),
                      }}
                    >
                      <ListSubheader sx={{ bgcolor: "white" }}>
                        <TextField
                          size="small"
                          autoFocus
                          placeholder="Search..."
                          fullWidth
                          InputProps={{
                            startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />,
                          }}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => e.key !== "Escape" && e.stopPropagation()}
                        />
                      </ListSubheader>
                      {attributes
                        ?.filter((a) => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((attr) => (
                          <MenuItem
                            key={attr.id}
                            value={attr.id}
                            disabled={options.some(
                              (o, i) => i !== index && o.attributeId === attr.id
                            )}
                          >
                            {attr.name}
                          </MenuItem>
                        ))}
                      <Divider />
                      <MenuItem
                        value="NEW_ATTRIBUTE"
                        sx={{ color: "primary.main", fontWeight: "bold" }}
                      >
                        + Create New Option
                      </MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={7}>
                    <TextField
                      select
                      size="small"
                      fullWidth
                      label="Values"
                      required
                      disabled={!option.attributeId}
                      SelectProps={{
                        multiple: true,
                        renderValue: (selected: any) => {
                          const selectedIds = selected as number[]
                          const limit = 3
                          const visibleIds = selectedIds.slice(0, limit)
                          const hiddenCount = selectedIds.length - limit

                          return (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {visibleIds.map((valId) => {
                                const attr = attributes?.find((a) => a.id === option.attributeId)
                                const val = attr?.values.find((v) => v.id === valId)
                                return (
                                  <Chip
                                    key={valId}
                                    label={val?.value}
                                    size="small"
                                    variant="outlined"
                                  />
                                )
                              })}
                              {hiddenCount > 0 && (
                                <Chip
                                  label={`+${hiddenCount} more`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontWeight: "bold" }}
                                />
                              )}
                            </Box>
                          )
                        },
                      }}
                      value={option.values}
                      onChange={(e) => {
                        const val = e.target.value
                        const valArray = typeof val === "string" ? val.split(",") : (val as any[])
                        if (valArray.includes("NEW_VALUE")) {
                          setActiveOptionIndex(index)
                          setNewValueName(searchTerm)
                          setValueDialogOpen(true)
                          setSearchTerm("")
                        } else {
                          handleOptionValuesChange(index, valArray.map(Number))
                        }
                      }}
                    >
                      <ListSubheader sx={{ bgcolor: "white" }}>
                        <TextField
                          size="small"
                          autoFocus
                          placeholder="Search values..."
                          fullWidth
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => e.key !== "Escape" && e.stopPropagation()}
                        />
                      </ListSubheader>
                      {attributes
                        ?.find((a) => a.id === option.attributeId)
                        ?.values.filter((v) =>
                          v.value.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((val) => (
                          <MenuItem key={val.id} value={val.id}>
                            <Checkbox checked={option.values.indexOf(val.id) > -1} size="small" />
                            <ListItemText primary={val.value} />
                          </MenuItem>
                        ))}
                      <Divider />
                      <MenuItem
                        value="NEW_VALUE"
                        sx={{ color: "primary.main", fontWeight: "bold" }}
                      >
                        + Create New Value
                      </MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={1} sx={{ display: "flex", justifyContent: "center" }}>
                    <IconButton color="error" onClick={() => handleRemoveOption(index)}>
                      <DeleteOutline />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              variant="text"
              onClick={handleAddOption}
              fullWidth
              sx={{
                border: "2px dashed #e2e8f0",
                py: 1.5,
                textTransform: "none",
                fontWeight: "bold",
                color: "text.secondary",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: "primary.50",
                  color: "primary.main",
                },
              }}
            >
              + Add Option (Color, Size, Pack, etc.)
            </Button>

            <TableContainer
              className="scrollbar-seamless"
              sx={{ border: "1px solid #e2e8f0", borderRadius: 2 }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={{ bgcolor: "white", pl: 2, py: 1.5 }}>
                      <Tooltip title="Check/Uncheck All">
                        <Checkbox
                          size="small"
                          color="primary"
                          checked={variants.length > 0 && variants.every((v) => v.active)}
                          indeterminate={
                            variants.some((v) => v.active) && !variants.every((v) => v.active)
                          }
                          onChange={(e) => {
                            const checked = e.target.checked
                            variants.forEach((_, idx) =>
                              handleVariantChange(idx, "active", checked)
                            )
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", bgcolor: "white", py: 1.5 }}>
                      Variant
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: "bold", bgcolor: "white", py: 1.5, width: 200 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 0.5,
                        }}
                      >
                        <span>
                          Retail Price (New){" "}
                          <Typography component="span" color="error">
                            *
                          </Typography>
                        </span>
                        <Tooltip
                          title="The original price paid when bought new. This is used to calculate the item's depreciated fair value for damage protection."
                          arrow
                          placement="top"
                        >
                          <HelpOutline
                            sx={{ color: "text.disabled", fontSize: 16, cursor: "help" }}
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: "bold", bgcolor: "white", py: 1.5, width: 150 }}
                    >
                      Rent Price{" "}
                      <Typography component="span" color="error">
                        *
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: "bold", bgcolor: "white", py: 1.5, width: 120, pr: 2 }}
                    >
                      Qty{" "}
                      <Typography component="span" color="error">
                        *
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variants.map((variant, index) => {
                    const variantName =
                      Object.entries(variant.attributeValueIds)
                        .map(([attrId, valId]) => {
                          const attr = attributes?.find((a) => a.id === Number(attrId))
                          return attr?.values.find((v) => v.id === valId)?.value
                        })
                        .filter(Boolean)
                        .join(" / ") || "Default Config"

                    const isPriceCustom = index > 0 && variant.price !== variants[0]?.price
                    const isMSRPCustom =
                      index > 0 && variant.originalMSRP !== variants[0]?.originalMSRP
                    const isQtyCustom = index > 0 && variant.quantity !== variants[0]?.quantity

                    return (
                      <TableRow
                        key={variant.id}
                        sx={{
                          opacity: variant.active ? 1 : 0.6,
                          bgcolor: variant.active ? "inherit" : "#f8fafc",
                          "& td": { borderColor: "#f1f5f9" },
                        }}
                      >
                        <TableCell padding="checkbox" sx={{ pl: 2, py: 1.5 }}>
                          <Checkbox
                            size="small"
                            checked={variant.active}
                            color="primary"
                            onChange={(e) => handleVariantChange(index, "active", e.target.checked)}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontWeight: "medium" }}>{variantName}</TableCell>
                        <TableCell align="right">
                          <Tooltip
                            title={
                              disabledHistory && typeof variant.id === "number"
                                ? "Locked (Rental History)"
                                : isMSRPCustom
                                ? "Custom Retail Price"
                                : ""
                            }
                            placement="top"
                            arrow
                            disableHoverListener={
                              !(disabledHistory && typeof variant.id === "number") && !isMSRPCustom
                            }
                          >
                            <span>
                              <TextField
                                fullWidth
                                disabled={
                                  !variant.active ||
                                  (disabledHistory && typeof variant.id === "number")
                                }
                                size="small"
                                type="number"
                                required={variant.active}
                                value={variant.originalMSRP === 0 ? "" : variant.originalMSRP}
                                onChange={(e) => {
                                  const val = Number(e.target.value)
                                  if (val >= 0) handleVariantChange(index, "originalMSRP", val)
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">₱</InputAdornment>
                                  ),
                                }}
                                inputProps={{ min: 1 }}
                                sx={{
                                  bgcolor:
                                    isMSRPCustom &&
                                    variant.active &&
                                    !(disabledHistory && typeof variant.id === "number")
                                      ? "#f0f9ff"
                                      : "white",
                                  "& fieldset": {
                                    borderColor:
                                      isMSRPCustom &&
                                      variant.active &&
                                      !(disabledHistory && typeof variant.id === "number")
                                        ? "#7dd3fc"
                                        : "#e2e8f0",
                                  },
                                }}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip
                            title="Custom Rent Price"
                            placement="top"
                            arrow
                            disableHoverListener={!isPriceCustom}
                          >
                            <span>
                              <TextField
                                fullWidth
                                disabled={!variant.active}
                                size="small"
                                type="number"
                                required={variant.active}
                                value={variant.price === 0 ? "" : variant.price}
                                onChange={(e) => {
                                  const val = Number(e.target.value)
                                  if (val >= 0) handleVariantChange(index, "price", val)
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">₱</InputAdornment>
                                  ),
                                }}
                                inputProps={{ min: 1 }}
                                sx={{
                                  bgcolor: isPriceCustom && variant.active ? "#f0f9ff" : "white",
                                  "& fieldset": {
                                    borderColor:
                                      isPriceCustom && variant.active ? "#7dd3fc" : "#e2e8f0",
                                  },
                                }}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip
                            title="Custom Quantity"
                            placement="top"
                            arrow
                            disableHoverListener={!isQtyCustom}
                          >
                            <span>
                              <TextField
                                fullWidth
                                disabled={!variant.active}
                                size="small"
                                type="number"
                                required={variant.active}
                                value={variant.quantity === 0 ? "" : variant.quantity}
                                onChange={(e) => {
                                  const val = Number(e.target.value)
                                  if (val >= 0) handleVariantChange(index, "quantity", val)
                                }}
                                inputProps={{ min: 1 }}
                                sx={{
                                  bgcolor: isQtyCustom && variant.active ? "#f0f9ff" : "white",
                                  "& fieldset": {
                                    borderColor:
                                      isQtyCustom && variant.active ? "#7dd3fc" : "#e2e8f0",
                                  },
                                }}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}

        {/* CREATION DIALOGS */}
        <Dialog
          open={attributeDialogOpen}
          onClose={() => !isCreating && setAttributeDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>Add New Option</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Option Name (e.g., Packaging, Material)"
              fullWidth
              variant="outlined"
              value={newAttributeName}
              onChange={(e) => setNewAttributeName(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setAttributeDialogOpen(false)}
              disabled={isCreating}
              color="inherit"
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!newAttributeName.trim() || activeOptionIndex === null || !onCreateAttribute)
                  return
                setIsCreating(true)
                try {
                  const newId = await onCreateAttribute(newAttributeName.trim())
                  if (newId) handleOptionAttributeChange(activeOptionIndex, newId)
                  setAttributeDialogOpen(false)
                  setNewAttributeName("")
                  setActiveOptionIndex(null)
                } finally {
                  setIsCreating(false)
                }
              }}
              variant="contained"
              disabled={!newAttributeName.trim() || isCreating}
              sx={{ textTransform: "none", boxShadow: "none" }}
            >
              {isCreating ? "Saving..." : "Save Option"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={valueDialogOpen}
          onClose={() => !isCreating && setValueDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ pb: 1 }}>Add New Value</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Value Name (e.g., Pack of 5)"
              fullWidth
              variant="outlined"
              value={newValueName}
              onChange={(e) => setNewValueName(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setValueDialogOpen(false)}
              disabled={isCreating}
              color="inherit"
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!newValueName.trim() || activeOptionIndex === null || !onCreateAttributeValue)
                  return
                const attrId = options[activeOptionIndex]?.attributeId
                if (!attrId) return
                setIsCreating(true)
                try {
                  const newId = await onCreateAttributeValue(Number(attrId), newValueName.trim())
                  if (newId)
                    handleOptionValuesChange(activeOptionIndex, [
                      ...options[activeOptionIndex]!.values,
                      newId,
                    ])
                  setValueDialogOpen(false)
                  setNewValueName("")
                  setActiveOptionIndex(null)
                } finally {
                  setIsCreating(false)
                }
              }}
              variant="contained"
              disabled={!newValueName.trim() || isCreating}
              sx={{ textTransform: "none", boxShadow: "none" }}
            >
              {isCreating ? "Saving..." : "Save Value"}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Paper>
  )
})

export default ProductVariantsSection
