"use client"

import {
  CheckCircle,
  MapPin,
  Car,
  IndianRupee,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react"

export default function ReviewSubmitStep() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Review & Submit</h2>
        <p className="text-sm text-gray-400">
          Please review your parking setup before submitting for approval.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          icon={<MapPin />}
          title="Location"
          items={[
            "Address verified on map",
            "Entry & exit points set",
          ]}
        />

        <SummaryCard
          icon={<Car />}
          title="Parking Slots"
          items={[
            "Total slots configured",
            "EV & special slots enabled",
          ]}
        />

        <SummaryCard
          icon={<IndianRupee />}
          title="Pricing"
          items={[
            "Hourly & daily rates set",
            "Dynamic pricing enabled",
          ]}
        />

        <SummaryCard
          icon={<ShieldCheck />}
          title="Amenities"
          items={[
            "Security & CCTV enabled",
            "Covered parking available",
          ]}
        />

        <SummaryCard
          icon={<ImageIcon />}
          title="Photos"
          items={[
            "Parking entrance uploaded",
            "Layout & signage visible",
          ]}
        />
      </div>

      {/* Confirmation Notice */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-sm text-gray-400">
        <p>
          After submission, your parking lot will be reviewed by the{" "}
          <span className="text-purple-400 font-medium">Smart Parking Admin Team</span>.
        </p>
        <p className="mt-2">
          You will be notified once your listing is approved or if changes are required.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button className="text-sm text-gray-400 hover:underline">
          ← Back
        </button>

        <button
          onClick={() => alert("Submitted for Admin Approval")}
          className="flex items-center gap-2 px-6 py-3 rounded bg-purple-600 hover:bg-purple-700 text-white text-sm"
        >
          <CheckCircle size={18} />
          Submit for Approval
        </button>
      </div>
    </div>
  )
}

/* ---------- COMPONENT ---------- */

function SummaryCard({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode
  title: string
  items: string[]
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-5">
      <div className="flex items-center gap-2 mb-3 text-purple-400">
        {icon}
        title={title}
      </div>

      <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  )
}