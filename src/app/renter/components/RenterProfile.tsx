"use client"
import { Button, TextField } from "@mui/material"
import Image from "next/image"
import React, { ChangeEvent } from "react"
import updateRenterProfile from "../../mutations/updateRenterProfile"
import { useMutation } from "@blitzjs/rpc"
import uploadShopBg from "../../mutations/uploadShopBg"
import updateProfileImage from "../../mutations/updateProfileImage"

export default function RenterProfile(props: any) {
  const currentUser = props.currentUser

  const initialFormData = {
    firstName: currentUser.personalInfo.firstName,
    middleName: currentUser.personalInfo.middleName,
    lastName: currentUser.personalInfo.lastName,
    birthDate: currentUser.personalInfo.birthDate
      ? new Date(currentUser.personalInfo.birthDate).toISOString().substr(0, 10)
      : "",
    phoneNumber: currentUser.personalInfo.phoneNumber,
    street: currentUser.personalInfo.street,
    city: currentUser.personalInfo.city,
    region: currentUser.personalInfo.region,
    country: currentUser.personalInfo.country,
    zipCode: currentUser.personalInfo.zipCode,
  }

  const [formData, setFormData] = React.useState(initialFormData)
  const [updateMutation] = useMutation(updateRenterProfile)
  const [profileImage, setProfileImage] = React.useState(
    currentUser.profileImage
      ? `uploads/renter-profile/${currentUser.profileImage}`
      : "uploads/renter-profile/default.png"
  )
  const [uploadImageMutation] = useMutation(uploadShopBg)
  const [updateProfileImageMutation] = useMutation(updateProfileImage)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      const updatedUser = await updateMutation({
        userId: currentUser.id,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
        phoneNumber: formData.phoneNumber,
        street: formData.street,
        city: formData.city,
        region: formData.region,
        country: formData.country,
        zipCode: formData.zipCode,
      })
      window.location.reload()
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile!")
    }
  }

  const handleClick = () => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    if (input) {
      input.click()
    }
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]

      try {
        const reader = new FileReader()
        reader.onloadend = async () => {
          const base64Data = reader.result as string
          const uniqueFileName = `${Date.now()}-${file.name}`

          const uploadedImageUrl = await uploadImageMutation({
            fileName: uniqueFileName,
            data: base64Data,
            targetDirectory: "renter-profile",
          })

          setProfileImage(uploadedImageUrl)

          await updateProfileImageMutation({
            userId: currentUser.id,
            profileImage: uniqueFileName,
          })

          window.location.reload()
        }
        reader.readAsDataURL(file)
      } catch (error) {
        console.error("Error uploading profile image:", error)
        alert("Failed to upload profile image!")
      }
    }
  }

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData)

  const handleCancelChanges = () => {
    setFormData(initialFormData)
  }

  return (
    <div className="flex flex-col w-full">
      <div>
        <p>My Profile</p>
      </div>

      <div className="flex flex-row gap-4 py-4">
        <div className="flex flex-col gap-4">
          <Image
            src={`/${profileImage}`}
            alt={currentUser.profileImage}
            width={400}
            height={600}
            className="rounded-lg"
          />
          <div>
            <Button variant="contained" color="primary" onClick={handleClick} className="w-full">
              Change Image
            </Button>
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full">
          <div className="w-full flex flex-row gap-2 capitalize">
            <TextField
              required
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              required
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              required
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              fullWidth
            />
          </div>

          <div className="w-full flex flex-row gap-2">
            <TextField
              required
              label="Date of Birth"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              required
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              fullWidth
            />
          </div>

          <div className="w-full flex flex-row gap-2">
            <TextField
              required
              label="Street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              required
              label="City"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              required
              label="Region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              required
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              required
              label="Zip Code"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              fullWidth
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
        <Button
          variant="outlined"
          style={{
            backgroundColor: hasUnsavedChanges ? "red" : "transparent",
            color: hasUnsavedChanges ? "white" : "inherit",
          }}
          onClick={handleCancelChanges}
        >
          Cancel Changes
        </Button>
      </div>
    </div>
  )
}
