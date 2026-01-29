"use client"

import { useState } from "react"

export default function BusinessDetailsStep() {
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    phone: "",
    address: "",
    gst: "",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Business Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Business Name"
          value={form.businessName}
          onChange={(v) => updateField("businessName", v)}
        />
        <Input
          label="Owner Name"
          value={form.ownerName}
          onChange={(v) => updateField("ownerName", v)}
        />
        <Input
          label="Phone Number"
          value={form.phone}
          onChange={(v) => updateField("phone", v)}
        />
        <Input
          label="GST / Tax ID (Optional)"
          value={form.gst}
          onChange={(v) => updateField("gst", v)}
        />
      </div>

      <Input
        label="Business Address"
        value={form.address}
        onChange={(v) => updateField("address", v)}
      />

      <div className="flex justify-end">
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded text-sm"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-gray-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
      />
    </div>
  )
}
