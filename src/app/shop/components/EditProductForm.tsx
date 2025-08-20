import React, { useState, useEffect, useMemo } from "react"
import { TextField, MenuItem, Button, CircularProgress } from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getColors from "../../queries/getColors"
import getCategories from "../../queries/getCategories"

import updateProduct from "../../mutations/updateProduct"

import { Plus } from "lucide-react"
import { InputAdornment } from "@mui/material"
import AccountCircle from "@mui/icons-material/AccountCircle"
import Email from "@mui/icons-material/Email"
import Clear from "@mui/icons-material/Clear"
import Visibility from "@mui/icons-material/Visibility"
import { string } from "zod"

type Color = {
  id: number
  name: string
  hexCode: string
}

type Category = {
  id: number
  name: string
}

type Variant = {
  id: any
  color: Color
  size: string
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
  id: number
  name: string
  status: string
  description: string
  deliveryOption: string
  category: Category
  categoryid: number
  variants: Variant[]
}

const repairPercentRanges: Record<string, { min: number; max: number }> = {
  minor: { min: 10, max: 29 },
  moderate: { min: 30, max: 59 },
  major: { min: 60, max: 75 },
  // veryMajor: { min: 76, max: 90 },
  // replacement: { min: 91, max: 100 },
}

type EditProductFormProps = {
  currentUser: Product
  handleCloseEdit: () => void
  refetchProducts: () => Promise<any>
}

const EditProductForm = (props: EditProductFormProps) => {
  const [colors] = useQuery(getColors, null)
  const [categories] = useQuery(getCategories, null)

  const [formData, setFormData] = useState<Product>(props.currentUser)
  const [loading, setLoading] = useState(false)

  const [isMinorValid, setIsMinorValid] = useState(false)

  // Inside your component
  const [rowToggle, setRowToggle] = React.useState<{ [id: number]: boolean }>({})

  const [updateProductMutation] = useMutation(updateProduct)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleVariantChange = (index: number, key: keyof Variant, value: number) => {
    const updatedVariants = [...formData.variants]

    if (key === "color") {
      const selectedColor = colors.find((c) => c.id === value)
      if (selectedColor) {
        updatedVariants[index] = {
          ...updatedVariants[index],
          color: selectedColor,
          colorId: selectedColor.id,
        }
      }
    } else {
      updatedVariants[index] = {
        ...updatedVariants[index],
        [key]: value,
      }
    }

    setFormData((prev) => ({
      ...prev,
      variants: updatedVariants,
    }))
  }

  const handleRepairCost = (
    variantIndex: number,
    key: keyof DamagePolicies,
    severity: "minor" | "moderate" | "major",
    value: number
  ) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.variants]

      const variant = updatedVariants[variantIndex]

      // clone policies
      const updatedPolicies = variant.damagePolicies.map((p) =>
        p.damageSeverity === severity ? { ...p, [key]: value } : p
      )

      updatedVariants[variantIndex] = {
        ...variant,
        damagePolicies: updatedPolicies,
      }

      return { ...prev, variants: updatedVariants }
    })
  }

  const handleRepairCost1 = (
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
  }

  const removeVariant = (index: number) => {
    if (
      window.confirm(
        "Are you sure you want to remove this variant? This variant won't be deleted permanently unless you click update."
      )
    ) {
      const updatedVariants = formData.variants.filter((_, i) => i !== index)
      setFormData({ ...formData, variants: updatedVariants })
    }
  }

  //  Instead of deleting permanently in UI, you could mark it as “toDelete: true” and style it differently until the user saves.

  // const removeVariant1 = (index: number) => {
  //   const updatedVariants = formData.variants.map((v, i) =>
  //     i === index ? { ...v, _deleted: true } : v
  //   )
  //   setFormData({ ...formData, variants: updatedVariants })
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // your update logic here
      console.log(formData)

      const product = await updateProductMutation({
        id: formData.id,
        name: formData.name,
        deliveryOption: formData.deliveryOption,
        description: formData.description,
        status: formData.status,
        categoryid: formData.categoryid,
        variants: formData.variants.map((v) => ({
          id: v.id,
          size: v.size,
          colorId: v.colorId,
          quantity: v.quantity,
          price: v.price,
          replacementCost: v.replacementCost,
          manualRepairCost: v.manualRepairCost,
          damagePolicies: v.damagePolicies.map((dp) => ({
            id: dp.id,
            damageSeverity: dp.damageSeverity,
            damageSeverityPercent: dp.damageSeverityPercent,
          })),
        })),
      })
      console.log("Product updated:", product)
      console.log("Submitting edited product:", formData)

      await props.refetchProducts()
      props.handleCloseEdit()
    } catch (error) {
      console.error("Edit failed", error)
    } finally {
      setLoading(false)
    }
  }

  const emptyVariant: Variant = {
    id: Date.now(),
    color: {
      id: 1,
      name: "",
      hexCode: "",
    },
    size: "",
    colorId: 1,
    quantity: 1,
    price: 100,
    replacementCost: 100,
    manualRepairCost: 100,
    damagePolicies: [
      {
        id: Date.now(), // or another unique ID
        damageSeverity: "minor",
        damageSeverityPercent: 10,
      },
      {
        id: Date.now() + 1,
        damageSeverity: "moderate",
        damageSeverityPercent: 30,
      },
      {
        id: Date.now() + 2,
        damageSeverity: "major",
        damageSeverityPercent: 50,
      },
    ],
  }

  // useEffect(() => {
  //   console.log("Updated formData:", formData);
  // }, [formData]);

  const handleAddVariant = () => {
    setFormData((prevData) => {
      const updated = {
        ...prevData,
        variants: [...prevData.variants, { ...emptyVariant }],
      }
      console.log(updated)
      return updated
    })
  }

  const toggleRow = (id: number) => {
    setRowToggle((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
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
          sx={{
            "& .MuiInputLabel-root": { color: "blue" },
            "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
          }}
        />

        <TextField
          name="categoryid"
          label="Category"
          select
          fullWidth
          value={formData.categoryid}
          onChange={handleInputChange}
          sx={{
            "& .MuiInputLabel-root": { color: "blue" },
            "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
          }}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={category.id}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          name="deliveryOption"
          label="Delivery Option"
          select
          fullWidth
          value={formData.deliveryOption}
          onChange={handleInputChange}
          sx={{
            "& .MuiInputLabel-root": { color: "blue" },
            "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
          }}
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
          sx={{
            "& .MuiInputLabel-root": { color: "blue" },
            "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
          }}
        >
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="inactive">Inactive</MenuItem>
        </TextField>
      </div>

      <div>
        <TextField
          required
          multiline
          rows={4}
          id="productDescription"
          name="description"
          label="Product Description"
          fullWidth
          value={formData.description}
          onChange={handleInputChange}
          sx={{
            "& .MuiInputLabel-root": { color: "blue" },
            "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
          }}
        />
      </div>

      <div>
        <div className="flex items-center justify-between my-2">
          <label className="block text-xl font-medium uppercase">Product Variants</label>
          <button
            type="button"
            onClick={handleAddVariant}
            className="flex items-center gap-1 px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
          >
            <Plus size={16} />
            Add New Variant
          </button>
        </div>

        {/* {formData.variants.map((variant, index) => { */}
        {[...formData.variants].reverse().map((variant, index) => {
          const minorPolicyIndex = variant.damagePolicies?.findIndex(
            (p) => p.damageSeverity === "minor"
          )
          const minorPolicy = formData.variants[index].damagePolicies?.[minorPolicyIndex]

          const moderatePolicyIndex = variant.damagePolicies?.findIndex(
            (p) => p.damageSeverity === "moderate"
          )
          const moderatePolicy = formData.variants[index].damagePolicies?.[moderatePolicyIndex]

          const majorPolicyIndex = variant.damagePolicies?.findIndex(
            (p) => p.damageSeverity === "major"
          )
          const majorPolicy = formData.variants[index].damagePolicies?.[majorPolicyIndex]

          const replacementCost = formData.variants[index].replacementCost

          const isOpen = rowToggle[formData.variants[index].id] || false
          // const isOpen = rowToggle[variant.id] || false

          return (
            <div
              key={formData.variants[index].id ?? `variant-${index}`}
              className="border p-4 rounded-md my-4"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleRow(formData.variants[index].id)}
              >
                <label className="block text-md font-medium uppercase">
                  Variants
                  <span className="ml-2 text-xs text-blue-500">
                    ({`Variant ID: ${formData.variants[index].id}`})
                  </span>
                </label>
                <span>{isOpen ? "▲" : "▼"}</span>
              </div>

              {isOpen && (
                <>
                  <label className="block text-sm font-medium my-8">General Info</label>

                  <div className="flex gap-2 items-center mb-4">
                    <TextField
                      key={`id-${index}`}
                      name="id"
                      label="Variant ID"
                      fullWidth
                      value={formData.variants[index].id}
                      disabled
                    />
                    <TextField
                      key={`color-${index}`}
                      name="color"
                      label="Color"
                      sx={{
                        "& .MuiInputLabel-root": { color: "blue" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                      }}
                      select
                      fullWidth
                      value={formData.variants[index].color.id}
                      onChange={(e) => handleVariantChange(index, "color", Number(e.target.value))}
                    >
                      {colors.map((color) => (
                        <MenuItem key={color.id} value={color.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: color.hexCode }}
                            ></div>
                            {color.name}
                          </div>
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      key={`price-${index}`}
                      name="price"
                      label="Rent Price"
                      sx={{
                        "& .MuiInputLabel-root": { color: "blue" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                      }}
                      type="number"
                      fullWidth
                      value={formData.variants[index].price}
                      onChange={(e) => handleVariantChange(index, "price", Number(e.target.value))}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                      }}
                    />
                    <TextField
                      key={`quantity-${index}`}
                      name="quantity"
                      label="Quantity"
                      sx={{
                        "& .MuiInputLabel-root": { color: "blue" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                      }}
                      type="number"
                      fullWidth
                      value={formData.variants[index].quantity}
                      onChange={(e) =>
                        handleVariantChange(index, "quantity", Number(e.target.value))
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

                  <label className="block text-sm font-medium my-8">Costs</label>

                  {/* New section for repair & replacement costs */}
                  <div className="grid grid-cols-2 gap-4">
                    <TextField
                      key={`replacementCost-${index}`}
                      name="replacementCost"
                      label="Replacement Cost"
                      type="number"
                      fullWidth
                      value={replacementCost || ""}
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
                      key={`manualRepairCost-${index}`}
                      name="manualRepairCost"
                      label="Manual Repair Cost"
                      type="number"
                      fullWidth
                      value={formData.variants[index].manualRepairCost || ""}
                      onChange={(e) =>
                        handleVariantChange(index, "manualRepairCost", Number(e.target.value))
                      }
                      sx={{
                        "& .MuiInputLabel-root": { color: "blue" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                      }}
                      slotProps={{
                        input: {
                          startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                        },
                      }}
                    />
                  </div>

                  <label className="block text-sm font-medium my-8">Repair Severity</label>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Minor Repair */}
                    <TextField
                      key={`minorRepairCost-${index}`}
                      name="minorRepairCost"
                      label="Minor Repair Cost"
                      type="number"
                      fullWidth
                      value={
                        minorPolicy?.damageSeverityPercent
                          ? minorPolicy?.damageSeverityPercent * (replacementCost / 100)
                          : 0
                      }
                      slotProps={{
                        input: {
                          readOnly: true,
                          startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                        },
                      }}
                    />
                    <TextField
                      key={`minorRepairPercent-${index}`}
                      name="minorRepairPercent"
                      label="Minor Repair %"
                      type="number"
                      placeholder="10 - 29"
                      fullWidth
                      value={minorPolicy?.damageSeverityPercent ?? 0}
                      error={
                        minorPolicy?.damageSeverityPercent < 10 ||
                        minorPolicy?.damageSeverityPercent > 29
                      }
                      helperText={
                        minorPolicy?.damageSeverityPercent < 10 ||
                        minorPolicy?.damageSeverityPercent > 29
                          ? "Value must be between 10 and 29"
                          : ""
                      }
                      onChange={(e) => {
                        // const raw = Number(e.target.value)
                        // const { min, max } = repairPercentRanges["minor"]
                        // const clamped = Math.max(min, Math.min(max, raw))
                        const clamped = Number(e.target.value)
                        handleRepairCost(index, "damageSeverityPercent", "minor", clamped)
                      }}
                      sx={{
                        "& .MuiInputLabel-root": { color: "blue" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                      }}
                      slotProps={{
                        input: {
                          inputProps: { min: 10, max: 29 },
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        },
                      }}
                    />
                    {/* Moderate Repair */}
                    <TextField
                      key={`moderateRepairCost-${index}`}
                      name="moderateRepairCost"
                      label="Moderate Repair Cost"
                      type="number"
                      fullWidth
                      value={
                        moderatePolicy?.damageSeverityPercent
                          ? moderatePolicy?.damageSeverityPercent * (replacementCost / 100)
                          : 0
                      }
                      slotProps={{
                        input: {
                          readOnly: true,
                          startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                        },
                      }}
                    />
                    <TextField
                      key={`moderateRepairPercent-${index}`}
                      name="moderateRepairPercent"
                      label="Moderate Repair %"
                      type="number"
                      placeholder="30 - 59"
                      fullWidth
                      value={moderatePolicy?.damageSeverityPercent ?? 0}
                      error={
                        moderatePolicy?.damageSeverityPercent < 30 ||
                        moderatePolicy?.damageSeverityPercent > 49
                      }
                      helperText={
                        moderatePolicy?.damageSeverityPercent < 30 ||
                        moderatePolicy?.damageSeverityPercent > 49
                          ? "Value must be between 30 and 49"
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
                        "& .MuiInputLabel-root.Mui-focused": { color: "blue" }, // stays blue when focused
                      }}
                      slotProps={{
                        input: {
                          inputProps: { min: 30, max: 49 },
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        },
                      }}
                    />
                    {/* Major Repair */}
                    <TextField
                      key={`majorRepairCost-${index}`}
                      name="majorRepairCost"
                      label="Major Repair Cost"
                      type="number"
                      fullWidth
                      value={
                        majorPolicy?.damageSeverityPercent
                          ? majorPolicy?.damageSeverityPercent * (replacementCost / 100)
                          : 0
                      }
                      slotProps={{
                        input: {
                          readOnly: true,
                          startAdornment: <InputAdornment position="start">₱</InputAdornment>,
                        },
                      }}
                    />
                    <TextField
                      key={`majorRepairPercent-${index}`}
                      name="majorRepairPercent"
                      label="Major Repair %"
                      type="number"
                      placeholder="50 - 69"
                      fullWidth
                      value={majorPolicy?.damageSeverityPercent ?? 0}
                      error={
                        majorPolicy?.damageSeverityPercent < 50 ||
                        majorPolicy?.damageSeverityPercent > 69
                      }
                      helperText={
                        majorPolicy?.damageSeverityPercent < 50 ||
                        majorPolicy?.damageSeverityPercent > 69
                          ? "Value must be between 50 and 69"
                          : ""
                      }
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
                      slotProps={{
                        input: {
                          inputProps: { min: 50, max: 69 },
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        },
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* <Button type="submit" variant="contained" color="primary" disabled={loading}> */}
      <Button type="submit" variant="contained" color="primary" disabled={loading}>
        {loading ? <CircularProgress size={20} /> : "Update Product"}
      </Button>
    </form>
  )
}

export default EditProductForm
