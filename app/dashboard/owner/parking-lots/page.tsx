"use client"

import Link from "next/link"
import { Plus, MapPin } from "lucide-react"

export default function OwnerParkingLotsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Parking Lots</h1>
          <p className="text-sm text-gray-400">
            Manage your registered parking facilities
          </p>
        </div>

        <Link
          href="/dashboard/owner/parking-lots/new"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700
                     text-white px-4 py-2 rounded-md text-sm"
        >
          <Plus size={16} />
          Add Parking Lot
        </Link>
      </div>

      {/* Parking Lot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ParkingLotCard
          name="City Center Parking"
          location="MG Road, Bengaluru"
          status="Active"
          href="/dashboard/owner/parking-lots/1"
        />

        <ParkingLotCard
          name="Airport Long Stay"
          location="Kempegowda Airport"
          status="Pending Approval"
          href="/dashboard/owner/parking-lots/2"
        />
      </div>
    </div>
  )
}

/* ---------- Components ---------- */

function ParkingLotCard({
  name,
  location,
  status,
  href,
}: {
  name: string
  location: string
  status: string
  href: string
}) {
  const statusColor =
    status === "Active"
      ? "text-green-400"
      : "text-yellow-400"

  return (
    <Link
      href={href}
      className="bg-gray-900 border border-gray-800 rounded-lg p-5
                 hover:border-purple-500 transition"
    >
      <h3 className="font-medium text-lg">{name}</h3>

      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
        <MapPin size={14} />
        {location}
      </div>

      <div className={`mt-3 text-sm font-medium ${statusColor}`}>
        {status}
      </div>
    </Link>
  )
}
