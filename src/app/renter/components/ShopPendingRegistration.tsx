"use client"
import React, { useEffect } from "react"
import { useMutation, useQuery, invalidateQuery } from "@blitzjs/rpc"
import { Box, Button, Typography, TextField } from "@mui/material"
import Image from "next/image"
import PendingIcon from "@mui/icons-material/Pending"
import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import BlockIcon from "@mui/icons-material/Block"
import updateShopDocument from "../../mutations/updateShopDocument"
import CircularProgress from "@mui/material/CircularProgress"
import { useRouter } from "next/navigation"
import { toast } from "@/src/app/utils/toast"
import getShopReports from "../../queries/getShopReports"
import getCurrentUser from "../../users/queries/getCurrentUser"
import createSuspensionAppeal from "../../mutations/createSuspensionAppeal"
import ShopSuspendedView from "../components/ShopSuspendedView"

export const ShopPendingRegistration = (props: any) => {
  const router = useRouter()
  const currentUser = props.currentUser

  const [loading, setLoading] = React.useState(false)
  const [appealLoading, setAppealLoading] = React.useState(false)
  const [appealMessage, setAppealMessage] = React.useState("")
  const [reports] = useQuery(
    getShopReports,
    { shopId: currentUser?.shop?.id ?? 0 },
    {
      enabled: !!currentUser?.shop && currentUser.shop.status === "banned",
    }
  )
  const [createAppealMutation] = useMutation(createSuspensionAppeal)
  const [updateShopDocumentMutation] = useMutation(updateShopDocument)

  useEffect(() => {
    // If the user lands here and the shop is already approved,
    // invalidate the user query to update the UI (sidebar/navbar).
    if (currentUser?.shop?.status === "approved") {
      invalidateQuery(getCurrentUser, null)
    }
  }, [currentUser?.shop?.status])

  if (currentUser?.shop?.status === "approved") {
    return (
      <div className="w-full">
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <svg viewBox="0 0 24 24" className="h-10 w-10" fill="currentColor" aria-hidden="true">
                <path d="M7 18h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2zm1-6h8v2H8v-2zm0-3h8v2H8V9zm0 6h5v2H8v-2z" />
              </svg>
            </div>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Shop Already Registered
            </Typography>
            <Typography color="text.secondary" mb={4}>
              Your shop has already been approved and is ready for dashboard access.
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
        </div>
      </div>
    )
  }

  if (currentUser?.shop?.status === "banned") {
    return <ShopSuspendedView shop={currentUser.shop} />
  }

  const refreshPage = () => {
    window.location.reload()
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    docType: "dti" | "permit" | "tax"
  ) => {
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

  const handleAppeal = async () => {
    setAppealLoading(true)
    try {
      await createAppealMutation({ shopId: currentUser.shop.id, message: appealMessage })
      toast.success(
        "Your request for review has been submitted. Please wait for an admin to respond."
      )
      // You might want to refetch data that shows appeal status
      // For now, we can just disable the button or show a success state.
      // Let's just clear the message and disable the button for now.
      setAppealMessage("")
    } catch (error: any) {
      toast.error(error.message || "Failed to submit appeal. Please try again later.")
    }
    setAppealLoading(false)
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

      {currentUser.shop.status === "banned" && (
        <div className="w-full text-red-700 bg-red-50 p-6 rounded-lg border-2 border-dashed border-red-200 shadow-sm text-center">
          <BlockIcon sx={{ fontSize: 48, color: "error.main" }} className="mb-3" />
          <h3 className="text-2xl font-bold text-red-800 mb-2">Shop Suspended</h3>
          {currentUser.shop.banReason && (
            <>
              <p className="font-semibold text-red-800 mb-1">Reason for Suspension:</p>
              <p className="whitespace-pre-wrap leading-relaxed text-red-700">
                {currentUser.shop.banReason}
              </p>
            </>
          )}
          {reports && reports.length > 0 && (
            <div className="mt-6 w-full text-left">
              <h4 className="font-bold text-lg text-gray-800 mb-2 text-center">
                Anonymous Reports Leading to Suspension
              </h4>
              <div className="space-y-3 max-h-48 overflow-y-auto p-3 bg-white rounded-md border">
                {reports.map((report: any) => (
                  <div key={report.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <p className="text-sm text-gray-700">{report.reason}</p>
                    <p className="text-xs text-gray-400 text-right mt-1">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 w-full">
            <p className="text-sm text-gray-600 mb-2">
              If you believe this suspension is a mistake, you can request a review. An
              administrator will re-evaluate your shop status.
            </p>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              label="Your Appeal Message"
              placeholder="Please explain why you believe the suspension should be lifted."
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
              className="mb-4 bg-white"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAppeal}
              disabled={appealLoading || !appealMessage.trim()}
              startIcon={appealLoading ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ textTransform: "none", fontSize: "1rem", px: 4, py: 1.5 }}
            >
              {appealLoading ? "Submitting..." : "Request a Review"}
            </Button>
          </div>
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
