import React, { memo } from "react"
import { Paper, Typography, TextField, MenuItem, Stack, Box, Tooltip } from "@mui/material"

// Note: Ensure this matches the Category definition in your CreateProductForm file
interface Category {
  id: number
  name: string
}

interface ProductBasicInfoSectionProps {
  name: string
  categoryId: number
  description: string
  deliveryOption: string
  categories: Category[] | undefined
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  disabledCategory?: boolean
}

const ProductBasicInfoSection = memo(function ProductBasicInfoSection({
  name,
  categoryId,
  description,
  deliveryOption,
  categories,
  onChange,
  disabledCategory,
}: ProductBasicInfoSectionProps) {
  // Find the selected category to provide immediate context
  const selectedCategory = categories?.find((c) => c.id === categoryId)

  return (
    <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
      <Stack spacing={4}>
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Basic Information
        </Typography>

        <Stack spacing={3}>
          {/* PRODUCT TITLE */}
          <TextField
            required
            fullWidth
            id="name"
            name="name"
            label="Product Title"
            placeholder="e.g., Canon EOS R5 (Body Only) + 2 Batteries"
            variant="outlined"
            value={name}
            onChange={onChange}
            inputProps={{ maxLength: 100 }}
            helperText={`${name?.length || 0}/100 characters`}
            FormHelperTextProps={{
              sx: { textAlign: "right" },
            }}
          />

          {/* CATEGORY SELECTION */}
          <Tooltip
            title={
              disabledCategory ? "Cannot be changed because this product has rental history." : ""
            }
            placement="top-start"
            arrow
          >
            <div style={{ width: "100%" }}>
              <TextField
                id="categoryid"
                select
                required
                name="categoryid"
                label="Category"
                fullWidth
                variant="outlined"
                value={categoryId || ""}
                onChange={onChange}
                disabled={disabledCategory}
                helperText={
                  disabledCategory
                    ? "Category cannot be changed because this product has rental history."
                    : selectedCategory
                    ? `Standard protection policies for ${selectedCategory.name} will be applied.`
                    : "Select a category to see applicable rental policies."
                }
              >
                {categories?.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            </div>
          </Tooltip>

          {/* DELIVERY OPTION */}
          <TextField
            id="deliveryOption"
            select
            required
            name="deliveryOption"
            label="Delivery Option"
            fullWidth
            variant="outlined"
            value={deliveryOption || "DELIVERY"}
            onChange={onChange}
            helperText="Choose how this item can be handed over to the renter."
          >
            <MenuItem value="DELIVERY">Delivery</MenuItem>
            <MenuItem value="PICKUP">Pick Up</MenuItem>
            <MenuItem value="BOTH">Both (Pick Up or Delivery)</MenuItem>
          </TextField>

          {/* DESCRIPTION */}
          <Box>
            <TextField
              required
              fullWidth
              multiline
              rows={5}
              id="productDescription"
              name="description"
              label="Description"
              placeholder="Help renters by describing:&#10;- Current condition (scuffs, wear)&#10;- Key features (4K video, bluetooth)&#10;- Everything included (cases, cables, adapters)"
              variant="outlined"
              value={description}
              onChange={onChange}
              inputProps={{ maxLength: 2000 }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5, px: 1.5 }}>
              <Typography variant="caption" color="text.secondary">
                Be detailed to reduce questions from renters.
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {description?.length || 0}/2000 characters
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  )
})

export default ProductBasicInfoSection
