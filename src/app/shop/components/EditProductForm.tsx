import React, { useState, useEffect } from "react"
import { TextField, MenuItem, Button, CircularProgress } from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"

type Variant = {
  id: string
  color: string
  price: number
  stock: number
}

type Product = {
  productName: string
  status: string
  deliveryOption: string
  category: string
  variants: Variant[]
}

const EditProductForm = (props: { currentUser: Product; handleCloseEdit: () => void }) => {
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
          name="productName"
          label="Product Name"
          fullWidth
          value={formData.productName}
          onChange={handleInputChange}
        />

        <TextField
          name="category"
          label="Category"
          select
          fullWidth
          value={formData.category}
          onChange={handleInputChange}
        >
          {/* Replace with dynamic categories */}
          <MenuItem value="category1">Category 1</MenuItem>
          <MenuItem value="category2">Category 2</MenuItem>
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
          <MenuItem value="ACTIVE">Active</MenuItem>
          <MenuItem value="INACTIVE">Inactive</MenuItem>
        </TextField>
      </div>

      <div>
        <label className="block text-sm font-medium my-2">Product Variants</label>
        {/* {formData.variants.map((variant, index) => (
          <div key={index} className="flex gap-2 items-center my-4">
            <TextField
              name="id"
              label="Variant ID"
              fullWidth
              value={variant.id}
              disabled
            />
            <TextField
              name="color"
              label="Color"
              fullWidth
              value={variant.color}
              onChange={(e) =>
                handleVariantChange(index, "color", e.target.value)
              }
            />
            <TextField
              name="price"
              label="Price"
              type="number"
              fullWidth
              value={variant.price}
              onChange={(e) =>
                handleVariantChange(index, "price", Number(e.target.value))
              }
            />
            <TextField
              name="stock"
              label="Stock"
              type="number"
              fullWidth
              value={variant.stock}
              onChange={(e) =>
                handleVariantChange(index, "stock", Number(e.target.value))
              }
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
        ))} */}
      </div>

      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? <CircularProgress size={20} /> : "Update Product"}
      </Button>
    </form>
  )
}

export default EditProductForm
