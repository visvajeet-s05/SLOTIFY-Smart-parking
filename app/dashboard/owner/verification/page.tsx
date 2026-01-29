"use client"

import { useState } from "react"

export default function OwnerKYCPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!file) return alert("Upload document")

    const formData = new FormData()
    formData.append("document", file)

    setLoading(true)

    try {
      const res = await fetch("/api/owner/kyc", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        alert("KYC submitted. Await approval.")
        setFile(null)
      } else {
        alert("Upload failed")
      }
    } catch (error) {
      alert("Upload failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gray-900 border border-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold">Business Verification</h2>
      <p className="text-sm text-gray-400 mb-4">
        Upload your business registration or ID proof.
      </p>

      <input
        type="file"
        className="w-full text-sm mb-4"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        accept=".pdf,.jpg,.jpeg,.png"
      />

      <button
        onClick={submit}
        disabled={loading || !file}
        className="mt-4 w-full bg-purple-600 hover:bg-purple-700 py-2 rounded text-sm disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Submit Verification"}
      </button>
    </div>
  )
}
