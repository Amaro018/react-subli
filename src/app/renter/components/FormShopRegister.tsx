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
} from "@mui/material"
import { useState } from "react"
// import ImageUploadWithPreview from "./ImageUpload"
import createShop from "../../mutations/createShop"
import uploadShopBg from "../../mutations/uploadShopBg"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"

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

  return (
    <div className="p-16 w-full flex flex-col items-center gap-4">
      <h1 className="text-3xl font-semibold uppercase">Shop Register</h1>
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

      <form className="flex flex-col gap-4">
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
              />
              <TextField
                required
                label="Shop Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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
                className="w-full"
              />
            </div>
            <p className="text-center my-4 uppercase">full Address</p>
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2">
                <TextField
                  required
                  label="Street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                />
                <TextField
                  required
                  label="City"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-row gap-2">
                <TextField
                  required
                  label="Region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                />
                <TextField
                  required
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
              <TextField
                required
                label="Zip"
                type="number"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
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
          <div>
            <p className="text-center my-4 uppercase">SHOP DOCUMENTS</p>
            <div className="flex flex-col mb-4">
              <p className="font-bold text-lg">DTI :</p>
              <input
                required
                name="documentDTI"
                type="file"
                accept="application/pdf, image/*"
                onChange={handleFileDti}
              />
            </div>
            <div className="flex flex-col mb-4">
              <p className="font-bold text-lg">TAX CLEARANCE :</p>
              <input
                required
                name="documentTax"
                type="file"
                accept="application/pdf, image/*"
                onChange={handleFileTax}
              />
            </div>

            <div className="flex flex-col mb-4">
              <p className="font-bold text-lg">MAYORS PERMIT :</p>
              <input
                required
                name="documentPermit"
                type="file"
                accept="application/pdf, image/*"
                onChange={handleFilePermit}
              />
            </div>

            <div className="flex flex-row justify-end gap-2">
              <Button variant="contained" onClick={handleBack}>
                Back
              </Button>
              <Button variant="contained" color="primary" onClick={handleNextNext}>
                Next
              </Button>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div className="flex flex-col gap-4 justify-between h-96 w-full">
            <div className="flex flex-row gap-16 justify-between">
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
