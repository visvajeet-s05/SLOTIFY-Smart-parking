"use client"

import Link from "next/link"

export default function ManageParkingLotPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">City Center Parking</h1>
        <p className="text-sm text-gray-400">
          Manage slots, pricing and availability
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ActionCard
          title="Slot Configuration"
          description="Define layout and slot types"
          href="slots"
        />
        <ActionCard
          title="Pricing Management"
          description="Set base & vehicle pricing"
          href="pricing"
        />
        <ActionCard
          title="Availability Calendar"
          description="Block dates & manage availability"
          href="availability"
        />
        <ActionCard
          title="Real-Time Occupancy"
          description="Monitor live slot usage"
          href="occupancy"
        />
        <ActionCard
          title="Camera Management"
          description="Monitor CCTV health and zones"
          href="cameras"
        />
      </div>

      {/* Status */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-5 text-sm">
        Status: <span className="text-green-400 font-medium">Active</span>
      </div>
    </div>
  )
}

/* ---------- Components ---------- */

function ActionCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="admin-card cursor-pointer block"
    >
      <h3 className="font-medium">{title}</h3>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </Link>
  )
}
