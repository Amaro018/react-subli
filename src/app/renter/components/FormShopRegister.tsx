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
  CardContent,
  Card,
  Avatar,
} from "@mui/material"
import { useState } from "react"
// import ImageUploadWithPreview from "./ImageUpload"
import createShop from "../../mutations/createShop"
import uploadShopBg from "../../mutations/uploadShopBg"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import ErrorMessage from "./ErrorMessage"

const FormShopRegister = (props: { currentUser: any }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const [uploadShopBgMutation] = useMutation(uploadShopBg)
  const [createShopMutation] = useMutation(createShop)
  const currentUser = props.currentUser
  const [imageProfile, setImageProfile] = useState(null)
  const [previewProfile, setPreviewProfile] = useState<string | null>(null)
  const [imageShopBg, setImageShopBg] = useState<string | null>(null)
  // const [documentDTI, setDocumentDTI] = useState<string | null>(null)
  // const [documentPermit, setDocumentPermit] = useState<string | null>(null)
  const [dtiFile, setDtiFile] = useState<File | null>(null)
  const [taxFile, setTaxFile] = useState<File | null>(null)
  const [permitFile, setPermitFile] = useState<File | null>(null)
  const [previewShopBg, setPreviewShopBg] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleImageChangeShopBg = (event) => {
    const file = event.target.files?.[0]
    if (file) {
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
    {
      setImageShopBg(null)
      setPreviewShopBg(null)
    }
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (file) {
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

  const handleFileDti = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setDtiFile(file)

      const uniqueFileName = `${Date.now()}-${file.name}`
      setFormData((prevFormData) => ({ ...prevFormData, documentDTI: uniqueFileName }))
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        try {
          const fileUrl = await uploadShopBgMutation({
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

  const handleFilePermit = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setPermitFile(file)

      const uniqueFileName = `${Date.now()}-${file.name}`
      setFormData((prevFormData) => ({ ...prevFormData, documentPermit: uniqueFileName }))
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        try {
          const fileUrl = await uploadShopBgMutation({
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

  const handleFileTax = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setTaxFile(file)

      const uniqueFileName = `${Date.now()}-${file.name}`
      setFormData((prevFormData) => ({ ...prevFormData, documentTax: uniqueFileName }))
      setIsUploading(true)
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string

        try {
          const fileUrl = await uploadShopBgMutation({
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

  const steps = ["SHOP DETAILS", "SHOP DOCUMENTS", "SHOP PROFILE"]
  const [activeStep, setActiveStep] = useState(0)
  const [formData, setFormData] = useState({
    userId: currentUser.id,
    shopName: "",
    email: "",
    street: "",
    city: "",
    region: "",
    country: "",
    zipCode: "",
    contact: "",
    description: "",
    imageProfile: "",
    linkFacebook: "",
    imageBg: "",
    documentDTI: "",
    documentPermit: "",
    documentTax: "",
  })

  const handleNext = () => {
    if (
      formData.shopName == "" ||
      formData.email == "" ||
      formData.street == "" ||
      formData.city == "" ||
      formData.region == "" ||
      formData.country == "" ||
      formData.zipCode == "" ||
      formData.contact == ""
    ) {
      alert("Please fill all the fields")
    } else if (!formData.email.includes("@") || !formData.email.includes(".")) {
      alert("Please enter a valid email address")
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  }

  const handleNextNext = () => {
    if (
      formData.documentDTI == null ||
      formData.documentPermit == null ||
      formData.documentTax == null
    ) {
      alert("Please fill all the fields")
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
    console.log(formData)

    try {
      const newShop = await createShopMutation(formData)
      console.log("Shop created successfully:", newShop)
      router.push("/renter/shop-register/pending")
      alert("Shop registered successfully!")
      setLoading(false)
    } catch (error) {
      console.error("Error creating shop:", error)
      alert("Failed to register shop. Please try again.")
    }
  }

  const renderFilePreview = (file: File | null) => {
    if (!file) return null

    return (
      <Typography variant="body2" color="text.secondary" mt={1}>
        📄 {file.name}
      </Typography>
    )
  }

  if (currentUser!.isShopRegistered) {
    return (
      <ErrorMessage
        message="You already have a shop registered"
        title="Already registered"
        currentUser={currentUser}
      />
    )
  }

  return (
    <div className="p-16 w-full flex flex-col items-center gap-4">
      <h1 className="text-3xl font-semibold uppercase mt-16">Shop Register</h1>
      <div className="w-full mb-8">
        <Box sx={{ width: "100%" }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </div>

      <form className="flex flex-col gap-4 w-full">
        {activeStep === 0 && (
          <div>
            <p className="text-center my-4 uppercase">SHOP DETAILS</p>
            <div className="flex flex-row gap-2">
              <TextField
                required
                label="Shop Name"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                required
                label="Shop Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
              />
            </div>
            <div className="my-4">
              <TextField
                required
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
              />
            </div>
            <p className="text-center my-4 uppercase">full Address</p>
            <div className="flex flex-row gap-2">
              <TextField
                required
                label="Street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                required
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                required
                label="Region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                required
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                fullWidth
              />

              <TextField
                required
                label="Zip"
                type="number"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                fullWidth
              />
            </div>

            <p className="text-center my-4 uppercase">CONTACT DETAILS</p>
            <div className="flex flex-col gap-2">
              <TextField
                required
                label="Phone Number"
                name="contact" // This will map to `contact` in handleSubmit
                value={formData.contact}
                onChange={handleChange}
              />
              <TextField
                label="Facebook"
                name="linkFacebook"
                value={formData.linkFacebook}
                onChange={handleChange}
              />
            </div>
            <div className="flex flex-row justify-end gap-2 mt-2">
              <Button variant="contained" color="primary" onClick={handleNext}>
                Next
              </Button>
            </div>
          </div>
        )}

        {activeStep === 1 && (
          <Card sx={{ maxWidth: 600, mx: "auto", mt: 4, boxShadow: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h5" textAlign="center" fontWeight="bold" gutterBottom>
                📄 SHOP DOCUMENTS
              </Typography>

              {/* DTI Document */}
              <Box mb={3}>
                <Typography fontWeight="bold" color="text.secondary">
                  DTI Certificate
                </Typography>
                <label htmlFor="documentDTI">
                  <Box
                    sx={{
                      border: "2px dashed #ccc",
                      borderRadius: 2,
                      padding: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      "&:hover": { borderColor: "#1976D2" },
                    }}
                  >
                    <CloudUploadIcon color="action" sx={{ fontSize: 40 }} />
                    <Typography variant="body2">
                      {dtiFile ? "File uploaded" : "Click to upload or drag file here"}
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
              <Box mb={3}>
                <Typography fontWeight="bold" color="text.secondary">
                  Tax Clearance
                </Typography>
                <label htmlFor="documentTax">
                  <Box
                    sx={{
                      border: "2px dashed #ccc",
                      borderRadius: 2,
                      padding: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      "&:hover": { borderColor: "#1976D2" },
                    }}
                  >
                    <CloudUploadIcon color="action" sx={{ fontSize: 40 }} />
                    <Typography variant="body2">
                      {taxFile ? "File uploaded" : "Click to upload or drag file here"}
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
              <Box mb={3}>
                <Typography fontWeight="bold" color="text.secondary">
                  Mayor&apos;s Permit
                </Typography>
                <label htmlFor="documentPermit">
                  <Box
                    sx={{
                      border: "2px dashed #ccc",
                      borderRadius: 2,
                      padding: 2,
                      textAlign: "center",
                      cursor: "pointer",
                      "&:hover": { borderColor: "#1976D2" },
                    }}
                  >
                    <CloudUploadIcon color="action" sx={{ fontSize: 40 }} />
                    <Typography variant="body2">
                      {permitFile ? "File uploaded" : "Click to upload or drag file here"}
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
              <Box display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="contained" color="primary" onClick={handleNextNext}>
                  Next
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && (
          <div className="flex flex-col gap-4 justify-between h-96 w-full">
            <div className="flex flex-col gap-16 justify-between">
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Typography variant="body2">Shop Profile</Typography>

                <Button variant="contained" component="label">
                  Choose Image
                  <input
                    type="file"
                    name="imageProfile"
                    accept="image/*"
                    hidden
                    onChange={handleImageChange}
                  />
                </Button>
                {isUploading && <CircularProgress />}
                {previewProfile && (
                  <Box mt={2} display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <Typography variant="body1">Preview:</Typography>
                    <Box
                      component="img"
                      src={previewProfile}
                      alt="Selected Image"
                      sx={{
                        width: "200px",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />

                    <Button variant="outlined" color="error" onClick={handleRemoveImage}>
                      Remove Image
                    </Button>
                  </Box>
                )}
              </Box>

              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Typography variant="body2">Shop Background</Typography>

                <Button variant="contained" component="label">
                  Choose Image
                  <input
                    type="file"
                    name="imageProfile"
                    accept="image/*"
                    hidden
                    onChange={handleImageChangeShopBg}
                  />
                </Button>
                {isUploading && <CircularProgress />}
                {previewShopBg && (
                  <Box mt={2} display="flex" flexDirection="column" alignItems="center" gap={1}>
                    <Typography variant="body1">Preview:</Typography>
                    <Box
                      component="img"
                      src={previewShopBg}
                      alt="Selected Image"
                      sx={{
                        width: "200px",
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />

                    <Button variant="outlined" color="error" onClick={handleRemoveImageShopBg}>
                      Remove Image
                    </Button>
                  </Box>
                )}
              </Box>
            </div>

            <div className="flex flex-row justify-center gap-2">
              <Button variant="contained" onClick={handleBack}>
                Back
              </Button>
              <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Registering..." : "Submit"}
              </Button>
            </div>
          </div>
        )}

        {/* Add conditional rendering for other steps here
        <div className="flex flex-row justify-end gap-2">
          <Button disabled={activeStep === 0} variant="contained" onClick={handleBack}>
            Back
          </Button>
          <Button variant="contained" color="primary" onClick={handleNext}>
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
          </Button>
        </div> */}
      </form>
    </div>
  )
}

export default FormShopRegister
