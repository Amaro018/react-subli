import React, { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  Button,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Tooltip,
  Stack,
  Box,
  Grid,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material"
import { useQuery, useMutation } from "@blitzjs/rpc"
import getAttributes from "src/app/queries/getAttributes"
import getCategories from "../../queries/getCategories"

import uploadShopBg from "../../mutations/uploadShopBg"
import updateProduct from "../../mutations/updateProduct"
import createAttribute from "../../mutations/createAttribute"
import createAttributeValue from "../../mutations/createAttributeValue"

import { HelpOutline, InfoOutlined, Close } from "@mui/icons-material"
import ProductImageUploader, { FileWithPreview } from "./ProductImageUploader"
import ProductBasicInfoSection from "./ProductBasicInfoSection"
import PurchaseHistorySection from "./PurchaseHistorySection"
import DamagePoliciesSection from "./DamagePoliciesSection"
import { DAMAGE_TEMPLATES } from "@/db/damageThresholds"
import ProductVariantsSection from "./ProductVariantsSection"
import { toast } from "@/src/app/utils/toast"
import { FORM_DEFAULTS } from "./formConstants"
import { calculateCurrentValue, cartesian } from "./utils"

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

export type Category = {
  id: number
  name: string
  defaultMinorPercent: number
  defaultModeratePercent: number
  defaultMajorPercent: number
  annualDepreciationRate?: number
}

export type RentItem = {
  id: number
  status: string
  quantity: number
  returnedDamagedQty: number
  isRepaired: boolean | null
}

export type ProductImage = {
  url: string
  isThumbnail: boolean
  attributeValueId: number | null
}

export type ProductVariantAttribute = {
  attributeValue: AttributeValue & { attribute: Attribute }
}

export type Variant = {
  id: number | string
  attributeValueIds: { [attributeId: number]: number }
  price: number
  quantity: number
  damagePolicies: DamagePolicies[]
  originalMSRP: number
  originalPurchaseDate: string
  condition: string
  active?: boolean
  replacementCost?: number
  manualRepairCost?: number
}

export type DamagePolicies = {
  id?: number
  damageSeverity: string
  damageSeverityPercent: number
  description?: string
}

export type Product = {
  id: number
  name: string
  status: string
  description: string
  deliveryOption: string
  category: Category
  categoryid: number
  variants: Array<
    Omit<Variant, "attributeValueIds"> & {
      attributes: ProductVariantAttribute[]
      rentItems: RentItem[]
    }
  >
  images: ProductImage[]
}

type ProductFormData = Omit<Product, "variants"> & {
  variants: Variant[]
}

type EditProductFormProps = {
  currentUser: Product
  handleCloseEdit: () => void
  refetchProducts: () => Promise<void>
}

const getNotEmptyDamagePolicies = () => [
  { damageSeverity: "minor", damageSeverityPercent: FORM_DEFAULTS.DAMAGE_POLICY_MINOR_PERCENT },
  {
    damageSeverity: "moderate",
    damageSeverityPercent: FORM_DEFAULTS.DAMAGE_POLICY_MODERATE_PERCENT,
  },
  { damageSeverity: "major", damageSeverityPercent: FORM_DEFAULTS.DAMAGE_POLICY_MAJOR_PERCENT },
  {
    damageSeverity: "total_loss",
    damageSeverityPercent: 100,
    description: "Item is lost, stolen, or irreparable.",
  },
]

const EditProductForm = (props: EditProductFormProps) => {
  const [attributes, { refetch: refetchAttributes }] = useQuery(getAttributes, null)
  const [categories] = useQuery(getCategories, null)

  const [formData, setFormData] = useState<ProductFormData>(() => {
    const { variants, ...rest } = props.currentUser

    return {
      ...rest,
      variants: variants.map((variant) => {
        const attributeValueIds = variant.attributes.reduce((acc, attr) => {
          acc[attr.attributeValue.attribute.id] = attr.attributeValue.id
          return acc
        }, {} as { [attributeId: number]: number })

        const damagePolicies = variant.damagePolicies?.length
          ? variant.damagePolicies
          : getNotEmptyDamagePolicies()

        return { ...variant, attributeValueIds, damagePolicies, active: true } as Variant
      }),
    }
  })

  const [hasVariants, setHasVariants] = useState(() => {
    return props.currentUser.variants.some((v) => v.attributes && v.attributes.length > 0)
  })

  const [options, setOptions] = useState<
    { id: string; attributeId: number | ""; values: number[] }[]
  >(() => {
    const initialOptions: { id: string; attributeId: number; values: number[] }[] = []
    const hasVars = props.currentUser.variants.some((v) => v.attributes && v.attributes.length > 0)
    if (hasVars) {
      const optionsMap = new Map<number, Set<number>>()
      props.currentUser.variants.forEach((v) => {
        v.attributes.forEach((attr) => {
          const attrId = attr.attributeValue.attribute.id
          const valId = attr.attributeValue.id
          if (!optionsMap.has(attrId)) optionsMap.set(attrId, new Set())
          optionsMap.get(attrId)!.add(valId)
        })
      })

      optionsMap.forEach((valuesSet, attributeId) => {
        initialOptions.push({
          id: crypto.randomUUID(),
          attributeId,
          values: Array.from(valuesSet),
        })
      })
    }
    return initialOptions
  })

  const [thumbnailIndex, setThumbnailIndex] = useState<number | null>(() => {
    const thumbIndex = props.currentUser.images.findIndex((img: ProductImage) => img.isThumbnail)
    return thumbIndex !== -1 ? thumbIndex : props.currentUser.images.length > 0 ? 0 : null
  })

  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>(() => {
    return props.currentUser.images.map((img: ProductImage) => ({
      file: new File([img.url], img.url), // creates a File object from the URL
      preview: `/uploads/products/${img.url}`,
      attributeValueId: img.attributeValueId ?? null,
    }))
  })

  const [loading, setLoading] = useState(false)

  // Keep a ref of selected files to clean up blob URLs on unmount
  const selectedFilesRef = useRef(selectedFiles)
  useEffect(() => {
    selectedFilesRef.current = selectedFiles
  }, [selectedFiles])

  useEffect(() => {
    return () => {
      selectedFilesRef.current.forEach((fileObj) => {
        if (fileObj.preview.startsWith("blob:")) {
          URL.revokeObjectURL(fileObj.preview)
        }
      })
    }
  }, [])

  const [uploadShopBgMutation] = useMutation(uploadShopBg)
  const [updateProductMutation] = useMutation(updateProduct)
  const [createAttributeMutation] = useMutation(createAttribute)
  const [createAttributeValueMutation] = useMutation(createAttributeValue)

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    },
    []
  )

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        attributeValueId: null,
      }))
      setSelectedFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev]
      if (newFiles[index]?.preview.startsWith("blob:")) {
        URL.revokeObjectURL(newFiles[index]!.preview)
      }
      newFiles.splice(index, 1)

      // Adjust thumbnail index after removing a file
      setThumbnailIndex((currentThumbnailIndex) => {
        if (currentThumbnailIndex === null) return null
        if (newFiles.length === 0) return null
        if (index === currentThumbnailIndex) return 0 // Reset to first image
        if (index < currentThumbnailIndex) return currentThumbnailIndex - 1 // Shift index down
        return currentThumbnailIndex // Index is unaffected
      })

      return newFiles
    })
  }, [])

  const handleRemoveAllFiles = useCallback(() => {
    setSelectedFiles((prev) => {
      prev.forEach((fileObj) => {
        if (fileObj.preview.startsWith("blob:")) URL.revokeObjectURL(fileObj.preview)
      })
      return []
    })
    setThumbnailIndex(null)
  }, [])

  const handleFileAttributeChange = useCallback(
    (index: number, attributeValueId: number | null) => {
      setSelectedFiles((prev) => {
        const newFiles = [...prev]
        newFiles[index]!.attributeValueId = attributeValueId
        return newFiles
      })
    },
    []
  )

  // Compute available attribute values for the image dropdown
  const selectableAttributeValues = useMemo(
    () =>
      attributes?.flatMap((option) => {
        return option.values.map((val) => {
          return {
            id: val.id,
            label: `${option.name}: ${val.value}`,
          }
        })
      }),
    [attributes]
  )

  const selectedCategory = categories?.find((c: Category) => c.id === formData.categoryid)
  const minorMax = selectedCategory
    ? Math.round(selectedCategory.defaultMinorPercent * 100)
    : FORM_DEFAULTS.DAMAGE_POLICY_MINOR_PERCENT
  const modMax = selectedCategory
    ? Math.round(selectedCategory.defaultModeratePercent * 100)
    : FORM_DEFAULTS.DAMAGE_POLICY_MODERATE_PERCENT
  const majMax = selectedCategory
    ? Math.round(selectedCategory.defaultMajorPercent * 100)
    : FORM_DEFAULTS.DAMAGE_POLICY_MAJOR_PERCENT

  const hasRentalHistory = useMemo(() => {
    return props.currentUser.variants.some(
      (v: Product["variants"][0]) => v.rentItems && v.rentItems.length > 0
    )
  }, [props.currentUser])

  const handleSharedVariantChange = useCallback((field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v: Variant) => ({ ...v, [field]: value })),
    }))
  }, [])

  const updateSharedDamagePolicy = useCallback((severity: string, percent: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v: Variant) => ({
        ...v,
        damagePolicies: (v.damagePolicies || []).map((dp: DamagePolicies) =>
          dp.damageSeverity === severity ? { ...dp, damageSeverityPercent: percent } : dp
        ),
      })),
    }))
  }, [])

  const [useDefaultDamageRates, setUseDefaultDamageRates] = useState(false)

  useEffect(() => {
    if (useDefaultDamageRates) {
      updateSharedDamagePolicy("minor", minorMax)
      updateSharedDamagePolicy("moderate", modMax)
      updateSharedDamagePolicy("major", majMax)
    }
  }, [useDefaultDamageRates, minorMax, modMax, majMax, updateSharedDamagePolicy])

  const currentTemplate =
    DAMAGE_TEMPLATES[selectedCategory?.name || ""] || DAMAGE_TEMPLATES["Default"]
  const firstVariant = formData.variants[0] || {}

  const minorPercent =
    firstVariant.damagePolicies?.find((dp: DamagePolicies) => dp.damageSeverity === "minor")
      ?.damageSeverityPercent || 0
  const moderatePercent =
    firstVariant.damagePolicies?.find((dp: DamagePolicies) => dp.damageSeverity === "moderate")
      ?.damageSeverityPercent || 0
  const majorPercent =
    firstVariant.damagePolicies?.find((dp: DamagePolicies) => dp.damageSeverity === "major")
      ?.damageSeverityPercent || 0

  const handleVariantChange = useCallback(
    (index: number, field: keyof Variant, value: string | number | boolean | DamagePolicies[]) => {
      setFormData((prev) => {
        const updatedVariants = [...prev.variants]
        updatedVariants[index] = { ...updatedVariants[index]!, [field]: value }
        return { ...prev, variants: updatedVariants }
      })
    },
    []
  )

  const handleCreateAttribute = async (name: string) => {
    try {
      const newAttr = await createAttributeMutation({ name })
      toast.success(`Option "${name}" created!`)
      await refetchAttributes()
      return newAttr.id
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to create option")
    }
  }

  const handleCreateAttributeValue = async (attributeId: number, value: string) => {
    try {
      const newVal = await createAttributeValueMutation({ attributeId, value })
      toast.success(`Value "${value}" created!`)
      await refetchAttributes()
      return newVal.id
    } catch (e: unknown) {
      toast.error((e as Error).message || "Failed to create value")
    }
  }

  const createEmptyVariant = useCallback((baseVariant?: Partial<Variant>): Variant => {
    return {
      id: crypto.randomUUID(),
      attributeValueIds: {},
      quantity: baseVariant?.quantity || 0,
      price: baseVariant?.price || 0,
      damagePolicies:
        baseVariant?.damagePolicies?.map((dp: DamagePolicies) => ({ ...dp, id: undefined })) ||
        getNotEmptyDamagePolicies(),
      originalMSRP: baseVariant?.originalMSRP || 0,
      originalPurchaseDate:
        baseVariant?.originalPurchaseDate || new Date().toISOString().split("T")[0],
      condition: baseVariant?.condition || "New",
      active: true,
    }
  }, [])

  useEffect(() => {
    if (!hasVariants) {
      setFormData((prev) => ({
        ...prev,
        variants:
          prev.variants.length > 0
            ? [{ ...prev.variants[0]!, attributeValueIds: {} }]
            : [{ ...createEmptyVariant(), attributeValueIds: {} }],
      }))
      return
    }

    const validOptions = options.filter((o) => o.attributeId !== "" && o.values.length > 0)
    if (validOptions.length === 0) {
      setFormData((prev) => ({ ...prev, variants: [] }))
      return
    }

    const combinations = cartesian(validOptions.map((o) => o.values))
    setFormData((prev) => {
      const newVariants = combinations.map((combo) => {
        const attributeValueIds: Record<number, number> = {}
        validOptions.forEach((option, idx) => {
          if (option.attributeId) attributeValueIds[option.attributeId as number] = combo[idx]
        })

        const existing = prev.variants.find(
          (v) =>
            Object.keys(attributeValueIds).length === Object.keys(v.attributeValueIds).length &&
            Object.keys(attributeValueIds).every(
              (k) => v.attributeValueIds[Number(k)] === attributeValueIds[Number(k)]
            )
        )

        return existing || { ...createEmptyVariant(prev.variants[0]), attributeValueIds }
      })
      return { ...prev, variants: newVariants }
    })
  }, [options, hasVariants, createEmptyVariant])

  const currentValuePreview = useMemo(() => {
    const msrp = firstVariant.originalMSRP || 0
    const depRate =
      selectedCategory?.annualDepreciationRate || FORM_DEFAULTS.ANNUAL_DEPRECIATION_RATE
    return calculateCurrentValue(
      msrp,
      firstVariant.originalPurchaseDate || new Date(),
      depRate,
      FORM_DEFAULTS.MINIMUM_VALUE_FLOOR_PERCENT
    )
  }, [firstVariant.originalMSRP, firstVariant.originalPurchaseDate, selectedCategory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validate Variant Options
    if (hasVariants) {
      const hasIncompleteOptions = options.some(
        (opt) => opt.attributeId === "" || opt.values.length === 0
      )
      if (options.length > 0 && hasIncompleteOptions) {
        toast.error(
          "Please complete all variant options (select an option name and at least one value) or remove incomplete ones before submitting."
        )
        return
      }
      const hasActiveVariants = formData.variants.some((v: Variant) => v.active !== false)
      if (!hasActiveVariants) {
        toast.error("Please include at least one active variant before submitting.")
        return
      }
    }

    try {
      const template = DAMAGE_TEMPLATES[selectedCategory?.name || ""] || DAMAGE_TEMPLATES["Default"]
      const finalImages: { url: string; attributeValueId: number | null; isThumbnail: boolean }[] =
        []

      // Process and upload new images while keeping existing ones
      for (let index = 0; index < selectedFiles.length; index++) {
        const fileObj = selectedFiles[index]!
        if (fileObj.preview.startsWith("blob:")) {
          // This is a new file that needs to be uploaded
          const file = fileObj.file
          const uniqueFileName = `${Date.now()}-${file.name}`
          const reader = new FileReader()

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

          finalImages.push({
            url: uniqueFileName,
            attributeValueId: fileObj.attributeValueId,
            isThumbnail: index === thumbnailIndex,
          })
        } else {
          // This is an existing file, keep its original filename
          finalImages.push({
            url: fileObj.file.name,
            attributeValueId: fileObj.attributeValueId,
            isThumbnail: index === thumbnailIndex,
          })
        }
      }

      const product = await updateProductMutation({
        id: formData.id,
        name: formData.name,
        deliveryOption: formData.deliveryOption,
        description: formData.description,
        status: formData.status,
        categoryid: formData.categoryid,
        images: finalImages,
        variants: formData.variants
          .filter((v: Variant) => v.active !== false)
          .map((v: Variant) => ({
            id: typeof v.id === "number" ? v.id : undefined, // Pass existing variant ID for updates
            quantity: v.quantity,
            price: v.price,
            originalMSRP: v.originalMSRP,
            originalPurchaseDate: v.originalPurchaseDate
              ? new Date(v.originalPurchaseDate)
              : new Date(),
            condition: v.condition,
            attributes: Object.values(v.attributeValueIds).map((valueId) => ({
              attributeValueId: valueId,
            })),
            damagePolicies: (v.damagePolicies || []).map((dp: DamagePolicies) => ({
              id: typeof dp.id === "number" ? dp.id : undefined,
              damageSeverity: dp.damageSeverity,
              damageSeverityPercent: dp.damageSeverityPercent,
              description:
                dp.damageSeverity === "total_loss"
                  ? dp.description
                  : template[dp.damageSeverity.toUpperCase() as keyof typeof template],
            })),
          })),
      } as Parameters<typeof updateProductMutation>[0])

      toast.success("Product updated successfully!")
      await props.refetchProducts()
      props.handleCloseEdit()
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to update product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full mx-auto bg-white">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Edit Product
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Update the general information, media, and protection policies of your product.
          </Typography>
        </div>
        <div className="flex items-center gap-4">
          <Box
            sx={{
              bgcolor: formData.status === "active" ? "#dcfce7" : "#f1f5f9",
              pr: 2,
              pl: 1,
              py: 0.5,
              borderRadius: 8,
              border: "1px solid",
              borderColor: formData.status === "active" ? "#bbf7d0" : "#e2e8f0",
            }}
          >
            <FormControlLabel
              control={
                <Switch
                  color="success"
                  checked={formData.status === "active"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.checked ? "active" : "inactive",
                    }))
                  }
                />
              }
              label={
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color={formData.status === "active" ? "#166534" : "#475569"}
                >
                  {formData.status === "active" ? "Listed (Visible)" : "Unlisted (Hidden)"}
                </Typography>
              }
              sx={{ m: 0 }}
            />
          </Box>
          <IconButton onClick={props.handleCloseEdit} size="small" sx={{ color: "text.secondary" }}>
            <Close />
          </IconButton>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={4}>
              <ProductBasicInfoSection
                name={formData.name}
                categoryId={formData.categoryid}
                description={formData.description}
                deliveryOption={formData.deliveryOption}
                categories={categories as Category[]}
                onChange={handleInputChange}
                disabledCategory={hasRentalHistory}
              />

              <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      Media
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Manage images of your product to help renters evaluate its condition and
                      features.
                    </Typography>
                  </Box>
                  <ProductImageUploader
                    selectedFiles={selectedFiles}
                    onImageChange={handleImageChange}
                    onRemoveFile={handleRemoveFile}
                    onRemoveAllFiles={handleRemoveAllFiles}
                    onFileAttributeChange={handleFileAttributeChange}
                    selectableAttributeValues={selectableAttributeValues || []}
                    thumbnailIndex={thumbnailIndex}
                    onSetThumbnail={setThumbnailIndex}
                  />

                  <ProductVariantsSection
                    hasVariants={hasVariants}
                    setHasVariants={setHasVariants}
                    options={options}
                    handleAddOption={() =>
                      setOptions((prev) => [
                        ...prev,
                        { id: crypto.randomUUID(), attributeId: "", values: [] },
                      ])
                    }
                    handleRemoveOption={(index) =>
                      setOptions((opts) => opts.filter((_, i) => i !== index))
                    }
                    handleOptionAttributeChange={(index, attributeId) => {
                      const newOptions = [...options]
                      newOptions[index]!.attributeId = attributeId
                      newOptions[index]!.values = []
                      setOptions(newOptions)
                    }}
                    handleOptionValuesChange={(index, values) => {
                      const newOptions = [...options]
                      newOptions[index]!.values = values
                      setOptions(newOptions)
                    }}
                    attributes={attributes as Attribute[]}
                    variants={formData.variants}
                    handleVariantChange={handleVariantChange}
                    onCreateAttribute={handleCreateAttribute}
                    onCreateAttributeValue={handleCreateAttributeValue}
                    disabledHistory={hasRentalHistory}
                  />
                </Stack>
              </Paper>
            </Stack>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Stack spacing={4} sx={{ position: { lg: "sticky" }, top: { lg: 24 }, pb: 2 }}>
              <PurchaseHistorySection
                sx={{ bgcolor: "#f8fafc" }}
                originalPurchaseDate={
                  firstVariant.originalPurchaseDate
                    ? new Date(firstVariant.originalPurchaseDate).toISOString().split("T")[0]
                    : ""
                }
                condition={firstVariant.condition || "New"}
                onChange={handleSharedVariantChange}
                disabledHistory={hasRentalHistory}
              >
                <Box
                  sx={{ p: 3, bgcolor: "#eef2ff", borderRadius: 2, border: "1px solid #c7d2fe" }}
                >
                  <div className="flex items-center gap-1 mb-2">
                    <Typography
                      variant="overline"
                      fontWeight="bold"
                      sx={{ color: "#4338ca", letterSpacing: 0.5, lineHeight: 1 }}
                    >
                      CURRENT FAIR VALUE
                    </Typography>
                    <Tooltip title="Estimated value based on age and category depreciation.">
                      <InfoOutlined sx={{ fontSize: 16, color: "#4338ca" }} />
                    </Tooltip>
                  </div>
                  <Typography variant="h4" sx={{ color: "#3730a3", fontWeight: 800 }}>
                    ₱
                    {currentValuePreview.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                </Box>
              </PurchaseHistorySection>

              <DamagePoliciesSection
                sx={{ bgcolor: "#f8fafc" }}
                useDefaultDamageRates={useDefaultDamageRates}
                setUseDefaultDamageRates={setUseDefaultDamageRates}
                categoryTemplate={currentTemplate}
                minorPercent={minorPercent}
                minorMin={1}
                minorMax={minorMax}
                onMinorChange={(val) => updateSharedDamagePolicy("minor", val)}
                moderatePercent={moderatePercent}
                modMin={minorPercent + 1}
                modMax={modMax}
                onModerateChange={(val) => updateSharedDamagePolicy("moderate", val)}
                majorPercent={majorPercent}
                majMin={moderatePercent + 1}
                majMax={majMax}
                onMajorChange={(val) => updateSharedDamagePolicy("major", val)}
                disabledPolicies={hasRentalHistory}
              />

              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  textTransform: "none",
                  bgcolor: "#008060",
                  "&:hover": { bgcolor: "#005e46" },
                }}
              >
                {loading ? "Updating..." : "Update Product"}
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </div>
  )
}

export default EditProductForm
