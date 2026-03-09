"use client"

import {
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
  Card,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material"
import { useState } from "react"
import createShop from "../../mutations/createShop"
import uploadShopBg from "../../mutations/uploadShopBg"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import getBarangay from "../../queries/getBarangays"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import StorefrontIcon from "@mui/icons-material/Storefront"
import { toast } from "sonner"
import Image from "next/image"

const FormShopRegister = (props: { currentUser: any }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [uploadShopBgMutation] = useMutation(uploadShopBg)
  const [createShopMutation] = useMutation(createShop)
  const [barangays] = useQuery(getBarangay, null)
  const currentUser = props.currentUser
  const [imageProfile, setImageProfile] = useState<string | null>(null)
  const [previewProfile, setPreviewProfile] = useState<string | null>(null)
  const [imageShopBg, setImageShopBg] = useState<string | null>(null)
  const [dtiFile, setDtiFile] = useState<File | null>(null)
  const [taxFile, setTaxFile] = useState<File | null>(null)
  const [permitFile, setPermitFile] = useState<File | null>(null)
  const [previewShopBg, setPreviewShopBg] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const steps = ["SHOP DETAILS", "SHOP DOCUMENTS", "SHOP PROFILE"]
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    userId: currentUser.id,
    shopName: "",
    email: "",
    street: "",
    barangay: "",
    city: "Legazpi City",
    province: "Albay",
    country: "Philippines",
    zipCode: "4500",
    contact: "",
    description: "",
    imageProfile: "",
    linkFacebook: "",
    imageBg: "",
    documentDTI: "",
    documentPermit: "",
    documentTax: "",
  })

  const handleImageChangeShopBg = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please upload an image.")
        event.target.value = ""
        return
      }
      const uniqueFileName = `${Date.now()}-${file.name}`
      setImageShopBg(uniqueFileName)
      setFormData((prevFormData) => ({ ...prevFormData, imageBg: uniqueFileName }))
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        try {
          const fileUrl = await uploadShopBgMutation({
            fileName: uniqueFileName,
            data: base64String,
            targetDirectory: "shop-bg",
          })

          setPreviewShopBg(fileUrl)
        } catch (error) {
          console.error("Image upload failed:", error)
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImageShopBg = () => {
    setImageShopBg(null)
    setPreviewShopBg(null)
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please upload an image.")
        event.target.value = ""
        return
      }
      const uniqueFileName = `${Date.now()}-${file.name}`
      setImageProfile(uniqueFileName)
      setFormData((prevFormData) => ({ ...prevFormData, imageProfile: uniqueFileName }))
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        try {
          const fileUrl = await uploadShopBgMutation({
            fileName: uniqueFileName,
            data: base64String,
            targetDirectory: "shop-profile",
          })

          setPreviewProfile(fileUrl)
        } catch (error) {
          console.error("Image upload failed:", error)
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageProfile(null)
    setPreviewProfile(null)
  }

  const handleFileDti = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please upload a PDF or an Image.")
        event.target.value = ""
        return
      }
      setDtiFile(file)

      const uniqueFileName = `${Date.now()}-${file.name}`
      setFormData((prevFormData) => ({ ...prevFormData, documentDTI: uniqueFileName }))
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        try {
          await uploadShopBgMutation({
            fileName: uniqueFileName,
            data: base64String,
            targetDirectory: "dti",
          })
        } catch (error) {
          console.error("file upload failed:", error)
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFilePermit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please upload a PDF or an Image.")
        event.target.value = ""
        return
      }
      setPermitFile(file)

      const uniqueFileName = `${Date.now()}-${file.name}`
      setFormData((prevFormData) => ({ ...prevFormData, documentPermit: uniqueFileName }))
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        try {
          await uploadShopBgMutation({
            fileName: uniqueFileName,
            data: base64String,
            targetDirectory: "permit",
          })
        } catch (error) {
          console.error("file upload failed:", error)
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileTax = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf" && !file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please upload a PDF or an Image.")
        event.target.value = ""
        return
      }
      setTaxFile(file)

      const uniqueFileName = `${Date.now()}-${file.name}`
      setFormData((prevFormData) => ({ ...prevFormData, documentTax: uniqueFileName }))
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        try {
          await uploadShopBgMutation({
            fileName: uniqueFileName,
            data: base64String,
            targetDirectory: "tax",
          })
        } catch (error) {
          console.error("file upload failed:", error)
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleNext = () => {
    if (
      formData.shopName == "" ||
      formData.email == "" ||
      formData.street == "" ||
      formData.barangay == "" ||
      formData.city == "" ||
      formData.province == "" ||
      formData.country == "" ||
      formData.zipCode == "" ||
      formData.contact == ""
    ) {
      toast.error("Please fill all the fields")
    } else if (!formData.email.includes("@") || !formData.email.includes(".")) {
      toast.error("Please enter a valid email address")
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleNextNext = () => {
    if (!formData.documentDTI || !formData.documentPermit || !formData.documentTax) {
      toast.error("Please fill all the fields")
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0))
  }

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    try {
      await createShopMutation({
        ...formData,
      })
      router.push("/renter/shop-register/pending")
      toast.success("Shop registered successfully! Please wait for admin approval.")
      setLoading(false)
    } catch (error: any) {
      console.error("Error creating shop:", error)
      toast.error(error.message || "Failed to register shop. Please try again.")
      setLoading(false)
    }
  }

  const renderFilePreview = (file: File | null) => {
    if (!file) return null

    return (
      <Typography variant="body2" color="primary" mt={1} fontWeight="medium">
        📄 {file.name}
      </Typography>
    )
  }

  if (currentUser!.isShopRegistered) {
    return (
      <div className="w-full">
        <Card elevation={0} className="rounded-xl border border-gray-200">
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <StorefrontIcon sx={{ fontSize: 64, color: "#1b2a80", mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Shop Already Registered
            </Typography>
            <Typography color="text.secondary" mb={4}>
              You have already registered a shop with this account.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => router.push("/shop")}
            >
              Go to Shop Dashboard
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Card elevation={0} className="rounded-xl border border-gray-200">
        <div className="p-6">
          <Stepper activeStep={activeStep} alternativeLabel className="mb-12">
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <form className="flex flex-col gap-6">
            {activeStep === 0 && (
              <div className="flex flex-col gap-6">
                <Typography variant="h6" className="font-bold text-gray-700 border-b pb-2">
                  Shop Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Shop Name"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Shop Email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      label="Description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      fullWidth
                      variant="outlined"
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" className="font-bold text-gray-700 border-b pb-2 mt-4">
                  Address Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Street Address"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel id="barangay-label">Barangay</InputLabel>
                      <Select
                        labelId="barangay-label"
                        id="barangay"
                        name="barangay"
                        value={formData.barangay}
                        label="Barangay"
                        onChange={handleChange as any}
                      >
                        {barangays.map((bg: any) => (
                          <MenuItem key={bg.id} value={bg.name}>
                            {bg.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      fullWidth
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Zip Code"
                      type="number"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      fullWidth
                      disabled
                    />
                  </Grid>
                </Grid>

                <Typography variant="h6" className="font-bold text-gray-700 border-b pb-2 mt-4">
                  Contact Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      required
                      label="Phone Number"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Facebook Link (Optional)"
                      name="linkFacebook"
                      value={formData.linkFacebook}
                      onChange={handleChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <div className="flex justify-end mt-6">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    size="large"
                    sx={{ px: 5, py: 1.5, borderRadius: 2 }}
                  >
                    Next Step
                  </Button>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="max-w-3xl mx-auto w-full">
                <Typography
                  variant="h6"
                  textAlign="center"
                  fontWeight="bold"
                  gutterBottom
                  className="mb-8 text-gray-700"
                >
                  Upload Required Documents
                </Typography>

                {/* DTI Document */}
                <Box mb={4}>
                  <Typography fontWeight="bold" color="text.secondary" mb={1}>
                    DTI Certificate
                  </Typography>
                  <label htmlFor="documentDTI">
                    <Box
                      sx={{
                        border: "2px dashed #ccc",
                        borderRadius: 2,
                        padding: 4,
                        textAlign: "center",
                        cursor: "pointer",
                        backgroundColor: "#f9fafb",
                        transition: "all 0.2s",
                        "&:hover": { borderColor: "#1b2a80", backgroundColor: "#f0f4ff" },
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: "#1b2a80", mb: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        {dtiFile ? "Change File" : "Click to upload or drag DTI file here"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Supported formats: PDF, JPG, PNG
                      </Typography>
                      <input
                        required
                        name="documentDTI"
                        type="file"
                        accept="application/pdf, image/*"
                        onChange={handleFileDti}
                        hidden
                        id="documentDTI"
                      />
                    </Box>
                  </label>
                  {renderFilePreview(dtiFile)}
                </Box>

                {/* Tax Clearance */}
                <Box mb={4}>
                  <Typography fontWeight="bold" color="text.secondary" mb={1}>
                    Tax Clearance
                  </Typography>
                  <label htmlFor="documentTax">
                    <Box
                      sx={{
                        border: "2px dashed #ccc",
                        borderRadius: 2,
                        padding: 4,
                        textAlign: "center",
                        cursor: "pointer",
                        backgroundColor: "#f9fafb",
                        transition: "all 0.2s",
                        "&:hover": { borderColor: "#1b2a80", backgroundColor: "#f0f4ff" },
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: "#1b2a80", mb: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        {taxFile ? "Change File" : "Click to upload or drag Tax Clearance here"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Supported formats: PDF, JPG, PNG
                      </Typography>
                      <input
                        required
                        name="documentTax"
                        type="file"
                        accept="application/pdf, image/*"
                        onChange={handleFileTax}
                        hidden
                        id="documentTax"
                      />
                    </Box>
                  </label>
                  {renderFilePreview(taxFile)}
                </Box>

                {/* Mayor's Permit */}
                <Box mb={4}>
                  <Typography fontWeight="bold" color="text.secondary" mb={1}>
                    Mayor&apos;s Permit
                  </Typography>
                  <label htmlFor="documentPermit">
                    <Box
                      sx={{
                        border: "2px dashed #ccc",
                        borderRadius: 2,
                        padding: 4,
                        textAlign: "center",
                        cursor: "pointer",
                        backgroundColor: "#f9fafb",
                        transition: "all 0.2s",
                        "&:hover": { borderColor: "#1b2a80", backgroundColor: "#f0f4ff" },
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 48, color: "#1b2a80", mb: 1 }} />
                      <Typography variant="body1" fontWeight="medium">
                        {permitFile ? "Change File" : "Click to upload or drag Mayor's Permit here"}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Supported formats: PDF, JPG, PNG
                      </Typography>
                      <input
                        required
                        name="documentPermit"
                        type="file"
                        accept="application/pdf, image/*"
                        onChange={handleFilePermit}
                        hidden
                        id="documentPermit"
                      />
                    </Box>
                  </label>
                  {renderFilePreview(permitFile)}
                </Box>

                {/* Action Buttons */}
                <Box display="flex" justifyContent="space-between" mt={6}>
                  <Button variant="outlined" onClick={handleBack} size="large" sx={{ px: 4 }}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNextNext}
                    size="large"
                    sx={{ px: 4 }}
                  >
                    Next Step
                  </Button>
                </Box>
              </div>
            )}

            {activeStep === 2 && (
              <div className="max-w-3xl mx-auto w-full">
                <Typography
                  variant="h6"
                  textAlign="center"
                  fontWeight="bold"
                  gutterBottom
                  className="mb-8 text-gray-700"
                >
                  Customize Your Shop Appearance
                </Typography>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* Shop Profile Image */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                    className="p-6 border rounded-xl bg-gray-50"
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Shop Logo / Profile
                    </Typography>

                    <div className="relative w-40 h-40 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-md">
                      {previewProfile ? (
                        <Image src={previewProfile} alt="Profile" fill className="object-cover" />
                      ) : (
                        <StorefrontIcon sx={{ fontSize: 60, color: "gray" }} />
                      )}
                    </div>

                    <Button variant="contained" component="label" size="small">
                      Upload Logo
                      <input
                        type="file"
                        name="imageProfile"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                      />
                    </Button>
                    {isUploading && <CircularProgress size={24} />}
                    {previewProfile && (
                      <Button variant="text" color="error" size="small" onClick={handleRemoveImage}>
                        Remove
                      </Button>
                    )}
                  </Box>

                  {/* Shop Background Image */}
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                    className="p-6 border rounded-xl bg-gray-50"
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      Shop Cover Photo
                    </Typography>

                    <div className="relative w-full h-40 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center border border-gray-300">
                      {previewShopBg ? (
                        <Image src={previewShopBg} alt="Cover" fill className="object-cover" />
                      ) : (
                        <Typography variant="caption" color="textSecondary">
                          No Cover Photo
                        </Typography>
                      )}
                    </div>

                    <Button variant="contained" component="label" size="small">
                      Upload Cover
                      <input
                        type="file"
                        name="imageBg"
                        accept="image/*"
                        hidden
                        onChange={handleImageChangeShopBg}
                      />
                    </Button>
                    {isUploading && <CircularProgress size={24} />}
                    {previewShopBg && (
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={handleRemoveImageShopBg}
                      >
                        Remove
                      </Button>
                    )}
                  </Box>
                </div>

                <div className="flex justify-between mt-8">
                  <Button variant="outlined" onClick={handleBack} size="large" sx={{ px: 4 }}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    size="large"
                    sx={{ px: 6, py: 1.5, borderRadius: 2 }}
                  >
                    {loading ? "Registering..." : "Submit Registration"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </Card>
    </div>
  )
}

export default FormShopRegister
