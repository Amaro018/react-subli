"use client"
import React from "react"
import { useMutation } from "@blitzjs/rpc"
import { Box, Button, Typography } from "@mui/material"
import Image from "next/image"
import PendingIcon from "@mui/icons-material/Pending"
import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import updateShopDocument from "../../mutations/updateShopDocument"
import CircularProgress from "@mui/material/CircularProgress"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export const ShopPendingRegistration = (props: any) => {
  const router = useRouter()
  const currentUser = props.currentUser

  const [loading, setLoading] = React.useState(false)
  const [updateShopDocumentMutation] = useMutation(updateShopDocument)

  const refreshPage = () => {
    window.location.reload()
  }

  const handleFileChange = async (event: any, docType: "dti" | "permit" | "tax") => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (file) {
      const fileName = file.name
      const reader = new FileReader()
      setLoading(true)
      reader.onloadend = async () => {
        const base64String = reader.result as string
        try {
          const updatePayload: any = {
            shopId: currentUser.shop.id,
          }

          if (docType === "dti") {
            updatePayload.documentDTI = fileName
            updatePayload.dtiFile = base64String
            updatePayload.dtiStatus = "resubmit"
          } else if (docType === "permit") {
            updatePayload.documentPermit = fileName
            updatePayload.permitFile = base64String
            updatePayload.permitStatus = "resubmit"
          } else if (docType === "tax") {
            updatePayload.documentTax = fileName
            updatePayload.taxFile = base64String
            updatePayload.taxStatus = "resubmit"
          }

          await updateShopDocumentMutation(updatePayload)

          toast.success("Document updated successfully. Admin has been notified.")
        } catch (error) {
          console.error("File upload or update failed:", error)
          toast.error("Failed to update document. Please try again.")
        }

        refreshPage()
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
          minHeight: "50vh",
        }}
      >
        <CircularProgress size={100} />
      </Box>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Shop Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-200 pb-6 gap-4 bg-white rounded-lg p-6 shadow-sm">
        <div className="flex flex-row gap-6 items-center">
          <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            <Image
              src={`/uploads/shop-profile/${currentUser.shop.imageProfile}`}
              alt="Shop Image"
              fill
              sizes="128px"
              className="object-contain"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-bold text-2xl text-gray-900 capitalize">
                {currentUser.shop.shopName}
              </h2>
              <span
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm ${
                  currentUser.shop.status === "approved"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : currentUser.shop.status === "rejected"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                }`}
              >
                {currentUser.shop.status}
              </span>
            </div>
            <div className="text-sm text-gray-600 mt-1 space-y-1">
              <p className="flex items-center gap-2">
                <span className="font-medium">Contact:</span> {currentUser.shop.contact}
              </p>
              <p className="flex items-center gap-2">
                <span className="font-medium">Email:</span> {currentUser.shop.email}
              </p>
              <p className="capitalize text-gray-500">
                {currentUser.shop.street}, {currentUser.shop.city}, {currentUser.shop.province},{" "}
                {currentUser.shop.country}, {currentUser.shop.zipCode}
              </p>
              {currentUser.shop.description && (
                <p className="text-gray-500 italic mt-1">
                  &quot;{currentUser.shop.description}&quot;
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {currentUser.shop.status === "rejected" && currentUser.shop.rejectionReason && (
        <div className="w-full text-red-700 text-sm bg-red-50 p-4 rounded-md border border-red-200 shadow-sm">
          <span className="font-bold block mb-1 text-base">Rejection Reason:</span>
          <p className="whitespace-pre-wrap leading-relaxed">{currentUser.shop.rejectionReason}</p>
        </div>
      )}

      {/* Documents Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-semibold">Document Name</th>
              <th className="px-6 py-3 font-semibold text-center">Document</th>
              <th className="px-6 py-3 font-semibold text-center">Status</th>
              <th className="px-6 py-3 font-semibold text-center">Note</th>
              <th className="px-6 py-3 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr className="bg-white hover:bg-gray-50 transition-colors">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                DTI Certificate
              </th>
              <td className="px-6 py-4 text-center">
                <a
                  href={`/uploads/dti/${currentUser.shop.documentDTI}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </td>
              <td className="px-6 py-4 text-center">
                {currentUser.shop.dtiStatus === "pending" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-yellow-500" />
                    <p>pending</p>
                  </div>
                ) : currentUser.shop.dtiStatus === "resubmit" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-blue-500" />
                    <p>resubmitted</p>
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
              <td className="px-6 py-4 text-center">
                {currentUser.shop.dtiNotes === "pending" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-red-500" />
                    <p>pending</p>
                  </div>
                ) : (
                  <div
                    className="max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis mx-auto"
                    title={currentUser.shop.dtiNotes}
                  >
                    {currentUser.shop.dtiNotes}
                  </div>
                )}
              </td>

              <td className="px-6 py-4 text-center">
                {currentUser.shop.dtiStatus !== "approved" && (
                  <>
                    <input
                      required
                      name="documentDTI"
                      id="documentDTI"
                      type="file"
                      accept="application/pdf, image/*"
                      onChange={(e) => handleFileChange(e, "dti")}
                      hidden
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => document.getElementById("documentDTI")?.click()}
                    >
                      update
                    </Button>
                  </>
                )}
              </td>
            </tr>

            <tr className="bg-white hover:bg-gray-50 transition-colors">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                Mayor&apos;s Permit
              </th>
              <td className="px-6 py-4 text-center">
                <a
                  href={`/uploads/permit/${currentUser.shop.documentPermit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </td>
              <td className="px-6 py-4 text-center">
                {currentUser.shop.permitStatus === "pending" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-yellow-500" />
                    <p>pending</p>
                  </div>
                ) : currentUser.shop.permitStatus === "resubmit" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-blue-500" />
                    <p>resubmitted</p>
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
              <td className="px-6 py-4 text-center">
                {currentUser.shop.permitNotes === "pending" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-red-500" />
                    <p>pending</p>
                  </div>
                ) : (
                  <div
                    className="max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis mx-auto"
                    title={currentUser.shop.permitNotes}
                  >
                    {currentUser.shop.permitNotes}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                {currentUser.shop.permitStatus !== "approved" && (
                  <>
                    <input
                      required
                      name="documentPermit"
                      id="documentPermit"
                      type="file"
                      accept="application/pdf, image/*"
                      onChange={(e) => handleFileChange(e, "permit")}
                      hidden
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => document.getElementById("documentPermit")?.click()}
                    >
                      update
                    </Button>
                  </>
                )}
              </td>
            </tr>

            <tr className="bg-white hover:bg-gray-50 transition-colors">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                Tax Clearance
              </th>
              <td className="px-6 py-4 text-center">
                <a
                  href={`/uploads/tax/${currentUser.shop.documentTax}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              </td>
              <td className="px-6 py-4 text-center">
                {currentUser.shop.taxStatus === "pending" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-yellow-500" />
                    <p>pending</p>
                  </div>
                ) : currentUser.shop.taxStatus === "resubmit" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-blue-500" />
                    <p>resubmitted</p>
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
              <td className="px-6 py-4 text-center">
                {currentUser.shop.taxNotes === "pending" ? (
                  <div className="flex flex-row justify-center gap-2 items-center">
                    <PendingIcon className="text-red-500" />
                    <p>pending</p>
                  </div>
                ) : (
                  <div
                    className="max-w-[100px] overflow-hidden whitespace-nowrap text-ellipsis mx-auto"
                    title={currentUser.shop.taxNotes}
                  >
                    {currentUser.shop.taxNotes}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-center">
                {currentUser.shop.taxStatus !== "approved" && (
                  <>
                    <input
                      required
                      name="documentTax"
                      id="documentTax"
                      type="file"
                      accept="application/pdf, image/*"
                      onChange={(e) => handleFileChange(e, "tax")}
                      hidden
                    />
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => document.getElementById("documentTax")?.click()}
                    >
                      update
                    </Button>
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
