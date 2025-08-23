"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getCategories from "../../queries/getCategories"
import getColors from "../../queries/getColors"
import { MenuItem, TextField } from "@mui/material"
import DeleteForeverIcon from "@mui/icons-material/DeleteForever"
import uploadShopBg from "../../mutations/uploadShopBg"
import createProduct from "../../mutations/createProduct"
import { useRouter } from "next/navigation"

import { InputAdornment } from "@mui/material"

type Image = {
  id: number
  url: string
}

type Color = {
  id: number
  name: string
  hexCode: string
}

type DamagePolicies = {
  id: number
  damageSeverity: string
  damageSeverityPercent: number
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

type ProductFormData = {
  id: number
  shopId: number
  name: string
  status: "active" | "inactive"
  description: string
  deliveryOption: "DELIVERY" | "PICKUP" | "BOTH"
  category: Category
  categoryid: number
  variants: Variant[]
  images: Image[]
}

const notEmptyDamagePolicies: DamagePolicies[] = [
  {
    id: Date.now(),
    damageSeverity: "minor",
    damageSeverityPercent: 10,
  },
  {
    id: Date.now(),
    damageSeverity: "moderate",
    damageSeverityPercent: 30,
  },
  {
    id: Date.now(),
    damageSeverity: "major",
    damageSeverityPercent: 50,
  },
]

const emptyVariant: Variant = {
  id: crypto.randomUUID(),
  color: {
    id: 1,
    name: "Red",
    hexCode: "#FF0000",
  },
  size: "XS",
  colorId: 1,
  quantity: 1,
  price: 100,
  replacementCost: 100,
  manualRepairCost: 50,
  damagePolicies: notEmptyDamagePolicies,
}

const makeEmptyProduct = (currentUser: any): ProductFormData => ({
  id: 0,
  shopId: currentUser.shop.id,
  name: "",
  status: "active",
  description: "",
  deliveryOption: "DELIVERY",
  category: {
    id: 1,
    name: "Electronics",
  },
  categoryid: 1,
  variants: [emptyVariant],
  images: [],
})

const CreateProductForm = (props: { currentUser: any; handleClose: () => void }) => {
  const emptyProduct = makeEmptyProduct(props.currentUser)

  const router = useRouter()
  const { handleClose } = props
  const [loading, setLoading] = useState(false)
  const currentUser = props.currentUser
  const [formData, setFormData] = useState<ProductFormData>(emptyProduct)

  const [rowToggle, setRowToggle] = useState<{ [id: number]: boolean }>({})

  // const [formData, setFormData] = useState({
  //   shopId: currentUser.shop.id,
  //   productName: "",
  //   category: "",
  //   description: "",
  //   deliveryOption: "",
  //   productImages: [],
  //   variants: [{ size: "", color: "", quantity: 0, price: 0 }],
  // })

  const [uploadShopBgMutation] = useMutation(uploadShopBg)
  const [createProductMutation] = useMutation(createProduct)

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

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
  const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
    const updatedVariants = [...formData.variants]
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    }
    // updatedVariants[index][field] = value
    setFormData((prev) => ({ ...prev, variants: updatedVariants }))
  }

  // Add a new variant
  const addVariant = () => {
    const newVariant: Variant = {
      id: crypto.randomUUID(), // ✅ generate fresh ID each time
      color: {
        id: 1,
        name: "Red",
        hexCode: "#FF0000",
      },
      size: "XS",
      colorId: 1,
      quantity: 1,
      price: 100,
      replacementCost: 100,
      manualRepairCost: 50,
      damagePolicies: notEmptyDamagePolicies,
    }

    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...newVariant }],
    }))

    console.log(formData)
  }

  // Remove a variant
  const removeVariant = (index: number) => {
    const updatedVariants = formData.variants.filter((_, i) => i !== index)
    setFormData((prev) => ({ ...prev, variants: updatedVariants }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      setSelectedFiles(files) // store files for later
    }
  }

  // When user clicks "Create Product"
  // const handleCreateProduct = async () => {
  //   try {
  //     // First upload all selected files
  //     const uploadedFileNames: string[] = []

  //     for (const file of selectedFiles) {
  //       const uniqueFileName = `${Date.now()}-${file.name}`
  //       const reader = new FileReader()

  //       // Wrap FileReader in a promise so we can await it
  //       const base64String: string = await new Promise((resolve, reject) => {
  //         reader.onloadend = () => resolve(reader.result as string)
  //         reader.onerror = reject
  //         reader.readAsDataURL(file)
  //       })

  //       const fileUrl = await uploadShopBgMutation({
  //         fileName: uniqueFileName,
  //         data: base64String,
  //         targetDirectory: "products",
  //       })

  //       uploadedFileNames.push(uniqueFileName)
  //     }

  //     // Now include uploadedFileNames in formData
  //     const finalData = {
  //       ...formData,
  //       productImages: uploadedFileNames,
  //     }

  //     console.log("Submitting product:", finalData)

  //     // Call your create product mutation here
  //     await createProductMutation(finalData)
  //   } catch (error) {
  //     console.error("Product creation failed:", error)
  //   }
  // }

  // const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files) {
  //     const files = Array.from(e.target.files).map((file) => {
  //       const uniqueFileName = `${Date.now()}-${file.name}`
  //       const reader = new FileReader()
  //       reader.onloadend = async () => {
  //         const base64String = reader.result as string
  //         try {
  //           const fileUrl = await uploadShopBgMutation({
  //             fileName: uniqueFileName,
  //             data: base64String,
  //             targetDirectory: "products",
  //           })
  //         } catch (error) {
  //           console.error("file upload failed:", error)
  //         }
  //       }
  //       reader.readAsDataURL(file)
  //       return uniqueFileName
  //     })

  //     const uploadedFileName = files.map((uniqeFileName) => uniqeFileName)

  //     console.log(uploadedFileName)

  //     setFormData((prev) => ({ ...prev, productImages: uploadedFileName }))
  //   }
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const seen = new Set<string>()
    for (const v of formData.variants) {
      const key = `${v.size}-${v.colorId}`
      if (seen.has(key)) {
        alert("Duplicate size and color found in variants!")
        setLoading(false)
        return
      }
      seen.add(key)
    }

    try {
      // 1. Upload all selected files first
      const uploadedFileNames: string[] = []

      for (const file of selectedFiles) {
        const uniqueFileName = `${Date.now()}-${file.name}`
        const reader = new FileReader()

        // Wrap FileReader in a promise
        const base64String: string = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        await uploadShopBgMutation({
          fileName: uniqueFileName,
          data: base64String,
          targetDirectory: "products",
        })

        uploadedFileNames.push(uniqueFileName)
      }

      // 2. Create product with uploaded image filenames
      const finalData = {
        ...formData,
        images: uploadedFileNames,
      }

      console.log("Submitting product:", finalData)

      const product = await createProductMutation(finalData)

      console.log("✅ Product created:", product)

      alert("Product created successfully!")
      handleClose()
    } catch (error) {
      console.error("❌ Error creating product:", error)
      alert("Failed to create product!")
    } finally {
      setLoading(false)
    }
  }

  // Handle form submission
  // const handleSubmit1 = async (e: React.FormEvent) => {
  //   e.preventDefault()

  //   console.log(formData)

  //   setLoading(true)

  //   try {
  //     // ✅ Step 1: Create product first
  //     const product = await createProductMutation({
  //       ...formData,
  //       images: [],
  //     })

  //     // ✅ Step 2: Upload images only if product creation succeeded
  //     const uploadedImages = await Promise.all(
  //       formData.images.map(async (file) => {
  //         return await uploadFile(file); // your upload function
  //       })
  //     );

  //     // ✅ Step 3: Update product with uploaded images
  //     if (uploadedImages.length > 0) {
  //       await updateProductMutation({
  //         where: { id: product.id },
  //         data: { images: uploadedImages },
  //       })
  //     }

  //     console.log(product)

  //     // const product = await createProduct(formData)
  //     // console.log("Product created:", product)
  //     // alert("Product created successfully!")
  //     // handleClose()
  //     // setLoading(false)
  //   } catch (error) {
  //     console.error("Error creating product:", error)
  //     alert("Failed to create product!")
  //   }
  // }

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

  const toggleRow = (id: number) => {
    setRowToggle((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
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
          id="name"
          name="name"
          label="Product Name"
          fullWidth
          value={formData.name}
          onChange={handleInputChange}
        />

        <TextField
          id="categoryid"
          select
          name="categoryid"
          label="Select Category"
          fullWidth
          value={formData.categoryid}
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
        name="description"
        label="Product Description"
        fullWidth
        value={formData.description}
        onChange={handleInputChange}
      />

      {/* Product Variants */}
      <div>
        <label className="block text-xl font-medium my-2 uppercase text-black">
          Product Variants
        </label>
        {formData.variants.map((variant, index) => {
          const minorPolicyIndex = variant.damagePolicies?.findIndex(
            (p) => p.damageSeverity === "minor"
          )
          const minorPolicy = variant.damagePolicies?.[minorPolicyIndex]

          const moderatePolicyIndex = variant.damagePolicies?.findIndex(
            (p) => p.damageSeverity === "moderate"
          )
          const moderatePolicy = variant.damagePolicies?.[moderatePolicyIndex]

          const majorPolicyIndex = variant.damagePolicies?.findIndex(
            (p) => p.damageSeverity === "major"
          )
          const majorPolicy = variant.damagePolicies?.[majorPolicyIndex]

          const replacementCost = variant.replacementCost

          const isOpen = rowToggle[variant.id] || false

          return (
            <div
              // key={variant.id ?? `variant-${index}`}
              key={`variant-${index}`}
              className="border p-4 rounded-md my-4"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleRow(variant.id)}
              >
                <label className="block text-md font-medium uppercase">
                  Variants
                  <span className="ml-2 text-xs text-blue-500">
                    ({`Variant ID: ${variant.id}-${index}`})
                  </span>
                </label>
                <span>{isOpen ? "▲" : "▼"}</span>
              </div>

              {isOpen && (
                <>
                  <label className="block text-sm font-medium my-8">General Info</label>

                  <div key={index} className="flex gap-2 items-center my-4">
                    <TextField
                      key={`variantSize-${index}`}
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
                      key={`variantColor-${index}`}
                      id={`variantColor-${index}`}
                      select
                      name="colorId"
                      label="Color"
                      fullWidth
                      value={variant.colorId}
                      onChange={(e) => handleVariantChange(index, "colorId", e.target.value)}
                    >
                      {colors.map((color) => (
                        <MenuItem key={color.id} value={color.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: color.hexCode }}
                            ></div>
                            {color.name}
                          </div>
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      required
                      key={`variantQuantity-${index}`}
                      id={`variantQuantity-${index}`}
                      name="quantity"
                      label="Quantity"
                      type="number"
                      fullWidth
                      value={variant.quantity}
                      onChange={(e) =>
                        handleVariantChange(index, "quantity", Number(e.target.value))
                      }
                    />

                    <TextField
                      required
                      key={`variantPrice-${index}`}
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
                      value={variant.manualRepairCost || ""}
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
      <button type="submit" className="bg-green-500 text-white p-2 rounded" disabled={loading}>
        {loading ? "Creating..." : "Create Product"}
      </button>
    </form>
  )
}

export default CreateProductForm
