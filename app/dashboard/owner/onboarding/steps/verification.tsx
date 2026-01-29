"use client"

import { useState } from "react"
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react"

type KYCStatus = "PENDING" | "APPROVED" | "REJECTED"

export default function VerificationStep() {
  const [status] = useState<KYCStatus>("PENDING")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Business Verification</h2>
        <p className="text-sm text-gray-400">
          Upload required documents for verification.
        </p>
      </div>

      {/* Status */}
      <KYCStatusBadge status={status} />

      {/* Upload Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UploadCard
          title="Government ID Proof"
          description="Aadhaar / Passport / Driving License"
        />
        <UploadCard
          title="Business Proof"
          description="GST Certificate / Trade License"
        />
      </div>

      {/* Info */}
      <div className="bg-gray-800/40 border border-gray-700 rounded p-4 text-sm text-gray-400">
        Verification usually takes 24–48 hours. You will be notified once reviewed.
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button className="text-sm text-gray-400 hover:underline">
          ← Back
        </button>

        <button
          disabled
          className="bg-purple-600/40 cursor-not-allowed text-white px-6 py-2 rounded text-sm"
        >
          Waiting for Approval
        </button>
      </div>
    </div>
  )
}

/* ---------- Components ---------- */

function UploadCard({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 space-y-3">
      <div>
        <h4 className="text-sm font-medium">{title}</h4>
        <p className="text-xs text-gray-400">{description}</p>
      </div>

      <div className="h-32 border border-dashed border-gray-700 rounded flex flex-col items-center justify-center text-gray-500 text-xs gap-2">
        <UploadCloud size={20} />
        Click or drag file to upload
      </div>
    </div>
  )
}

function KYCStatusBadge({ status }: { status: KYCStatus }) {
  if (status === "APPROVED") {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm">
        <CheckCircle size={16} />
        Verified
      </div>
    )
  }

  if (status === "REJECTED") {
    return (
      <div className="flex items-center gap-2 text-red-400 text-sm">
        <AlertCircle size={16} />
        Rejected – Please reupload documents
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-yellow-400 text-sm">
      <AlertCircle size={16} />
      Verification Pending
    </div>
  )
}