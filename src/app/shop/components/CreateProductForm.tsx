"use client"
import { useState, useEffect, useMemo } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import getCategories from "../../queries/getCategories"
import {
  MenuItem,
  TextField,
  InputAdornment,
  Button,
  Typography,
  Paper,
  Box,
  Tooltip,
  Stack,
} from "@mui/material"
import Grid from "@mui/material/Grid"
import uploadShopBg from "../../mutations/uploadShopBg"
import createProduct from "../../mutations/createProduct"
import createAttribute from "../../mutations/createAttribute"
import createAttributeValue from "../../mutations/createAttributeValue"
import { useRouter } from "next/navigation"
import { InfoOutlined } from "@mui/icons-material"
import getAttributes from "../../queries/getAttributes"
import ProductImageUploader, { FileWithPreview } from "./ProductImageUploader"
import DamagePoliciesSection from "./DamagePoliciesSection"
import { DAMAGE_TEMPLATES } from "@/db/damageThresholds"
import ProductVariantsSection from "./ProductVariantsSection"
import PurchaseHistorySection from "./PurchaseHistorySection"
import ProductBasicInfoSection from "./ProductBasicInfoSection"
import { toast } from "sonner"

type DamagePolicies = {
  id: number
  damageSeverity: string
  damageSeverityPercent: number
  description?: string
}

type AttributeValue = {
  id: number
  value: string
  hexCode: string | null
}

type Attribute = {
  id: number
  name: string
  values: AttributeValue[]
}

type Variant = {
  id: any
  attributeValueIds: { [attributeId: number]: number }
  price: number
  quantity: number
  damagePolicies: DamagePolicies[]
  originalMSRP: number
  originalPurchaseDate: string
  condition: string
  active: boolean
}

type ProductFormData = {
  id: number
  shopId: number
  name: string
  status: "active" | "inactive"
  description: string
  deliveryOption: "DELIVERY" | "PICKUP" | "BOTH"
  categoryid: number
  variants: Variant[]
  images: any[]
}

const getNotEmptyDamagePolicies = (): DamagePolicies[] => [
  { id: 1, damageSeverity: "minor", damageSeverityPercent: 15 },
  { id: 2, damageSeverity: "moderate", damageSeverityPercent: 30 },
  { id: 3, damageSeverity: "major", damageSeverityPercent: 60 },
  {
    id: 4,
    damageSeverity: "total_loss",
    damageSeverityPercent: 100,
    description: "Item is lost, stolen, or irreparable.",
  },
]

function createEmptyVariant(): Variant {
  return {
    id: crypto.randomUUID(),
    attributeValueIds: {},
    quantity: 0,
    price: 0,
    damagePolicies: getNotEmptyDamagePolicies(),
    originalMSRP: 0,
    originalPurchaseDate: new Date().toISOString().split("T")[0] || "",
    condition: "New",
    active: true,
  }
}

// Cartesian product helper (moved outside component to be stable)
const cartesian = (args: any[][]) => {
  const r: any[] = [],
    max = args.length - 1
  function helper(arr: any[], i: number) {
    for (var j = 0, l = args[i]!.length; j < l; j++) {
      var a = arr.slice(0)
      a.push(args[i]![j])
      if (i == max) r.push(a)
      else helper(a, i + 1)
    }
  }
  helper([], 0)
  return r
}

const CreateProductForm = (props: { currentUser: any; handleClose?: () => void }) => {
  const router = useRouter()
  const { handleClose } = props
  const [loading, setLoading] = useState(false)
  const [useDefaultDamageRates, setUseDefaultDamageRates] = useState(true)
  const [hasVariants, setHasVariants] = useState(false)
  const [options, setOptions] = useState<
    { id: string; attributeId: number | ""; values: number[] }[]
  >([])
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])

  const [categories] = useQuery(getCategories, null)
  const [attributes, { refetch: refetchAttributes }] = useQuery(getAttributes, null)

  const [formData, setFormData] = useState<ProductFormData>({
    id: 0,
    shopId: props.currentUser.shop.id,
    name: "",
    status: "active",
    description: "",
    deliveryOption: "DELIVERY",
    categoryid: 1,
    variants: [createEmptyVariant()],
    images: [],
  })

  const [uploadShopBgMutation] = useMutation(uploadShopBg)
  const [createProductMutation] = useMutation(createProduct)
  const [createAttributeMutation] = useMutation(createAttribute)
  const [createAttributeValueMutation] = useMutation(createAttributeValue)

  // --- DERIVED STATE ---
  const selectedCategory = categories?.find((c) => c.id === formData.categoryid)
  const minorMax = selectedCategory ? Math.round(selectedCategory.defaultMinorPercent * 100) : 15
  const modMax = selectedCategory ? Math.round(selectedCategory.defaultModeratePercent * 100) : 30
  const majMax = selectedCategory ? Math.round(selectedCategory.defaultMajorPercent * 100) : 60

  const currentTemplate =
    DAMAGE_TEMPLATES[selectedCategory?.name || ""] || DAMAGE_TEMPLATES["Default"]

  const minorPercent =
    formData.variants[0]?.damagePolicies.find((dp) => dp.damageSeverity === "minor")
      ?.damageSeverityPercent || 0
  const moderatePercent =
    formData.variants[0]?.damagePolicies.find((dp) => dp.damageSeverity === "moderate")
      ?.damageSeverityPercent || 0
  const majorPercent =
    formData.variants[0]?.damagePolicies.find((dp) => dp.damageSeverity === "major")
      ?.damageSeverityPercent || 0

  const firstVariantMSRP = formData.variants[0]?.originalMSRP || 0
  const firstVariantPurchaseDate = formData.variants[0]?.originalPurchaseDate

  const currentValuePreview = useMemo(() => {
    const msrp = firstVariantMSRP
    const date = new Date(firstVariantPurchaseDate || new Date())
    const years = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    const depRate = selectedCategory?.annualDepreciationRate || 0.15
    const value = msrp * Math.pow(1 - depRate, Math.max(0, years))
    return Math.max(value, msrp * 0.1) // Floor at 10%
  }, [firstVariantMSRP, firstVariantPurchaseDate, selectedCategory])

  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleVariantChange = (index: number, field: keyof Variant, value: any) => {
    setFormData((prev) => {
      const updatedVariants = [...prev.variants]
      updatedVariants[index] = { ...updatedVariants[index]!, [field]: value }
      return { ...prev, variants: updatedVariants }
    })
  }

  const updateDamagePolicy = (severity: string, percent: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v) => ({
        ...v,
        damagePolicies: v.damagePolicies.map((dp) =>
          dp.damageSeverity === severity ? { ...dp, damageSeverityPercent: percent } : dp
        ),
      })),
    }))
  }

  // Implement your database creation logic here
  const handleCreateAttribute = async (name: string) => {
    try {
      const newAttr = await createAttributeMutation({ name })
      toast.success(`Option "${name}" created!`)
      await refetchAttributes()
      return newAttr.id
    } catch (e: any) {
      toast.error(e.message || "Failed to create option")
    }
  }

  const handleCreateAttributeValue = async (attributeId: number, value: string) => {
    try {
      const newVal = await createAttributeValueMutation({ attributeId, value })
      toast.success(`Value "${value}" created!`)
      await refetchAttributes()
      return newVal.id
    } catch (e: any) {
      toast.error(e.message || "Failed to create value")
    }
  }

  // Variant Generation Logic

  useEffect(() => {
    if (!hasVariants) {
      setFormData((prev) => ({
        ...prev,
        variants: [{ ...(prev.variants[0] || createEmptyVariant()), attributeValueIds: {} }],
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
      const baseVariant = prev.variants[0] || {}
      const basePrice = baseVariant.price || 0
      const baseQty = baseVariant.quantity || 0
      const baseMSRP = baseVariant.originalMSRP || 0
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

        return (
          existing || {
            ...createEmptyVariant(),
            attributeValueIds,
            price: basePrice,
            quantity: baseQty,
            originalMSRP: baseMSRP,
          }
        )
      })
      return { ...prev, variants: newVariants }
    })
  }, [options, hasVariants])

  // Sync Defaults when Category or Toggle Changes
  useEffect(() => {
    if (useDefaultDamageRates) {
      updateDamagePolicy("minor", minorMax)
      updateDamagePolicy("moderate", modMax)
      updateDamagePolicy("major", majMax)
    }
  }, [useDefaultDamageRates, minorMax, modMax, majMax])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const submitter = (e.nativeEvent as any).submitter as HTMLButtonElement
    const isDraft = submitter?.name === "draft"

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

      const hasActiveVariants = formData.variants.some((v) => v.active)
      if (!hasActiveVariants) {
        toast.error("Please include at least one active variant before submitting.")
        return
      }
    }

    setLoading(true)

    try {
      const template = DAMAGE_TEMPLATES[selectedCategory?.name || ""] || DAMAGE_TEMPLATES["Default"]
      const uploadedImages: any[] = []

      for (const fileObj of selectedFiles) {
        const uniqueFileName = `${Date.now()}-${fileObj.file.name}`
        const base64String: string = await new Promise((res) => {
          const reader = new FileReader()
          reader.onloadend = () => res(reader.result as string)
          reader.readAsDataURL(fileObj.file)
        })
        await uploadShopBgMutation({
          fileName: uniqueFileName,
          data: base64String,
          targetDirectory: "products",
        })
        uploadedImages.push({ url: uniqueFileName, attributeValueId: fileObj.attributeValueId })
      }

      const finalData = {
        ...formData,
        status: isDraft ? "inactive" : "active",
        images: uploadedImages,
        variants: formData.variants
          .filter((v) => v.active)
          .map((v) => ({
            ...v,
            // MAP DESCRIPTIONS FROM TEMPLATE BEFORE SAVING
            damagePolicies: v.damagePolicies.map((dp) => ({
              ...dp,
              description:
                dp.damageSeverity === "total_loss"
                  ? dp.description
                  : template[dp.damageSeverity.toUpperCase() as keyof typeof template],
            })),
            attributes: Object.entries(v.attributeValueIds).map(([aId, vId]) => ({
              attributeValueId: vId,
            })),
          })),
      }

      await createProductMutation(finalData as any)
      toast.success(isDraft ? "Product saved to drafts!" : "Product created successfully!")
      handleClose ? handleClose() : router.push("/shop/products")
    } catch (error: any) {
      toast.error(error.message || "Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  const selectableAttributeValues = options.flatMap((opt) => {
    const attr = attributes?.find((a) => a.id === opt.attributeId)
    return opt.values.map((vId) => ({
      id: vId,
      label: `${attr?.name}: ${attr?.values.find((v) => v.id === vId)?.value}`,
    }))
  })

  return (
    <div className="w-full mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <header className="mb-8">
        <Typography variant="h5" className="font-bold text-slate-800">
          Add New Product
        </Typography>
        <p className="text-slate-500 text-sm">
          Collect the necessary details for listing and damage protection.
        </p>
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
                categories={categories as any}
                onChange={handleInputChange}
              />

              <Paper elevation={0} variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                      Media
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Upload images of your product to help renters evaluate its condition and
                      features.
                    </Typography>
                  </Box>
                  <ProductImageUploader
                    selectedFiles={selectedFiles}
                    onImageChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files).map((file) => ({
                          file,
                          preview: URL.createObjectURL(file),
                          attributeValueId: null,
                        }))
                        setSelectedFiles((prev) => [...prev, ...newFiles])
                      }
                    }}
                    onRemoveFile={(i) =>
                      setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    onRemoveAllFiles={() => setSelectedFiles([])}
                    onFileAttributeChange={(i, id) => {
                      const next = [...selectedFiles]
                      next[i]!.attributeValueId = id
                      setSelectedFiles(next)
                    }}
                    selectableAttributeValues={selectableAttributeValues}
                  />
                </Stack>
              </Paper>

              <ProductVariantsSection
                hasVariants={hasVariants}
                setHasVariants={setHasVariants}
                options={options as any}
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
                attributes={attributes as any}
                variants={formData.variants}
                handleVariantChange={handleVariantChange}
                onCreateAttribute={handleCreateAttribute}
                onCreateAttributeValue={handleCreateAttributeValue}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Stack spacing={4} sx={{ position: { lg: "sticky" }, top: { lg: 24 }, pb: 2 }}>
              <PurchaseHistorySection
                sx={{ bgcolor: "#f8fafc" }}
                originalPurchaseDate={formData.variants[0]?.originalPurchaseDate || ""}
                condition={formData.variants[0]?.condition || "New"}
                onChange={(field, value) => handleVariantChange(0, field as any, value)}
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
                onMinorChange={(val) => updateDamagePolicy("minor", val)}
                moderatePercent={moderatePercent}
                modMin={minorPercent + 1}
                modMax={modMax}
                onModerateChange={(val) => updateDamagePolicy("moderate", val)}
                majorPercent={majorPercent}
                majMin={moderatePercent + 1}
                majMax={majMax}
                onMajorChange={(val) => updateDamagePolicy("major", val)}
              />

              <Stack direction="row" spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  name="draft"
                  type="submit"
                  disabled={loading}
                  sx={{
                    py: 2,
                    borderRadius: 2,
                    fontSize: "1.1rem",
                    fontWeight: "bold",
                    textTransform: "none",
                  }}
                >
                  Save as Draft
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  name="active"
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
                  {loading ? "Creating..." : "Create Product"}
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </form>
    </div>
  )
}

export default CreateProductForm
