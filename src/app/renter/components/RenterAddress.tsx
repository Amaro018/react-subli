"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { toast } from "sonner"
import {
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material"

import getUserAddresses from "../../queries/getUserAddresses"
import addAddress from "../../mutations/addAddress"
import updateAddress from "../../mutations/updateAddress"
import deleteAddress from "../../mutations/deleteAddress"
import setDefaultAddress from "../../mutations/setDefaultAddress"
import setHomeAddressDefault from "../../mutations/setHomeAddressDefault"
import getBarangays from "../../queries/getBarangays"
import AddressList from "./AddressList"

interface Address {
  id: string
  street: string
  barangay: string
  city: string
  province: string
  country: string
  zipCode: string
  isDefault: boolean
}

export default function RenterAddress({ currentUser }: { currentUser: any }) {
  const [barangays = []] = useQuery(getBarangays, null)
  const [dbAddresses, { refetch, isLoading }] = useQuery(getUserAddresses, {
    userId: String(currentUser.id),
  })
  const [addAddressMutation] = useMutation(addAddress)
  const [updateAddressMutation] = useMutation(updateAddress)
  const [deleteAddressMutation] = useMutation(deleteAddress)
  const [setDefaultAddressMutation] = useMutation(setDefaultAddress)
  const [setHomeAddressDefaultMutation] = useMutation(setHomeAddressDefault)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    street: "",
    barangay: "",
    city: "Legazpi City",
    province: "Albay",
    country: "Philippines",
    zipCode: "4500",
  })

  const getDisplayAddresses = (): Address[] => {
    const addresses = dbAddresses || []
    const displayList: Address[] = []

    if (currentUser?.personalInfo) {
      const { street, barangay, city, province, country, zipCode } = currentUser.personalInfo
      if (street || barangay || city || province || country || zipCode) {
        const hasDbDefault = (addresses as any[]).some((addr) => addr.isDefault)

        displayList.push({
          id: "personal-info-address",
          street: street || "",
          barangay: barangay || "",
          city: city || "",
          province: province || "",
          country: country || "",
          zipCode: zipCode || "",
          isDefault: !hasDbDefault,
        })
      }
    }

    if (addresses.length > 0) {
      displayList.push(...(addresses as unknown as Address[]))
    }

    return displayList
  }

  const displayAddresses = getDisplayAddresses()
  const addedAddressesCount = (dbAddresses as any[])?.length || 0

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name as string]: value }))
  }

  const resetForm = () => {
    setFormData({
      street: "",
      barangay: "",
      city: "Legazpi City",
      province: "Albay",
      country: "Philippines",
      zipCode: "4500",
    })
    setEditingId(null)
    setIsFormOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingId && editingId !== "personal-info-address") {
        await updateAddressMutation({ id: String(editingId), ...formData })
        toast.success("Address updated successfully!")
      } else {
        await addAddressMutation({
          userId: String(currentUser.id),
          ...formData,
          isDefault: false,
        })
        toast.success("Address added successfully!")
      }
      resetForm()
      await refetch()
    } catch (error) {
      console.error(error)
      toast.error("Failed to save address.")
    }
  }

  const handleEdit = (addr: Address) => {
    if (addr.id === "personal-info-address") {
      toast.info("This is your profile address. Add a new address to manage it separately.")
      resetForm()
      setIsFormOpen(true)
      return
    }
    setFormData({
      street: addr.street,
      barangay: addr.barangay,
      city: addr.city,
      province: addr.province,
      country: addr.country,
      zipCode: addr.zipCode,
    })
    setEditingId(addr.id)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    if (id === "personal-info-address") return
    setAddressToDelete(id)
    setIsConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!addressToDelete) return
    try {
      await deleteAddressMutation({ id: String(addressToDelete) })
      toast.success("Address deleted.")
      await refetch()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete address.")
    } finally {
      handleCloseConfirm()
    }
  }

  const handleCloseConfirm = () => {
    setIsConfirmOpen(false)
    setAddressToDelete(null)
  }

  const handleSetDefault = async (id: string) => {
    try {
      if (id === "personal-info-address") {
        await setHomeAddressDefaultMutation({ userId: String(currentUser.id) })
      } else {
        await setDefaultAddressMutation({ id: String(id), userId: String(currentUser.id) })
      }
      toast.success("Default address updated.")
      await refetch()
    } catch (error) {
      console.error(error)
      toast.error("Failed to set default address.")
    }
  }

  if (isLoading) {
    return <div>Loading addresses...</div>
  }

  return (
    <div className="space-y-6">
      <AddressList
        addresses={displayAddresses}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onSetDefault={handleSetDefault}
      />

      {!isFormOpen && (
        <div className="flex flex-col items-end gap-2">
          {addedAddressesCount >= 3 && (
            <span className="text-xs text-red-500">
              You have reached the limit of 3 added addresses.
            </span>
          )}
          <button
            onClick={() => {
              resetForm()
              setIsFormOpen(true)
            }}
            disabled={addedAddressesCount >= 3}
            className={`rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
              addedAddressesCount >= 3
                ? "cursor-not-allowed bg-gray-400"
                : "bg-indigo-600 hover:bg-indigo-500"
            }`}
          >
            Add New Address
          </button>
        </div>
      )}

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-4 px-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              {editingId ? "Update Address" : "Add Address"}
            </h2>
            <div className="flex gap-2">
              <Button variant="outlined" color="inherit" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" type="submit">
                {editingId ? "Update Address" : "Add Address"}
              </Button>
            </div>
          </div>
          <div className="p-6">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  label="Street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>Barangay</InputLabel>
                  <Select
                    value={formData.barangay}
                    label="Barangay"
                    name="barangay"
                    onChange={(e: SelectChangeEvent) => {
                      const selectedBarangay = barangays.find((b: any) => b.name === e.target.value)
                      setFormData((prev) => ({
                        ...prev,
                        barangay: e.target.value as string,
                        zipCode: selectedBarangay?.zipCode || prev.zipCode,
                      }))
                    }}
                  >
                    {barangays.map((b: any) => (
                      <MenuItem key={b.id} value={b.name}>
                        {b.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="City" name="city" value={formData.city} fullWidth disabled />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Province"
                  name="province"
                  value={formData.province}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Country"
                  name="country"
                  value={formData.country}
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Zip Code"
                  name="zipCode"
                  value={formData.zipCode}
                  fullWidth
                  disabled
                />
              </Grid>
            </Grid>
          </div>
        </form>
      )}

      <Dialog
        open={isConfirmOpen}
        onClose={handleCloseConfirm}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Address?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this address? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
