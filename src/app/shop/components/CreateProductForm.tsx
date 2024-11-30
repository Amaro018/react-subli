"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getCategories from "../../queries/getCategories"
import getColors from "../../queries/getColors"
import { MenuItem, TextField } from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import uploadShopBg from "../../mutations/uploadShopBg"
import createProduct from "../../mutations/createProduct"
const CreateProductForm = (props: { currentUser: any }) => {
  const currentUser = props.currentUser
  const [uploadShopBgMutation] = useMutation(uploadShopBg)
  const [formData, setFormData] = useState({
    shopId: currentUser.shop.id,
    productName: "",
    category: "",
    productDescription: "",
    deliveryOption: "",
    productImages: [],
    variants: [{ size: "", color: "", quantity: 0, price: 0 }],
  })

  const [categories] = useQuery(getCategories, null)
  const [colors] = useQuery(getColors, null)

  // Update state for individual fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle variant changes
  const handleVariantChange = (index: number, field: string, value: string | number) => {
    const updatedVariants = [...formData.variants]
    updatedVariants[index][field] = value
    setFormData((prev) => ({ ...prev, variants: updatedVariants }))
  }

  // Add a new variant
  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: "", color: "", quantity: 0, price: 0 }],
    }))
  }

  // Remove a variant
  const removeVariant = (index: number) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, variants: updatedVariants }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).map((file) => {
        const uniqueFileName = `${Date.now()}-${file.name}`
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64String = reader.result as string
          try {
            const fileUrl = await uploadShopBgMutation({
              fileName: uniqueFileName,
              data: base64String,
              targetDirectory: "products",
            })
          } catch (error) {
            console.error("file upload failed:", error)
          }
        }
        reader.readAsDataURL(file)
        return uniqueFileName
      })

      const uploadedFileName = files.map((uniqeFileName) => uniqeFileName)

      console.log(uploadedFileName)

      setFormData((prev) => ({ ...prev, productImages: uploadedFileName }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const product = await createProduct(formData)
      console.log("Product created:", product)
      alert("Product created successfully!")
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Failed to create product!")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Name, Category, and Delivery Option */}
      <div>
        <p className="text-2xl font-bold">ADDING NEW PRODUCT</p>
      </div>
      <div className="flex flex-row gap-2">
        <TextField
          required
          id="productName"
          name="productName"
          label="Product Name"
          fullWidth
          value={formData.productName}
          onChange={handleInputChange}
        />

        <TextField
          id="category"
          select
          name="category"
          label="Select Category"
          fullWidth
          value={formData.category}
          onChange={handleInputChange}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          id="deliveryOption"
          select
          name="deliveryOption"
          label="Delivery Option"
          fullWidth
          value={formData.deliveryOption}
          onChange={handleInputChange}
        >
          <MenuItem value="DELIVERY">Delivery</MenuItem>
          <MenuItem value="PICKUP">Pick Up</MenuItem>
          <MenuItem value="BOTH">Both (Pick Up or Delivery)</MenuItem>
        </TextField>
      </div>

      {/* Product Description */}
      <TextField
        required
        multiline
        rows={4}
        id="productDescription"
        name="productDescription"
        label="Product Description"
        fullWidth
        value={formData.productDescription}
        onChange={handleInputChange}
      />

      {/* Product Variants */}
      <div>
        <label className="block text-sm font-medium my-2">Product Variants</label>
        {formData.variants.map((variant, index) => (
          <div key={index} className="flex gap-2 items-center my-4">
            <TextField
              id={`variantSize-${index}`}
              select
              name="size"
              label="Size"
              fullWidth
              value={variant.size}
              onChange={(e) => handleVariantChange(index, "size", e.target.value)}
            >
              <MenuItem value="XS">Extra Small</MenuItem>
              <MenuItem value="S">Small</MenuItem>
              <MenuItem value="M">Medium</MenuItem>
              <MenuItem value="L">Large</MenuItem>
              <MenuItem value="XL">Extra Large</MenuItem>
            </TextField>

            <TextField
              id={`variantColor-${index}`}
              select
              name="color"
              label="Color"
              fullWidth
              value={variant.color}
              onChange={(e) => handleVariantChange(index, "color", e.target.value)}
            >
              {colors.map((color) => (
                <MenuItem key={color.id} value={color.name}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: color.name }}
                    ></div>
                    {color.name}
                  </div>
                </MenuItem>
              ))}
            </TextField>

            <TextField
              required
              id={`variantQuantity-${index}`}
              name="quantity"
              label="Quantity"
              type="number"
              fullWidth
              value={variant.quantity}
              onChange={(e) => handleVariantChange(index, "quantity", Number(e.target.value))}
            />

            <TextField
              required
              id={`variantPrice-${index}`}
              name="price"
              label="Price"
              type="number"
              fullWidth
              value={variant.price}
              onChange={(e) => handleVariantChange(index, "price", Number(e.target.value))}
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

        <button type="button" onClick={addVariant} className="bg-blue-500 text-white p-2 mt-2">
          Add Variant
        </button>
      </div>

      {/* Product Images */}
      <div>
        <label className="block text-sm font-medium">Product Images</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Submit Button */}
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Create Product
      </button>
    </form>
  )
}

export default CreateProductForm
