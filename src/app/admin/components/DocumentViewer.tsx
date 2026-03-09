"use client"
import React from "react"
import Link from "next/link"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import Image from "next/image"
import CancelIcon from "@mui/icons-material/Cancel"

interface DocumentViewerProps {
  title: string
  documentUrl?: string | null
  status: "pending" | "approved" | "rejected"
  onApprove: () => void
  onReject: () => void
  showActions: boolean
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  title,
  documentUrl,
  status,
  onApprove,
  onReject,
  showActions,
}) => {
  const getStatusClass = () => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  const isPdf = documentUrl?.toLowerCase().endsWith(".pdf")

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
      {showActions && (
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-900 text-lg">{title}</span>
            <span
              className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${getStatusClass()}`}
            >
              {status}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center gap-2"
              onClick={onApprove}
            >
              <CheckCircleIcon fontSize="small" />
              Approve
            </button>
            <button
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center gap-2"
              onClick={onReject}
            >
              <CancelIcon fontSize="small" />
              Reject
            </button>
          </div>
        </div>
      )}
      <div className="p-6 bg-white min-h-[400px] flex flex-col items-center justify-center">
        {documentUrl ? (
          <div className="w-full text-center">
            {isPdf ? (
              <iframe
                src={documentUrl}
                className="w-full h-[500px] border bg-gray-50 rounded"
                title={title}
              />
            ) : (
              <div className="relative w-full h-[500px]">
                <Image
                  src={documentUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain shadow-md rounded"
                />
              </div>
            )}
            <div className="mt-4">
              <Link
                href={documentUrl as any}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
              >
                Open in new tab
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 italic">No document uploaded.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DocumentViewer
