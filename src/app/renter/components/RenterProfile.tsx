"use client"
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material"
import Image from "next/image"
import React, { ChangeEvent, useState } from "react"
import updateRenterProfile from "../../mutations/updateRenterProfile"
import { useMutation, useQuery } from "@blitzjs/rpc" // Added useQuery
import uploadShopBg from "../../mutations/uploadShopBg"
import updateProfileImage from "../../mutations/updateProfileImage"
import EditIcon from "@mui/icons-material/Edit"
import { toast } from "sonner"
import getBarangays from "../../queries/getBarangays"

export default function RenterProfile(props: any) {
  const currentUser = props.currentUser

  // 1. Properly fetch the barangays data
  const [barangays = []] = useQuery(getBarangays, null)

  const initialFormData = {
    firstName: currentUser.personalInfo.firstName,
    middleName: currentUser.personalInfo.middleName,
    lastName: currentUser.personalInfo.lastName,
    birthDate: currentUser.personalInfo.birthDate
      ? new Date(currentUser.personalInfo.birthDate).toISOString().substr(0, 10)
      : "",
    phoneNumber: currentUser.personalInfo.phoneNumber,
    street: currentUser.personalInfo.street,
    barangay: currentUser.personalInfo?.barangay || "",
    city: currentUser.personalInfo.city,
    province: currentUser.personalInfo.province,
    country: currentUser.personalInfo.country,
    zipCode: currentUser.personalInfo.zipCode,
  }

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [updateMutation] = useMutation(updateRenterProfile)
  const [profileImage, setProfileImage] = useState(
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
      await updateMutation({
        userId: currentUser.id,
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      })
      setIsEditing(false)
      toast.success("Profile updated successfully!")
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  const handleCancelChanges = () => {
    setFormData(initialFormData)
    setIsEditing(false)
  }

  const fieldProps = {
    onChange: handleInputChange,
    disabled: !isEditing,
    fullWidth: true,
    variant: "outlined" as const,
    size: "medium" as const,
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex flex-col gap-8 py-4 md:flex-row">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src={`/${profileImage}`}
            alt="Profile"
            width={200}
            height={200}
            className="aspect-square rounded-full border-4 border-gray-100 object-cover"
            priority
          />
          {isEditing && (
            <div className="w-full">
              <Button
                variant="outlined"
                color="primary"
                onClick={() =>
                  document.querySelector<HTMLInputElement>('input[type="file"]')?.click()
                }
                className="w-full"
              >
                Change Image
              </Button>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={async (e) => {
                  if (e.target.files?.[0]) {
                    const file = e.target.files[0]
                    const reader = new FileReader()
                    const uploadToast = toast.loading("Uploading image...")

                    reader.onloadend = async () => {
                      try {
                        const uniqueFileName = `${Date.now()}-${file.name}`
                        const uploadedImageUrl = await uploadImageMutation({
                          fileName: uniqueFileName,
                          data: reader.result as string,
                          targetDirectory: "renter-profile",
                        })

                        setProfileImage(uploadedImageUrl)

                        await updateProfileImageMutation({
                          userId: currentUser.id,
                          profileImage: uniqueFileName,
                        })

                        toast.success("Profile image updated!", { id: uploadToast })
                        setTimeout(() => window.location.reload(), 1500)
                      } catch (error) {
                        toast.error("Upload failed", { id: uploadToast })
                      }
                    }
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Input Fields Section */}
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col gap-2 md:flex-row">
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              {...fieldProps}
            />
            <TextField
              label="Middle Name"
              name="middleName"
              value={formData.middleName}
              {...fieldProps}
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              {...fieldProps}
            />
          </div>

          <div className="flex flex-col gap-2 md:flex-row">
            <TextField
              label="Date of Birth"
              name="birthDate"
              type="date"
              value={formData.birthDate}
              InputLabelProps={{ shrink: true }}
              {...fieldProps}
            />
            <TextField
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              {...fieldProps}
            />
          </div>

          <div className="flex flex-col gap-2 md:flex-row">
            <TextField label="Street" name="street" value={formData.street} {...fieldProps} />
            <FormControl fullWidth size="medium" disabled={!isEditing}>
              <InputLabel>Barangay</InputLabel>
              <Select
                value={formData.barangay}
                label="Barangay"
                name="barangay"
                {...fieldProps}
                onChange={(e) => {
                  const selectedBarangay = barangays.find((b: any) => b.name === e.target.value)
                  setFormData((prev) => ({
                    ...prev,
                    barangay: e.target.value as string,
                    zipCode: selectedBarangay?.zipCode || prev.zipCode,
                  }))
                }}
              >
                {barangays.map((b) => (
                  <MenuItem key={b.id} value={b.name}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="City" name="city" value={formData.city} {...fieldProps} disabled />
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <TextField
              label="Province"
              name="province"
              value={formData.province}
              {...fieldProps}
              disabled
            />
            <TextField
              label="Country"
              name="country"
              value={formData.country}
              {...fieldProps}
              disabled
            />
            <TextField
              label="Zip Code"
              name="zipCode"
              value={formData.zipCode}
              {...fieldProps}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-end gap-2 border-t pt-4">
        {!isEditing ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <>
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Save Changes
            </Button>
            <Button variant="outlined" color="error" onClick={handleCancelChanges}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
