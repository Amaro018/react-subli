import React, { useState, useEffect } from "react"
import { TextField, MenuItem, Button, CircularProgress } from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { useQuery } from "@blitzjs/rpc"
import getColors from "../../queries/getColors"
import getCategories from "../../queries/getCategories"

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
            <MenuItem value={category.name}>{category.name}</MenuItem>
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
      </div>

      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? <CircularProgress size={20} /> : "Update Product"}
      </Button>
    </form>
  )
}

export default EditProductForm
