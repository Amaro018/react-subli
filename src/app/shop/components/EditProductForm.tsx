import React, { useState, useEffect } from "react"
import { TextField, MenuItem, Button, CircularProgress } from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { useQuery } from "@blitzjs/rpc"
import getColors from "../../queries/getColors"
import getCategories from "../../queries/getCategories"

import updateProduct from "../../mutations/updateProduct"

import { InputAdornment } from "@mui/material"
import AccountCircle from "@mui/icons-material/AccountCircle"
import Email from "@mui/icons-material/Email"
import Clear from "@mui/icons-material/Clear"
import Visibility from "@mui/icons-material/Visibility"

type Color = {
  id: number
  name: string
  hexCode: string
  createdAt: Date
  updatedAt: Date
}

type Category = {
  id: string
  name: string
}

type Variant = {
  id: string
  color: Color
  colorId: number
  price: number
  quantity: number
  replacementCost: number
  manualRepairCost: number
  damagePolicies: DamagePolicies[]
}

type DamagePolicies = {
  id: number
  damageSeverity: string
  damageSeverityPercent: number
}

type Product = {
  name: string
  status: string
  deliveryOption: string
  category: Category
  variants: Variant[]
}

const repairPercentRanges: Record<string, { min: number; max: number }> = {
  minor: { min: 10, max: 29 },
  moderate: { min: 30, max: 59 },
  major: { min: 60, max: 75 },
  // veryMajor: { min: 76, max: 90 },
  // replacement: { min: 91, max: 100 },
}

const EditProductForm = (props: { currentUser: Product; handleCloseEdit: () => void }) => {
  const [colors] = useQuery(getColors, null)
  const [categories] = useQuery(getCategories, null)

  const [formData, setFormData] = useState<Product>(props.currentUser)
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleVariantChange = (index: number, key: keyof Variant, value: string | number) => {
    const updatedVariants = [...formData.variants]

    if (key === "color") {
      const selectedColor = colors.find((c) => c.id === value)
      if (selectedColor) {
        updatedVariants[index].color = selectedColor
        updatedVariants[index].colorId = selectedColor.id
      }
    } else {
      updatedVariants[index][key] = value as never
    }

    setFormData({ ...formData, variants: updatedVariants })
  }

  const handleRepairCost = (
    index: number,
    key: keyof DamagePolicies,
    severity: string,
    value: number
  ) => {
    setFormData({
      ...formData,
      variants: formData.variants.map((variant, i) =>
        i === index
          ? {
              ...variant,
              damagePolicies: variant.damagePolicies.map((policy) =>
                policy.damageSeverity === severity ? { ...policy, [key]: value } : policy
              ),
            }
          : variant
      ),
    })

    console.log(formData)
  }

  const removeVariant = (index: number) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index)
    setFormData({ ...formData, variants: updatedVariants })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // your update logic here
      const product = await updateProduct(formData)
      console.log("Product updated:", product)
      console.log("Submitting edited product:", formData)
      props.handleCloseEdit()
    } catch (error) {
      console.error("Edit failed", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-2xl font-bold">EDIT PRODUCT</p>

      <div className="flex flex-row gap-2">
        <TextField
          required
          name="name"
          label="Product Name"
          fullWidth
          value={formData.name}
          onChange={handleInputChange}
        />

        <TextField
          name="category"
          label="Category"
          select
          fullWidth
          value={formData.category.name}
          onChange={handleInputChange}
        >
          {/* Replace with dynamic categories */}
          {categories.map((category) => (
            <MenuItem key={category.id ?? category.name} value={category.name}>
              {category.name}
            </MenuItem>
          ))}
          {/* <MenuItem value="Electronics">Electronics</MenuItem>
          <MenuItem value="Fashion">Fashion</MenuItem>
          <MenuItem value="Home & Garden">Home & Garden</MenuItem>
          <MenuItem value="Sports">Sports</MenuItem>
          <MenuItem value="Books">Books</MenuItem> */}
        </TextField>

        <TextField
          name="deliveryOption"
          label="Delivery Option"
          select
          fullWidth
          value={formData.deliveryOption}
          onChange={handleInputChange}
        >
          <MenuItem value="DELIVERY">Delivery</MenuItem>
          <MenuItem value="PICKUP">Pick Up</MenuItem>
          <MenuItem value="BOTH">Both</MenuItem>
        </TextField>

        <TextField
          name="status"
          label="Status"
          select
          fullWidth
          value={formData.status}
          onChange={handleInputChange}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </div>

      <div>
        <label className="block text-sm font-medium my-2">Product Variants</label>
        {formData.variants.map((variant, index) => {
          const minorPolicy = variant.damagePolicies?.find((p) => p.damageSeverity === "minor")
          const moderatePolicy = variant.damagePolicies?.find(
            (p) => p.damageSeverity === "moderate"
          )
          const majorPolicy = variant.damagePolicies?.find((p) => p.damageSeverity === "major")

          return (
            <div key={variant.id ?? `variant-${index}`} className="border p-4 rounded-md my-4">
              <div className="flex gap-2 items-center mb-4">
                <TextField name="id" label="Variant ID" fullWidth value={variant.id} disabled />
                <TextField
                  name="color"
                  label="Color"
                  sx={{
                    "& .MuiInputLabel-root": { color: "blue" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                  }}
                  select
                  fullWidth
                  value={variant.color.id}
                  onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                >
                  {colors.map((color) => (
                    <MenuItem key={color.id} value={color.id}>
                      {color.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  name="price"
                  label="Price"
                  sx={{
                    "& .MuiInputLabel-root": { color: "blue" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                  }}
                  type="number"
                  fullWidth
                  value={variant.price}
                  onChange={(e) => handleVariantChange(index, "price", Number(e.target.value))}
                />
                <TextField
                  name="quantity"
                  label="Quantity"
                  sx={{
                    "& .MuiInputLabel-root": { color: "blue" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                  }}
                  type="number"
                  fullWidth
                  value={variant.quantity}
                  onChange={(e) => handleVariantChange(index, "quantity", Number(e.target.value))}
                />

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="bg-red-500 text-white p-2 rounded"
                  >
                    <DeleteForeverIcon />
                  </button>
                )}
              </div>

              {/* New section for repair & replacement costs */}
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  name="replacementCost"
                  label="Replacement Cost"
                  type="number"
                  fullWidth
                  value={variant.replacementCost || ""}
                  onChange={(e) =>
                    handleVariantChange(index, "replacementCost", Number(e.target.value))
                  }
                  sx={{
                    "& .MuiInputLabel-root": { color: "blue" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />

                <TextField
                  name="manualRepairCost"
                  label="Manual Repair Cost"
                  type="number"
                  fullWidth
                  value={variant.manualRepairCost || ""}
                  onChange={(e) =>
                    handleVariantChange(index, "manualRepairCost", Number(e.target.value))
                  }
                  sx={{
                    "& .MuiInputLabel-root": { color: "blue" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />

                {/* Minor Repair */}
                <TextField
                  name="minorRepairCost"
                  label="Minor Repair Cost"
                  type="number"
                  fullWidth
                  value={
                    minorPolicy?.damageSeverityPercent *
                      (variant.replacementCost / 100).toFixed(2) || ""
                  }
                  // value={
                  //   variant.damagePolicies?.find((p) => p.damageSeverity === "minor")
                  //     .damageSeverityPercent * (variant.replacementCost / 100).toFixed(2) || ""
                  // }
                  // onChange={(e) =>
                  //   handleRepairCost(index, "minorRepairCost", Number(e.target.value))
                  // }
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />
                <TextField
                  name="minorRepairPercent"
                  label="Minor Repair %"
                  type="number"
                  placeholder="10 - 29"
                  fullWidth
                  value={minorPolicy?.damageSeverityPercent || ""}
                  // value={
                  //   variant.damagePolicies?.find((p) => p.damageSeverity === "minor")
                  //     .damageSeverityPercent || ""
                  // }
                  onChange={(e) => {
                    const raw = Number(e.target.value)
                    const { min, max } = repairPercentRanges["minor"]
                    const clamped = Math.max(min, Math.min(max, raw))
                    handleRepairCost(index, "damageSeverityPercent", "minor", clamped)
                  }}
                  sx={{
                    "& .MuiInputLabel-root": { color: "blue" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                  }}
                  InputProps={{
                    inputProps: { min: 10, max: 29 },
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
                    moderatePolicy?.damageSeverityPercent *
                      (variant.replacementCost / 100).toFixed(2) || ""
                  }
                  // value={
                  //   variant.damagePolicies?.find((p) => p.damageSeverity === "moderate")
                  //     .damageSeverityPercent * (variant.replacementCost / 100).toFixed(2) || ""
                  // }
                  // onChange={(e) =>
                  //   handleRepairCost(index, "moderateRepairCost", Number(e.target.value))
                  // }
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />
                <TextField
                  name="moderateRepairPercent"
                  label="Moderate Repair %"
                  type="number"
                  placeholder="30 - 59"
                  fullWidth
                  value={moderatePolicy?.damageSeverityPercent || ""}
                  // value={
                  //   variant.damagePolicies?.find((p) => p.damageSeverity === "moderate")
                  //     .damageSeverityPercent || ""
                  // }
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
                    "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                  }}
                  InputProps={{
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
                    majorPolicy?.damageSeverityPercent *
                      (variant.replacementCost / 100).toFixed(2) || ""
                  }
                  // value={
                  //   variant.damagePolicies?.find((p) => p.damageSeverity === "major")
                  //     .damageSeverityPercent * (variant.replacementCost / 100).toFixed(2) || ""
                  // }
                  // onChange={(e) =>
                  //   handleRepairCost(index, "majorRepairCost", Number(e.target.value))
                  // }
                  InputProps={{
                    readOnly: true,
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />
                <TextField
                  name="majorRepairPercent"
                  label="Major Repair %"
                  type="number"
                  placeholder="60 - 75"
                  fullWidth
                  value={majorPolicy?.damageSeverityPercent || ""}
                  // value={
                  //   variant.damagePolicies?.find((p) => p.damageSeverity === "major")
                  //     .damageSeverityPercent || ""
                  // }
                  onChange={(e) =>
                    handleRepairCost(
                      index,
                      "damageSeverityPercent",
                      "major",
                      Number(e.target.value)
                    )
                  }
                  sx={{
                    "& .MuiInputLabel-root": { color: "blue" },
                    "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                  }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* <div>
        <label className="block text-sm font-medium my-2">Product Variants</label>
        {formData.variants.map((variant, index) => (
          <div key={index} className="flex gap-2 items-center my-4">
            <TextField name="id" label="Variant ID" fullWidth value={variant.id} disabled />
            <TextField
              name="color"
              label="Color"
              select
              fullWidth
              value={variant.color.name}
              onChange={(e) => handleVariantChange(index, "color", e.target.value)}
            >
              {colors.map((color) => (
                <MenuItem value={color.name}>{color.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              name="price"
              label="Price"
              type="number"
              fullWidth
              value={variant.price}
              onChange={(e) => handleVariantChange(index, "price", Number(e.target.value))}
            />
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              fullWidth
              value={variant.quantity}
              onChange={(e) => handleVariantChange(index, "quantity", Number(e.target.value))}
            />

            {index > 0 && (
              <button
                type="button"
                onClick={() => removeVariant(index)}
                className="bg-red-500 text-white p-2 rounded"
              >
                <DeleteForeverIcon />
              </button>
            )}
          </div>
        ))}
      </div> */}

      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? <CircularProgress size={20} /> : "Update Product"}
      </Button>
    </form>
  )
}

export default EditProductForm
