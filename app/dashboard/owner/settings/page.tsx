"use client"

export default function OwnerSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Business Verification</h1>
      <p className="text-gray-400 text-sm">
        Upload required documents to verify your business.
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
        <InputField label="Business Name" />
        <InputField label="GST / License Number" />
        <InputField label="Business Address" />
        <InputField label="Bank Account Number" />

        <button className="bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700">
          Save & Continue
        </button>
      </div>
    </div>
  )
}

function InputField({ label }: { label: string }) {
  return (
    <div>
      <label className="block text-sm mb-1">{label}</label>
      <input
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"
        placeholder={label}
      />
    </div>
  )
}
