"use client"
import React, { useState } from "react"
import { useMutation, useQuery } from "@blitzjs/rpc"
import Image from "next/image"
import Link from "next/link"
import { Box, Button, TextField, Typography, CircularProgress } from "@mui/material"
import BlockIcon from "@mui/icons-material/Block"
import GavelIcon from "@mui/icons-material/Gavel"
import ReportProblemIcon from "@mui/icons-material/ReportProblem"
import SendIcon from "@mui/icons-material/Send"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import SupportAgentIcon from "@mui/icons-material/SupportAgent"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import CallIcon from "@mui/icons-material/Call"
import EmailIcon from "@mui/icons-material/Email"
import CancelIcon from "@mui/icons-material/Cancel"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import { toast } from "@/src/app/utils/toast"
import getShopAppeals from "../../queries/getShopAppeals"
import createSuspensionAppeal from "../../mutations/createSuspensionAppeal"
import type { SxProps } from "@mui/material"

interface OwnerShopSuspendedViewProps {
  shop: any
}

export default function OwnerShopSuspendedView({ shop }: OwnerShopSuspendedViewProps) {
  const [appealMessage, setAppealMessage] = useState("")
  const [appealLoading, setAppealLoading] = useState(false)

  const [appeals, { refetch: refetchAppeals }] = useQuery(
    getShopAppeals,
    { shopId: shop.id },
    { enabled: !!shop?.id }
  )

  const [createAppealMutation] = useMutation(createSuspensionAppeal)

  const pendingAppeal = appeals?.find((a: any) => a.status === "pending")

  const handleAppealSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!appealMessage.trim()) {
      toast.error("Please enter an appeal message before submitting.")
      return
    }

    setAppealLoading(true)
    try {
      await createAppealMutation({
        shopId: shop.id,
        message: appealMessage.trim(),
      })
      toast.success("Your appeal has been submitted to the platform administrators.")
      setAppealMessage("")
      await refetchAppeals()
    } catch (error: any) {
      toast.error(error.message || "Failed to submit appeal. Please try again.")
    } finally {
      setAppealLoading(false)
    }
  }

  const profileImageSrc = shop?.imageProfile
    ? `/uploads/shop-profile/${shop.imageProfile}`
    : "/images/default-store.png"

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 py-6 px-4">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-red-600 to-rose-700 text-white rounded-2xl px-4 py-4 shadow-lg relative overflow-hidden sm:px-5">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10 pointer-events-none">
          <BlockIcon sx={{ fontSize: 200 }} />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm">
            <GavelIcon sx={{ fontSize: 24 }} />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">
            Your Shop Has Been Suspended
          </h1>
        </div>
      </div>

      {/* Shop Summary Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm bg-gray-50 flex-shrink-0">
            <Image
              src={profileImageSrc}
              alt={shop?.shopName || "Shop"}
              fill
              className="object-cover"
              quality={100}
              priority
              unoptimized={false}
              sizes="(max-width: 640px) 80px, 96px"
            />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{shop?.shopName}</h2>
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
                <BlockIcon sx={{ fontSize: 14 }} />
                Suspended
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500">
              <span className="inline-flex items-center gap-1">
                <LocationOnIcon fontSize="inherit" className="text-gray-400" />
                {shop?.barangay}, {shop?.city}
              </span>
              <span className="inline-flex items-center gap-1">
                <CallIcon fontSize="inherit" className="text-gray-400" />
                {shop?.contact}
              </span>
              <span className="inline-flex items-center gap-1">
                <EmailIcon fontSize="inherit" className="text-gray-400" />
                {shop?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reason for Suspension Card */}
      <div className="bg-red-50/70 border border-red-200 rounded-2xl p-6 sm:p-7 flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-red-900 font-bold text-base sm:text-lg">
          <ReportProblemIcon color="error" />
          Official Reason for Suspension
        </div>
        <div className="bg-white rounded-xl p-4 border border-red-100 text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
          {shop?.banReason ||
            "Your shop was suspended due to violations of Subli platform policies and safety guidelines."}
        </div>
        <div className="text-xs text-red-600 mt-1">
          Suspended on:{" "}
          {shop?.updatedAt
            ? new Date(shop.updatedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Recently"}
        </div>
      </div>

      {/* Operational Restrictions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <CancelIcon sx={{ fontSize: 18, color: "#dc2626" }} />
            Products Suspended
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            All your shop listings have been hidden from public search, product categories, and
            marketplace results.
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <CancelIcon sx={{ fontSize: 18, color: "#dc2626" }} />
            Rentals Halted
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            New rental requests and booking transactions cannot be initiated for your shop items.
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-2">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <CheckCircleIcon sx={{ fontSize: 18, color: "#2563eb" }} />
            Renter Mode Active
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            You can still browse, rent equipment from other shops, and manage your renter orders
            normally.
          </p>
        </div>
      </div>

      {/* Appeal and Review Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Request a Review / Submit Appeal</h3>
          <p className="text-sm text-gray-500 mt-1">
            If you believe this suspension was made in error or have resolved the underlying
            compliance issues, you can submit an official appeal to the platform administration.
          </p>
        </div>

        {pendingAppeal ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-base">
              <HourglassEmptyIcon className="text-amber-600" />
              Appeal Under Review
            </div>
            <p className="text-sm text-amber-800">
              Your appeal has been received and is currently being evaluated by administrators. You
              will be notified once a determination is made.
            </p>
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-amber-100 mt-2">
              <span className="text-xs font-semibold text-gray-500 block mb-1">
                Your Submitted Message ({new Date(pendingAppeal.createdAt).toLocaleString()}):
              </span>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{pendingAppeal.message}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAppealSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Appeal Statement</label>
              <TextField
                multiline
                rows={5}
                fullWidth
                placeholder="Explain why your shop should be reinstated and describe any corrective measures you have implemented..."
                value={appealMessage}
                onChange={(e) => setAppealMessage(e.target.value)}
                disabled={appealLoading}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                  },
                }}
              />
              <span className="text-xs text-gray-400">
                Please provide clear and truthful details. Administrators typically review appeals
                within 1-3 business days.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="contained"
                disabled={appealLoading || !appealMessage.trim()}
                startIcon={
                  appealLoading ? <CircularProgress size={18} color="inherit" /> : <SendIcon />
                }
                sx={{
                  bgcolor: "#1b2a80",
                  "&:hover": { bgcolor: "#15206b" },
                  borderRadius: "10px",
                  px: 3,
                  py: 1.2,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                }}
              >
                {appealLoading ? "Submitting Appeal..." : "Submit Appeal for Review"}
              </Button>
            </div>
          </form>
        )}

        {/* Appeal History if any non-pending appeals exist */}
        {appeals && appeals.filter((a: any) => a.status !== "pending").length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-sm font-bold text-gray-700 mb-3">Previous Appeal History</h4>
            <div className="space-y-3">
              {appeals
                .filter((a: any) => a.status !== "pending")
                .map((appeal: any) => (
                  <div
                    key={appeal.id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">
                        Status: <span className="capitalize font-bold">{appeal.status}</span>
                      </span>
                      <span className="text-gray-400">
                        {new Date(appeal.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{appeal.message}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Need Help Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl shadow-xs border border-gray-200 text-blue-600">
            <SupportAgentIcon />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Need Further Assistance?</h4>
            <p className="text-xs text-gray-500">
              Contact the Subli Support Team for inquiries regarding account policies.
            </p>
          </div>
        </div>
        <a
          href="mailto:support@subli.com"
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 hover:border-blue-300 px-4 py-2 rounded-xl transition-all shadow-xs"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}
