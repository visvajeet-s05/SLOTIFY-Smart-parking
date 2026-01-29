"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ParkingApprovalPage() {
  const router = useRouter()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Parking Lot Review</h1>
        <p className="text-sm text-gray-400">
          Verify parking details before approval.
        </p>
      </div>

      <div className="admin-card space-y-4">
        <div>
          <h3 className="text-lg font-medium">City Center Mall Parking</h3>
          <p className="text-sm text-gray-400">Owner: ABC Parking Pvt Ltd</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>📍 Location: Downtown Area</div>
          <div>🚗 Total Slots: 120</div>
          <div>⚡ EV Charging: Yes</div>
          <div>🛡 CCTV Enabled: Yes</div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => router.push("/dashboard/admin/parking-areas")}
          >
            Approve
          </Button>

          <Button
            variant="destructive"
            onClick={() => router.push("/dashboard/admin/parking-areas")}
          >
            Reject
          </Button>

          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  )
}

