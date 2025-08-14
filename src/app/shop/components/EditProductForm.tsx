import React, { useState, useEffect } from "react"
import { TextField, MenuItem, Button, CircularProgress } from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { useQuery } from "@blitzjs/rpc"
import getColors from "../../queries/getColors"
import getCategories from "../../queries/getCategories"

import { InputAdornment } from "@mui/material"

type Color = {
  id: string
  name: string
}

type Category = {
  id: string
  name: string
}

type Variant = {
  id: string
  color: Color
  price: number
  quantity: number
}

type Product = {
  name: string
  status: string
  deliveryOption: string
  category: Category
  variants: Variant[]
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
    updatedVariants[index][key] = value as never
    setFormData({ ...formData, variants: updatedVariants })
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
        {formData.variants.map((variant, index) => (
          <div key={variant.id ?? `variant-${index}`} className="border p-4 rounded-md my-4">
            <div className="flex gap-2 items-center mb-4">
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
                  <MenuItem key={color.id ?? color.name} value={color.name}>
                    {color.name}
                  </MenuItem>
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
              />
              {/* Minor Repair */}
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  name="minorRepairCost"
                  label="Minor Repair Cost"
                  type="number"
                  fullWidth
                  value={
                    variant.damagePolicies?.find((p) => p.damageSeverity === "minor")
                      .damageSeverityPercent * (variant.replacementCost / 100).toFixed(2) || ""
                  }
                  onChange={(e) =>
                    handleVariantChange(index, "minorRepairCost", Number(e.target.value))
                  }
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                  }}
                />
                <TextField
                  name="minorRepairPercent"
                  label="Minor Repair %"
                  type="number"
                  placeholder="10 - 29"
                  fullWidth
                  value={
                    variant.damagePolicies?.find((p) => p.damageSeverity === "minor")
                      .damageSeverityPercent || ""
                  }
                  onChange={(e) =>
                    handleVariantChange(index, "minorRepairPercent", Number(e.target.value))
                  }
                />
              </div>

              {/* Moderate Repair */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <TextField
                  name="moderateRepairCost"
                  label="Moderate Repair Cost"
                  type="number"
                  fullWidth
                  value={
                    variant.damagePolicies?.find((p) => p.damageSeverity === "moderate")
                      .damageSeverityPercent * (variant.replacementCost / 100).toFixed(2) || ""
                  }
                  onChange={(e) =>
                    handleVariantChange(index, "moderateRepairCost", Number(e.target.value))
                  }
                />
                <TextField
                  name="moderateRepairPercent"
                  label="Moderate Repair %"
                  type="number"
                  placeholder="30 - 59"
                  fullWidth
                  value={
                    variant.damagePolicies?.find((p) => p.damageSeverity === "moderate")
                      .damageSeverityPercent || ""
                  }
                  onChange={(e) =>
                    handleVariantChange(index, "moderateRepairPercent", Number(e.target.value))
                  }
                />
              </div>

              {/* Major Repair */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                <TextField
                  name="majorRepairCost"
                  label="Major Repair Cost"
                  type="number"
                  fullWidth
                  value={
                    variant.damagePolicies?.find((p) => p.damageSeverity === "major")
                      .damageSeverityPercent * (variant.replacementCost / 100).toFixed(2) || ""
                  }
                  onChange={(e) =>
                    handleVariantChange(index, "majorRepairCost", Number(e.target.value))
                  }
                />
                <TextField
                  name="majorRepairPercent"
                  label="Major Repair %"
                  type="number"
                  placeholder="60 - 75"
                  fullWidth
                  value={
                    variant.damagePolicies?.find((p) => p.damageSeverity === "major")
                      .damageSeverityPercent || ""
                  }
                  onChange={(e) =>
                    handleVariantChange(index, "majorRepairPercent", Number(e.target.value))
                  }
                />
              </div>
            </div>
          </div>
        ))}
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
