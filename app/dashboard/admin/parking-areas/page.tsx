"use client"

import Link from "next/link"

const parkingAreas = [
  {
    id: "1",
    name: "City Center Mall Parking",
    owner: "ABC Parking Pvt Ltd",
    slots: 120,
    status: "PENDING",
  },
  {
    id: "2",
    name: "Airport Long Stay",
    owner: "SkyPark Ltd",
    slots: 300,
    status: "APPROVED",
  },
]

export default function AdminParkingAreasPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Parking Lot Approval</h1>
        <p className="text-sm text-gray-400">
          Review and approve parking facilities submitted by owners.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {parkingAreas.map((lot) => (
          <div key={lot.id} className="admin-card flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">{lot.name}</h3>
              <p className="text-sm text-gray-400">
                Owner: {lot.owner} • Slots: {lot.slots}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {lot.status === "PENDING" && (
                <span className="admin-badge-pending">Pending</span>
              )}
              {lot.status === "APPROVED" && (
                <span className="admin-badge-approved">Approved</span>
              )}
              {lot.status === "REJECTED" && (
                <span className="admin-badge-rejected">Rejected</span>
              )}

              <Link
                href={`/dashboard/admin/parking-areas/${lot.id}`}
                className="text-sm text-purple-400 hover:underline"
              >
                Review →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
