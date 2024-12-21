"use client"
import React from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Box, Button, Typography } from "@mui/material"
import Image from "next/image"
import Link from "next/link"
import PendingIcon from "@mui/icons-material/Pending"
import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import updateShopDocument from "../../mutations/updateShopDocument"
import uploadShopBg from "../../mutations/uploadShopBg"
import CircularProgress from "@mui/material/CircularProgress"

import { set } from "zod"
export const ShopPendingRegistration = (props: any) => {
  const currentUser = props.currentUser
  console.log("current user", currentUser)

  const [loading, setLoading] = React.useState(false)
  const [updateShopDocumentMutation] = useMutation(updateShopDocument)
  const [uploadDocument] = useMutation(uploadShopBg)

  const refeshPage = () => {
    window.location.reload()
  }

  const handleFileDti = async (event: any) => {
    const file = event.target.files?.[0]
    if (file) {
      const uniqueFileName = `${Date.now()}-${file.name}`
      const reader = new FileReader()
      setLoading(true)
      reader.onloadend = async () => {
        const base64String = reader.result as string
        try {
          const fileUrl = await uploadDocument({
            fileName: uniqueFileName,
            data: base64String,
            targetDirectory: "dti",
          })

          await updateShopDocumentMutation({
            shopId: currentUser.shop.id,
            documentDTI: uniqueFileName,
            dtiStatus: "pending",
          })

          alert("Document updated successfully")
        } catch (error) {
          console.error("File upload or update failed:", error)
        }

        refeshPage()
        setLoading(false)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleFilePermit = async (event: any) => {
    const file = event.target.files?.[0]
    if (file) {
      const uniqueFileName = `${Date.now()}-${file.name}`
      const reader = new FileReader()
      setLoading(true)
      reader.onloadend = async () => {
        const base64String = reader.result as string
        try {
          const fileUrl = await uploadDocument({
            fileName: uniqueFileName,
            data: base64String,
            targetDirectory: "permit",
          })

          await updateShopDocumentMutation({
            shopId: currentUser.shop.id,
            documentPermit: uniqueFileName,
            permitStatus: "pending",
          })

          alert("Document updated successfully")
        } catch (error) {
          console.error("File upload or update failed:", error)
        }

        refeshPage()
        setLoading(false)
      }

      reader.readAsDataURL(file)
    }
  }

  const handleFileTax = async (event: any) => {
    const file = event.target.files?.[0]
    if (file) {
      const uniqueFileName = `${Date.now()}-${file.name}`
      const reader = new FileReader()
      setLoading(true)
      reader.onloadend = async () => {
        const base64String = reader.result as string
        try {
          const fileUrl = await uploadDocument({
            fileName: uniqueFileName,
            data: base64String,
            targetDirectory: "tax",
          })

          await updateShopDocumentMutation({
            shopId: currentUser.shop.id,
            documentTax: uniqueFileName,
            taxStatus: "pending",
          })

          alert("Document updated successfully")
        } catch (error) {
          console.error("File upload or update failed:", error)
        }

        refeshPage()
        setLoading(false)
      }

      reader.readAsDataURL(file)
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <CircularProgress size={100} />
      </Box>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between border-b border-slate-500 py-2">
        <div className="flex flex-row gap-2">
          <Image
            src={`/uploads/shop-profile/${currentUser.shop.imageProfile}`}
            alt="Shop Image"
            width={100}
            height={100}
            className="rounded-lg"
          />
          <div className="flex flex-col capitalize justify-between">
            <p className="font-bold text-2xl">{currentUser.shop.shopName}</p>
            <p>{currentUser.shop.contact}</p>
            <p>
              {currentUser.shop.street}, {currentUser.shop.city}, {currentUser.shop.region},{" "}
              {currentUser.shop.country}, {currentUser.shop.zipCode}
            </p>
            <p>{currentUser.shop.description}</p>
          </div>
        </div>
        <div>
          <p className="p-2 text-white bg-red-500 rounded-lg">{currentUser.shop.status}</p>
        </div>
      </div>

      <div>
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="text-center py-3">
                Document Name
              </th>
              <th scope="col" className="text-center py-3">
                Document
              </th>
              <th scope="col" className="text-center py-3">
                Status
              </th>
              <th scope="col" className="text-center py-3">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <th
                scope="row"
                className="text-center py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                DTI
              </th>
              <td className="text-center py-4">
                <a
                  href={`/uploads/dti/${currentUser.shop.documentDTI}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </td>
              <td className="text-center py-4">
                {currentUser.shop.dtiStatus === "pending" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-red-500" />
                    <p>pending</p>
                  </div>
                ) : currentUser.shop.dtiStatus === "approved" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <CheckCircleIcon className="text-green-500" />
                    <p>approved</p>
                  </div>
                ) : (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <CancelIcon className="text-red-500" />
                    <p>rejected</p>
                  </div>
                )}
              </td>
              <td className="text-center py-4">
                <input
                  required
                  name="documentDTI"
                  id="documentDTI"
                  type="file"
                  accept="application/pdf, image/*"
                  onChange={handleFileDti}
                  hidden
                />
                <Button
                  variant="contained"
                  onClick={() => document.getElementById("documentDTI")?.click()}
                >
                  update
                </Button>
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <th
                scope="row"
                className="text-center py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                Mayors Permit
              </th>
              <td className="text-center py-4">
                <a
                  href={`/uploads/permit/${currentUser.shop.documentPermit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </td>
              <td className="text-center py-4">
                {currentUser.shop.permitStatus === "pending" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-red-500" />
                    <p>pending</p>
                  </div>
                ) : currentUser.shop.permitStatus === "approved" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <CheckCircleIcon className="text-green-500" />
                    <p>approved</p>
                  </div>
                ) : (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <CancelIcon className="text-red-500" />
                    <p>rejected</p>
                  </div>
                )}
              </td>
              <td className="text-center py-4">
                <input
                  required
                  name="documentPermit"
                  id="documentPermit"
                  type="file"
                  accept="application/pdf, image/*"
                  onChange={handleFilePermit}
                  hidden
                />
                <Button
                  variant="contained"
                  onClick={() => document.getElementById("documentPermit")?.click()}
                >
                  update
                </Button>
              </td>
            </tr>

            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <th
                scope="row"
                className="text-center py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
              >
                Tax Clearance
              </th>
              <td className="text-center py-4">
                <a
                  href={`/uploads/tax/${currentUser.shop.documentTax}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </td>
              <td className="text-center py-4">
                {currentUser.shop.taxStatus === "pending" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-red-500" />
                    <p>pending</p>
                  </div>
                ) : currentUser.shop.taxStatus === "approved" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <CheckCircleIcon className="text-green-500" />
                    <p>approved</p>
                  </div>
                ) : (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <CancelIcon className="text-red-500" />
                    <p>rejected</p>
                  </div>
                )}
              </td>
              <td className="text-center py-4">
                <input
                  required
                  name="documentTax"
                  id="documentTax"
                  type="file"
                  accept="application/pdf, image/*"
                  onChange={handleFileTax}
                  hidden
                />
                <Button
                  variant="contained"
                  onClick={() => document.getElementById("documentTax")?.click()}
                >
                  update
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
